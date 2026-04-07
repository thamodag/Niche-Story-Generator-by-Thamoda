import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Globe, 
  Layers, 
  Newspaper, 
  Stethoscope, 
  User, 
  Camera, 
  MessageSquare, 
  Video, 
  ChevronRight, 
  RefreshCw, 
  Copy, 
  Check,
  ArrowLeft,
  Loader2,
  ExternalLink,
  TrendingUp,
  BookOpen,
  ChevronDown,
  Search,
  History,
  Trash2,
  Download,
  Eye,
  Shield,
  Mic,
  Moon,
  Sun,
  LogIn,
  LogOut,
  Lock,
  Settings
} from 'lucide-react';
import { 
  fetchViralNews, 
  fetchHistoricMedicine, 
  fetchFolklore,
  fetchTraditionalCrafts,
  fetchAdviceTopics,
  fetchArmyTopics,
  fetchPodcastTopics,
  generateCharacterForNiche, 
  generateMultiAnglePrompts, 
  generateImagePrompt, 
  generateScript, 
  generateScenePrompts,
  generateVoiceOver,
  recommendSceneCount
} from './services/geminiService';
import { 
  Country, 
  Niche, 
  NewsItem, 
  MedicineItem, 
  CharacterOption, 
  MultiAnglePrompts, 
  ImagePrompt, 
  ScenePrompt,
  HistoryRecord
} from './types';
import ReactMarkdown from 'react-markdown';

type Step = 'selection' | 'content-discovery' | 'character' | 'visuals' | 'script' | 'scenes' | 'history' | 'package';

const COUNTRIES: Country[] = [
  { name: 'Sri Lanka', code: 'LK', languages: ['Sinhala', 'Tamil', 'English'] },
  { name: 'India', code: 'IN', languages: ['Hindi', 'Tamil', 'Bengali', 'Telugu', 'English'] },
  { name: 'Canada', code: 'CA', languages: ['English', 'French'] },
  { name: 'United States', code: 'US', languages: ['English', 'Spanish'] },
  { name: 'United Kingdom', code: 'GB', languages: ['English'] },
  { name: 'Australia', code: 'AU', languages: ['English'] },
  { name: 'Japan', code: 'JP', languages: ['Japanese', 'English'] },
  { name: 'Germany', code: 'DE', languages: ['German', 'English'] },
  { name: 'France', code: 'FR', languages: ['French', 'English'] },
  { name: 'China', code: 'CN', languages: ['Chinese', 'English'] },
  { name: 'Brazil', code: 'BR', languages: ['Portuguese', 'English'] },
  { name: 'Nigeria', code: 'NG', languages: ['English', 'Yoruba', 'Igbo', 'Hausa'] },
  { name: 'South Africa', code: 'ZA', languages: ['English', 'Afrikaans', 'Zulu', 'Xhosa'] },
  { name: 'United Arab Emirates', code: 'AE', languages: ['Arabic', 'English'] },
  { name: 'Russia', code: 'RU', languages: ['Russian', 'English'] },
  { name: 'Italy', code: 'IT', languages: ['Italian', 'English'] },
  { name: 'Spain', code: 'ES', languages: ['Spanish', 'English'] },
];

const NICHES: Niche[] = [
  { id: 'news', title: 'Viral News', description: 'Trending local stories & lifestyle news', icon: 'Newspaper' },
  { id: 'medicine', title: 'Historic Medicine', description: 'Traditional remedies & cultural healing', icon: 'Stethoscope' },
  { id: 'folklore', title: 'Folklore & Myths', description: 'Ancient legends and cultural stories', icon: 'BookOpen' },
  { id: 'crafts', title: 'Traditional Crafts', description: 'Heritage skills and artisan wisdom', icon: 'Layers' },
  { id: 'advice', title: 'Life Advice & Wisdom', description: 'Elderly perspective on modern life problems', icon: 'MessageSquare' },
  { id: 'army', title: 'Military & Defense', description: 'National defense, history, and modern updates', icon: 'Shield' },
  { id: 'podcast', title: 'Podcast Topics', description: 'Engaging discussions on selected trending topics', icon: 'Mic' },
];

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');

  const [currentStep, setCurrentStep] = useState<Step>('selection');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [isEditingCharacter, setIsEditingCharacter] = useState(false);
  const [isEditingContent, setIsEditingContent] = useState(false);
  const [manualInput, setManualInput] = useState({ title: '', summary: '' });
  const [showManualInput, setShowManualInput] = useState(false);

  // Selection state
  const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES[0]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>(COUNTRIES[0].languages[0]);
  const [customCountry, setCustomCountry] = useState('');
  const [isCustomCountry, setIsCustomCountry] = useState(false);
  const [selectedNiche, setSelectedNiche] = useState<Niche>(NICHES[0]);
  const [sceneCount, setSceneCount] = useState<number>(5);

  // Content state
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [medicineItems, setMedicineItems] = useState<MedicineItem[]>([]);
  const [selectedContent, setSelectedContent] = useState<NewsItem | MedicineItem | null>(null);

  // Generation state
  const [character, setCharacter] = useState<CharacterOption | null>(null);
  const [multiAnglePrompts, setMultiAnglePrompts] = useState<MultiAnglePrompts | null>(null);
  const [refinedPrompts, setRefinedPrompts] = useState<Record<string, ImagePrompt>>({});
  const [script, setScript] = useState<string>('');
  const [scriptEnglish, setScriptEnglish] = useState<string>('');
  const [scriptSinhala, setScriptSinhala] = useState<string>('');
  const [scenes, setScenes] = useState<ScenePrompt[]>([]);
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [voiceOverUrl, setVoiceOverUrl] = useState<string | null>(null);
  const [isGeneratingVoice, setIsGeneratingVoice] = useState(false);
  const [isRecommendingCount, setIsRecommendingCount] = useState(false);

  // Load history on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('lifestyle_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  // Save history when it changes
  useEffect(() => {
    localStorage.setItem('lifestyle_history', JSON.stringify(history));
  }, [history]);

  // Handle Theme
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Check for existing session
  useEffect(() => {
    const session = localStorage.getItem('app_session');
    if (session === 'active') {
      setIsAuthenticated(true);
    }
    
    const savedTheme = localStorage.getItem('app_theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const envUser = (process.env as any).VITE_APP_USERNAME || 'admin';
    const envPass = (process.env as any).VITE_APP_PASSWORD || 'password';

    if (loginForm.username === envUser && loginForm.password === envPass) {
      setIsAuthenticated(true);
      localStorage.setItem('app_session', 'active');
      setLoginError('');
    } else {
      setLoginError('Invalid username or password');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('app_session');
  };

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('app_theme', newTheme ? 'dark' : 'light');
  };

  const saveToHistory = () => {
    if (!selectedContent || !character || !script || scenes.length === 0) return;

    const newRecord: HistoryRecord = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      country: isCustomCountry ? { name: customCountry, code: 'XX', languages: [selectedLanguage] } : selectedCountry,
      language: selectedLanguage,
      niche: selectedNiche,
      content: selectedContent,
      character: character,
      script: script,
      scriptEnglish: scriptEnglish,
      scriptSinhala: scriptSinhala,
      scenes: scenes
    };

    setHistory(prev => {
      const exists = prev.some(item => 
        item.content.title === newRecord.content.title && 
        item.script === newRecord.script
      );
      if (exists) return prev;
      return [newRecord, ...prev];
    });
    setCurrentStep('package');
  };

  const autoSaveToHistory = (currentScenes: ScenePrompt[]) => {
    if (!selectedContent || !character || !script || currentScenes.length === 0) return;

    const newRecord: HistoryRecord = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      country: isCustomCountry ? { name: customCountry, code: 'XX', languages: [selectedLanguage] } : selectedCountry,
      language: selectedLanguage,
      niche: selectedNiche,
      content: selectedContent,
      character: character,
      script: script,
      scriptEnglish: scriptEnglish,
      scriptSinhala: scriptSinhala,
      scenes: currentScenes
    };

    setHistory(prev => {
      // Avoid duplicate saves for the same session
      const exists = prev.some(item => 
        item.content.title === newRecord.content.title && 
        item.script === newRecord.script
      );
      if (exists) return prev;
      return [newRecord, ...prev];
    });
  };

  const deleteHistoryItem = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const loadHistoryItem = (record: HistoryRecord) => {
    setSelectedCountry(record.country);
    setSelectedLanguage(record.language || record.country.languages[0]);
    setSelectedNiche(record.niche);
    setSelectedContent(record.content);
    setCharacter(record.character);
    setScript(record.script);
    setScriptEnglish(record.scriptEnglish || '');
    setScriptSinhala(record.scriptSinhala || '');
    setScenes(record.scenes);
    setCurrentStep('package');
  };

  const toggleSceneSelection = (idx: number) => {
    setScenes(prev => prev.map((scene, i) => 
      i === idx ? { ...scene, selected: !scene.selected } : scene
    ));
  };

  const handleStartDiscovery = async () => {
    setLoading(true);
    setError(null);
    try {
      let data: any[] = [];
      const countryToUse = isCustomCountry ? { name: customCountry, code: 'XX', languages: [selectedLanguage] } : selectedCountry;
      
      if (selectedNiche.id === 'news') {
        data = await fetchViralNews(countryToUse, selectedLanguage);
        setNewsItems(data);
      } else if (selectedNiche.id === 'medicine') {
        data = await fetchHistoricMedicine(countryToUse, selectedLanguage);
        setMedicineItems(data);
      } else if (selectedNiche.id === 'folklore') {
        data = await fetchFolklore(countryToUse, selectedLanguage);
        setMedicineItems(data);
      } else if (selectedNiche.id === 'crafts') {
        data = await fetchTraditionalCrafts(countryToUse, selectedLanguage);
        setMedicineItems(data);
      } else if (selectedNiche.id === 'advice') {
        data = await fetchAdviceTopics(countryToUse, selectedLanguage);
        setNewsItems(data);
      } else if (selectedNiche.id === 'army') {
        data = await fetchArmyTopics(countryToUse, selectedLanguage);
        setNewsItems(data);
      } else if (selectedNiche.id === 'podcast') {
        data = await fetchPodcastTopics(countryToUse, selectedLanguage);
        setNewsItems(data);
      }
      
      if (data.length === 0) {
        setError("No content found for this selection. Try another country or niche.");
      } else {
        setCurrentStep('content-discovery');
      }
    } catch (err: any) {
      console.error("Error fetching content:", err);
      setError(`System Error: ${err.message || "Failed to fetch content. Please check your connection and try again."}`);
    } finally {
      setLoading(false);
    }
  };

  const handleContentSelect = async (content: NewsItem | MedicineItem) => {
    setSelectedContent(content);
    setLoading(true);
    setError(null);
    try {
      const context = `${content.title}. ${'summary' in content ? content.summary : content.remedy}`;
      const countryToUse = isCustomCountry ? { name: customCountry, code: 'XX', languages: [selectedLanguage] } : selectedCountry;
      const char = await generateCharacterForNiche(selectedNiche, countryToUse, context);
      setCharacter(char);
      setCurrentStep('character');
    } catch (err: any) {
      console.error("Error generating character:", err);
      setError("Failed to generate character profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateVisuals = async () => {
    setLoading(true);
    setError(null);
    try {
      const context = `${selectedContent!.title}. ${'summary' in selectedContent! ? selectedContent!.summary : selectedContent!.remedy}`;
      const prompts = await generateMultiAnglePrompts(character!, context);
      setMultiAnglePrompts(prompts);
      
      // Refine the main prompt immediately
      const refined = await generateImagePrompt(prompts.main);
      setRefinedPrompts({ main: refined });
      
      setCurrentStep('visuals');
    } catch (err: any) {
      console.error("Error generating visuals:", err);
      setError(`Failed to generate visual prompts: ${err.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRefinePrompt = async (angle: keyof MultiAnglePrompts, text: string) => {
    setLoading(true);
    setError(null);
    try {
      const refined = await generateImagePrompt(text);
      setRefinedPrompts(prev => ({ ...prev, [angle]: refined }));
    } catch (err: any) {
      console.error("Error refining prompt:", err);
      setError("Failed to refine prompt.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateScript = async () => {
    setLoading(true);
    setError(null);
    try {
      const context = `${selectedContent!.title}. ${'summary' in selectedContent! ? selectedContent!.summary : selectedContent!.remedy}`;
      const countryToUse = isCustomCountry ? { name: customCountry, code: 'XX', languages: [selectedLanguage] } : selectedCountry;
      const data = await generateScript(character!, context, countryToUse, selectedNiche, selectedLanguage);
      setScript(data.script);
      setScriptEnglish(data.scriptEnglish);
      setScriptSinhala(data.scriptSinhala);
      setCurrentStep('script');
      
      // Auto-recommend scene count after script is generated
      setIsRecommendingCount(true);
      const recommended = await recommendSceneCount(data.script);
      setSceneCount(recommended);
      setIsRecommendingCount(false);
    } catch (err: any) {
      console.error("Error generating script:", err);
      setError("Failed to generate voiceover script. The topic might be restricted or the AI is busy.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateScenes = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await generateScenePrompts(character!, script, sceneCount);
      // Initialize all scenes as selected by default
      const initializedScenes = data.map(s => ({ ...s, selected: true }));
      setScenes(initializedScenes);
      autoSaveToHistory(initializedScenes);
      setCurrentStep('scenes');
    } catch (err: any) {
      console.error("Error generating scenes:", err);
      setError("Failed to generate scene-by-scene prompts.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateVoice = async () => {
    if (!script) return;
    setIsGeneratingVoice(true);
    try {
      const base64 = await generateVoiceOver(script, selectedLanguage);
      if (base64) {
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: 'audio/mpeg' });
        const url = URL.createObjectURL(blob);
        setVoiceOverUrl(url);
      }
    } catch (err) {
      console.error("Voiceover error:", err);
    } finally {
      setIsGeneratingVoice(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const reset = () => {
    setCurrentStep('selection');
    setSelectedContent(null);
    setCharacter(null);
    setMultiAnglePrompts(null);
    setRefinedPrompts({});
    setScript('');
    setScriptEnglish('');
    setScriptSinhala('');
    setScenes([]);
    setVoiceOverUrl(null);
    setError(null);
    setShowManualInput(false);
    setManualInput({ title: '', summary: '' });
  };

  const renderStepHeader = (title: string, icon: React.ReactNode, description: string) => (
    <div className="mb-12">
      <div className="flex items-center gap-4 mb-3">
        <div className="p-3 bg-ink text-paper rounded-full shadow-lg">
          {icon}
        </div>
        <h1 className="text-4xl font-serif italic font-black tracking-tight text-ink">{title}</h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="h-[1px] w-12 bg-ink/20"></div>
        <p className="text-ink/40 text-xs font-mono uppercase tracking-[0.3em] font-bold">{description}</p>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen bg-paper text-ink font-sans selection:bg-ink selection:text-paper transition-colors duration-500 ${isDarkMode ? 'dark' : ''}`}>
      {!isAuthenticated ? (
        <div className="min-h-screen flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md editorial-card p-12 space-y-10 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-ink"></div>
            
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-ink text-paper rounded-full flex items-center justify-center mx-auto mb-6">
                <Lock size={32} />
              </div>
              <h1 className="text-4xl font-black tracking-tighter uppercase">Secure Access</h1>
              <p className="micro-label !opacity-100">Niche Story Generator by Thamoda</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-8">
              <div className="space-y-4">
                <label className="micro-label">Username</label>
                <input 
                  type="text" 
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
                  className="w-full p-4 bg-ink/5 border border-ink/10 font-mono text-sm focus:outline-none focus:border-ink transition-all dark:bg-white/5"
                  placeholder="Enter username"
                  required
                />
              </div>
              <div className="space-y-4">
                <label className="micro-label">Password</label>
                <input 
                  type="password" 
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                  className="w-full p-4 bg-ink/5 border border-ink/10 font-mono text-sm focus:outline-none focus:border-ink transition-all dark:bg-white/5"
                  placeholder="Enter password"
                  required
                />
              </div>

              {loginError && (
                <p className="text-red-600 font-mono text-[10px] uppercase tracking-widest text-center">{loginError}</p>
              )}

              <div className="text-center">
                <p className="text-[10px] font-mono uppercase tracking-widest opacity-30">Hint: admin / password</p>
              </div>

              <button 
                type="submit"
                className="w-full py-6 bg-ink text-paper font-mono text-xs uppercase tracking-[0.4em] font-black hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl flex items-center justify-center gap-4"
              >
                Login <LogIn size={18} />
              </button>
            </form>

            <div className="pt-8 border-t border-ink/5 flex justify-center">
              <button 
                onClick={toggleTheme}
                className="p-3 hover:bg-ink/5 rounded-full transition-all text-ink/40 hover:text-ink"
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
          </motion.div>
        </div>
      ) : (
        <>
          {/* Sidebar / Progress */}
          <div className="fixed left-0 top-0 h-full w-20 border-r border-ink/5 flex flex-col items-center py-10 gap-12 bg-paper z-50 transition-colors duration-500">
            <div className="font-serif italic text-3xl font-black cursor-pointer hover:scale-110 transition-transform" onClick={reset}>NT.</div>
            <div className="flex flex-col gap-6">
              {[
                { step: 'selection', icon: <Globe size={22} />, label: 'Start' },
                { step: 'content-discovery', icon: <TrendingUp size={22} />, label: 'Content' },
                { step: 'character', icon: <User size={22} />, label: 'Persona' },
                { step: 'visuals', icon: <Camera size={22} />, label: 'Visuals' },
                { step: 'script', icon: <MessageSquare size={22} />, label: 'Script' },
                { step: 'scenes', icon: <Video size={22} />, label: 'Scenes' },
                { step: 'history', icon: <History size={22} />, label: 'History' },
              ].map((item) => (
                <button 
                  key={item.step}
                  onClick={() => {
                    if (item.step === 'history') setCurrentStep('history');
                    // Only allow jumping back to steps already completed
                    else if (currentStep !== 'selection' && item.step === 'selection') setCurrentStep('selection');
                  }}
                  className={`p-3 rounded-full transition-all group relative ${
                    currentStep === item.step ? 'bg-ink text-paper shadow-xl scale-110' : 'text-ink/30 hover:text-ink hover:bg-ink/5'
                  }`}
                  title={item.label}
                >
                  {item.icon}
                  <span className="absolute left-full ml-6 px-3 py-1.5 bg-ink text-paper text-[10px] uppercase tracking-[0.2em] font-bold rounded-none opacity-0 group-hover:opacity-100 pointer-events-none transition-all translate-x-[-10px] group-hover:translate-x-0 whitespace-nowrap z-[60] shadow-2xl">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-auto flex flex-col gap-4">
              <button 
                onClick={toggleTheme}
                className="p-3 hover:bg-ink/5 rounded-full transition-all text-ink/40 hover:text-ink"
                title="Toggle Theme"
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button 
                onClick={handleLogout}
                className="p-3 hover:bg-red-50 rounded-full transition-all text-ink/40 hover:text-red-600"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>

          <main className="pl-20 max-w-6xl mx-auto p-12 md:p-24">
            <header className="mb-16 flex justify-between items-center border-b border-ink/5 pb-8">
              <div>
                <h1 className="text-2xl font-black tracking-tighter uppercase leading-none">Niche Story Generator</h1>
                <p className="micro-label !opacity-100 !tracking-widest mt-1">by Thamoda</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="px-4 py-1.5 bg-ink/5 border border-ink/10 rounded-full">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-ink/40">Production Mode</span>
                </div>
              </div>
            </header>
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex justify-between items-center shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-full">
                <RefreshCw size={16} className="text-red-600" />
              </div>
              <div>
                <p className="text-xs font-mono uppercase font-bold tracking-tight">System Error</p>
                <p className="text-sm opacity-80">{error}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setError(null)} 
                className="px-3 py-1 bg-white border border-red-200 rounded text-[10px] font-mono uppercase hover:bg-red-50 transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-32 gap-4"
            >
              <Loader2 className="animate-spin text-zinc-400" size={48} strokeWidth={1} />
              <p className="font-mono text-xs uppercase tracking-widest text-zinc-500">Processing Lifestyle Data...</p>
            </motion.div>
          ) : (
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {currentStep === 'selection' && (
                <div className="space-y-16">
                  {renderStepHeader("Content Configuration", <Globe size={24} />, "Step 01 / Target Audience & Niche")}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                    <div className="space-y-8">
                      <h3 className="micro-label">Select Country</h3>
                      <div className="relative group mb-8">
                        <select
                          value={isCustomCountry ? 'custom' : selectedCountry.code}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === 'custom') {
                              setIsCustomCountry(true);
                            } else {
                              const country = COUNTRIES.find(c => c.code === val);
                              if (country) {
                                setSelectedCountry(country);
                                setIsCustomCountry(false);
                                setSelectedLanguage(country.languages[0]);
                              }
                            }
                          }}
                          className="w-full p-6 bg-white border border-ink/10 rounded-none appearance-none font-serif italic text-2xl focus:outline-none focus:border-ink transition-all cursor-pointer pr-12 shadow-sm group-hover:shadow-md"
                        >
                          {COUNTRIES.map((c) => (
                            <option key={c.code} value={c.code}>
                              {c.name}
                            </option>
                          ))}
                          <option value="custom">Other / Custom Country...</option>
                        </select>
                        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-ink/30 group-hover:text-ink transition-colors">
                          <ChevronDown size={24} />
                        </div>
                      </div>

                      <h3 className="micro-label">Select Language</h3>
                      <div className="relative group">
                        <select
                          value={selectedLanguage}
                          onChange={(e) => setSelectedLanguage(e.target.value)}
                          className="w-full p-6 bg-white border border-ink/10 rounded-none appearance-none font-serif italic text-2xl focus:outline-none focus:border-ink transition-all cursor-pointer pr-12 shadow-sm group-hover:shadow-md"
                        >
                          {Array.from(new Set([
                            ...(isCustomCountry ? [] : selectedCountry.languages),
                            selectedLanguage
                          ])).map((lang) => (
                            <option key={lang} value={lang}>
                              {lang}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-ink/30 group-hover:text-ink transition-colors">
                          <ChevronDown size={24} />
                        </div>
                      </div>

                      {isCustomCountry && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-6 bg-ink text-paper border border-ink shadow-2xl space-y-6"
                        >
                          <div>
                            <div className="flex items-center gap-3 mb-3">
                              <Globe size={16} className="text-paper/40" />
                              <span className="micro-label !text-paper/60">Custom Country Name</span>
                            </div>
                            <input 
                              type="text"
                              placeholder="Enter country name..."
                              value={customCountry}
                              onChange={(e) => setCustomCountry(e.target.value)}
                              className="w-full bg-transparent border-b border-paper/20 py-2 text-xl font-serif italic focus:outline-none focus:border-paper text-paper placeholder:text-paper/20"
                              autoFocus
                            />
                          </div>
                          <div>
                            <div className="flex items-center gap-3 mb-3">
                              <MessageSquare size={16} className="text-paper/40" />
                              <span className="micro-label !text-paper/60">Custom Language</span>
                            </div>
                            <input 
                              type="text"
                              placeholder="Enter language (e.g. Sinhala)..."
                              value={selectedLanguage}
                              onChange={(e) => setSelectedLanguage(e.target.value)}
                              className="w-full bg-transparent border-b border-paper/20 py-2 text-xl font-serif italic focus:outline-none focus:border-paper text-paper placeholder:text-paper/20"
                            />
                          </div>
                        </motion.div>
                      )}
                    </div>

                    <div className="space-y-8">
                      <h3 className="micro-label">Select Niche</h3>
                      <div className="grid grid-cols-1 gap-4">
                        {NICHES.map((n) => (
                          <button
                            key={n.id}
                            onClick={() => setSelectedNiche(n)}
                            className={`group p-8 text-left border transition-all flex items-center gap-8 relative overflow-hidden ${
                              selectedNiche.id === n.id 
                                ? 'bg-ink text-paper border-ink shadow-2xl scale-[1.02] z-10' 
                                : 'bg-white border-ink/5 hover:border-ink/20 hover:shadow-xl'
                            }`}
                          >
                            <div className={`p-4 rounded-full transition-all duration-500 ${
                              selectedNiche.id === n.id ? 'bg-paper text-ink rotate-[360deg]' : 'bg-paper/50 text-ink/20 group-hover:text-ink group-hover:bg-paper'
                            }`}>
                              {n.id === 'news' ? <Newspaper size={28} /> : 
                               n.id === 'medicine' ? <Stethoscope size={28} /> :
                               n.id === 'folklore' ? <BookOpen size={28} /> :
                               n.id === 'crafts' ? <Layers size={28} /> :
                               n.id === 'army' ? <Shield size={28} /> :
                               n.id === 'podcast' ? <Mic size={28} /> :
                               <MessageSquare size={28} />}
                            </div>
                            <div className="flex-1">
                              <div className="font-serif italic text-2xl mb-1 font-bold">{n.title}</div>
                              <div className={`micro-label transition-opacity ${
                                selectedNiche.id === n.id ? '!text-paper/40' : '!text-ink/30'
                              }`}>{n.description}</div>
                            </div>
                            {selectedNiche.id === n.id && (
                              <motion.div 
                                layoutId="active-niche"
                                className="absolute right-8"
                              >
                                <div className="p-2 bg-paper text-ink rounded-full">
                                  <Check size={18} strokeWidth={3} />
                                </div>
                              </motion.div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row gap-6 pt-8">
                    <button 
                      onClick={handleStartDiscovery}
                      className="flex-[2] py-8 bg-ink text-paper font-mono text-xs uppercase tracking-[0.3em] font-black hover:bg-ink/90 transition-all flex items-center justify-center gap-4 shadow-2xl hover:scale-[1.01] active:scale-[0.99]"
                    >
                      Discover Viral Content <ChevronRight size={18} />
                    </button>
                    <button 
                      onClick={() => setCurrentStep('history')}
                      className="flex-1 py-8 bg-white border border-ink/10 text-ink font-mono text-xs uppercase tracking-[0.3em] font-black hover:bg-ink hover:text-paper transition-all flex items-center justify-center gap-4 shadow-sm hover:shadow-xl"
                    >
                      View History <History size={18} />
                    </button>
                    <button 
                      onClick={() => {
                        setShowManualInput(true);
                        setCurrentStep('content-discovery');
                      }}
                      className="flex-1 py-8 bg-white border border-ink/10 text-ink font-mono text-xs uppercase tracking-[0.3em] font-black hover:bg-ink hover:text-paper transition-all flex items-center justify-center gap-4 shadow-sm hover:shadow-xl"
                    >
                      Manual Input <MessageSquare size={18} />
                    </button>
                  </div>
                </div>
              )}

              {currentStep === 'content-discovery' && (
                <div className="space-y-12">
                  <button 
                    onClick={() => setCurrentStep('selection')}
                    className="flex items-center gap-3 text-ink/40 hover:text-ink mb-12 transition-all group"
                  >
                    <div className="p-2 bg-ink/5 rounded-full group-hover:bg-ink group-hover:text-paper transition-all">
                      <ArrowLeft size={16} />
                    </div>
                    <span className="micro-label !opacity-100">Back to Configuration</span>
                  </button>
                  {renderStepHeader(
                    selectedNiche.title, 
                    selectedNiche.id === 'news' ? <TrendingUp size={24} /> : 
                    selectedNiche.id === 'medicine' ? <Stethoscope size={24} /> :
                    selectedNiche.id === 'folklore' ? <BookOpen size={24} /> :
                    selectedNiche.id === 'crafts' ? <Layers size={24} /> :
                    selectedNiche.id === 'army' ? <Shield size={24} /> :
                    selectedNiche.id === 'podcast' ? <Mic size={24} /> :
                    <MessageSquare size={24} />, 
                    `Step 02 / Trending in ${isCustomCountry ? customCountry : selectedCountry.name}`
                  )}
                  
                  <div className="grid grid-cols-1 gap-10">
                    {showManualInput && (
                      <div className="p-12 bg-white border border-ink shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-ink"></div>
                        <h3 className="micro-label mb-10">Create Your Own Story</h3>
                        <div className="space-y-10">
                          <div>
                            <label className="block micro-label mb-4">Story Title / Headline</label>
                            <input 
                              type="text"
                              placeholder="e.g., The Secret of the Ancient Tea"
                              value={manualInput.title}
                              onChange={(e) => setManualInput({...manualInput, title: e.target.value})}
                              className="w-full p-6 border border-ink/10 font-serif italic text-3xl focus:outline-none focus:border-ink transition-all bg-paper/30"
                            />
                          </div>
                          <div>
                            <label className="block micro-label mb-4">The Core Story / News Summary</label>
                            <textarea 
                              rows={5}
                              placeholder="Describe what happened or what the remedy is..."
                              value={manualInput.summary}
                              onChange={(e) => setManualInput({...manualInput, summary: e.target.value})}
                              className="w-full p-6 border border-ink/10 text-xl leading-relaxed focus:outline-none focus:border-ink transition-all bg-paper/30 font-serif italic"
                            />
                          </div>
                          <button 
                            disabled={!manualInput.title || !manualInput.summary}
                            onClick={() => {
                              const isNewsType = ['news', 'advice', 'army', 'podcast'].includes(selectedNiche.id);
                              const manualContent = isNewsType
                                ? { id: 'manual', title: manualInput.title, summary: manualInput.summary, sourceUrl: 'manual', viralScore: 100 } as NewsItem
                                : { id: 'manual', title: manualInput.title, remedy: manualInput.summary, culturalContext: 'Manual Input', historicalSource: 'User Provided' } as MedicineItem;
                              handleContentSelect(manualContent);
                            }}
                            className="w-full py-8 bg-ink text-paper font-mono text-xs uppercase tracking-[0.4em] font-black disabled:opacity-20 transition-all flex items-center justify-center gap-4 hover:scale-[1.01] active:scale-[0.99] shadow-xl"
                          >
                            Generate Character for this Story <ChevronRight size={20} />
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {['news', 'advice', 'army', 'podcast'].includes(selectedNiche.id) ? (
                      newsItems.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleContentSelect(item)}
                          className="editorial-card group p-12 text-left relative overflow-hidden"
                        >
                          <div className="absolute top-0 left-0 w-2 h-0 group-hover:h-full bg-ink transition-all duration-700"></div>
                          <div className="flex justify-between items-start mb-8">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-ink/5 rounded-full">
                                <TrendingUp size={16} className="text-ink/40" />
                              </div>
                              <span className="micro-label !opacity-100 text-ink/60">Viral Score: {item.viralScore}%</span>
                            </div>
                            <ExternalLink size={20} className="text-ink/10 group-hover:text-ink transition-all duration-500" />
                          </div>
                          <h3 className="text-4xl font-serif italic mb-2 group-hover:translate-x-4 transition-transform duration-500 leading-[1.1] font-black">{item.title}</h3>
                          <div className="flex flex-col gap-1 mb-6 group-hover:translate-x-4 transition-transform duration-500 delay-75">
                            {item.titleEnglish && item.titleEnglish !== item.title && (
                              <p className="text-ink/40 text-sm font-serif italic">"{item.titleEnglish}"</p>
                            )}
                            {item.titleSinhala && item.titleSinhala !== item.title && (
                              <p className="text-red-900/40 text-sm font-serif italic">"{item.titleSinhala}"</p>
                            )}
                          </div>
                          <p className="text-ink/60 text-lg leading-relaxed line-clamp-3 group-hover:text-ink transition-colors duration-500 font-serif italic mb-4">{item.summary}</p>
                          <div className="space-y-3 mb-4">
                            {item.summaryEnglish && item.summaryEnglish !== item.summary && (
                              <div className="p-4 bg-ink/5 border-l-2 border-ink/20">
                                <p className="text-ink/40 text-xs italic line-clamp-2">English: {item.summaryEnglish}</p>
                              </div>
                            )}
                            {item.summarySinhala && item.summarySinhala !== item.summary && (
                              <div className="p-4 bg-red-900/5 border-l-2 border-red-900/20">
                                <p className="text-red-900/40 text-xs italic line-clamp-2">Sinhala: {item.summarySinhala}</p>
                              </div>
                            )}
                          </div>
                          <div className="mt-12 flex items-center gap-4 text-[10px] font-mono uppercase tracking-[0.3em] text-ink font-black opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0 duration-500">
                            <div className="h-[1px] w-8 bg-ink"></div>
                            <span>Select Story</span>
                            <ChevronRight size={14} />
                          </div>
                        </button>
                      ))
                    ) : (
                      medicineItems.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleContentSelect(item)}
                          className="editorial-card group p-12 text-left relative overflow-hidden"
                        >
                          <div className="absolute top-0 left-0 w-2 h-0 group-hover:h-full bg-ink transition-all duration-700"></div>
                          <div className="flex justify-between items-start mb-8">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-ink/5 rounded-full">
                                <BookOpen size={16} className="text-ink/40" />
                              </div>
                              <span className="micro-label !opacity-100 text-ink/60">{item.historicalSource}</span>
                            </div>
                            <ChevronRight size={20} className="text-ink/10 group-hover:text-ink transition-all duration-500" />
                          </div>
                          <h3 className="text-4xl font-serif italic mb-2 group-hover:translate-x-4 transition-transform duration-500 leading-[1.1] font-black">{item.title}</h3>
                          <div className="flex flex-col gap-1 mb-6 group-hover:translate-x-4 transition-transform duration-500 delay-75">
                            {item.titleEnglish && item.titleEnglish !== item.title && (
                              <p className="text-ink/40 text-sm font-serif italic">"{item.titleEnglish}"</p>
                            )}
                            {item.titleSinhala && item.titleSinhala !== item.title && (
                              <p className="text-red-900/40 text-sm font-serif italic">"{item.titleSinhala}"</p>
                            )}
                          </div>
                          <p className="text-ink/60 text-lg leading-relaxed line-clamp-3 group-hover:text-ink transition-colors duration-500 font-serif italic mb-4">{item.remedy}</p>
                          <div className="space-y-3 mb-4">
                            {item.remedyEnglish && item.remedyEnglish !== item.remedy && (
                              <div className="p-4 bg-ink/5 border-l-2 border-ink/20">
                                <p className="text-ink/40 text-xs italic line-clamp-2">English: {item.remedyEnglish}</p>
                              </div>
                            )}
                            {item.remedySinhala && item.remedySinhala !== item.remedy && (
                              <div className="p-4 bg-red-900/5 border-l-2 border-red-900/20">
                                <p className="text-red-900/40 text-xs italic line-clamp-2">Sinhala: {item.remedySinhala}</p>
                              </div>
                            )}
                          </div>
                          <div className="mt-6 micro-label !opacity-100 text-ink/30 italic">{item.culturalContext}</div>
                          <div className="mt-12 flex items-center gap-4 text-[10px] font-mono uppercase tracking-[0.3em] text-ink font-black opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0 duration-500">
                            <div className="h-[1px] w-8 bg-ink"></div>
                            <span>Select Remedy</span>
                            <ChevronRight size={14} />
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}

              {currentStep === 'character' && character && (
                <div className="space-y-12">
                  <div className="flex justify-between items-center">
                    <button 
                      onClick={() => setCurrentStep('content-discovery')}
                      className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition-colors"
                    >
                      <ArrowLeft size={16} />
                      <span className="font-mono text-[10px] uppercase tracking-widest">Back to Content</span>
                    </button>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => setIsEditingContent(!isEditingContent)}
                        className={`px-4 py-2 border transition-all flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest shadow-sm active:scale-95 ${isEditingContent ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white border-zinc-200 hover:bg-zinc-50 text-zinc-600'}`}
                      >
                        <MessageSquare size={14} />
                        <span>{isEditingContent ? 'Save Topic' : 'Edit Topic'}</span>
                      </button>
                      <button 
                        onClick={() => setIsEditingCharacter(!isEditingCharacter)}
                        className={`px-4 py-2 border transition-all flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest shadow-sm active:scale-95 ${isEditingCharacter ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white border-zinc-200 hover:bg-zinc-50 text-zinc-600'}`}
                      >
                        <User size={14} />
                        <span>{isEditingCharacter ? 'Save Persona' : 'Edit Persona'}</span>
                      </button>
                    </div>
                  </div>
                  
                  {renderStepHeader("Storyteller Profile", <User size={24} />, "Step 03 / Cultural Persona")}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Character Card */}
                    <div className="editorial-card p-10 relative group">
                      <h4 className="micro-label mb-8">Character Profile</h4>
                      
                      {isEditingCharacter ? (
                        <div className="space-y-8">
                          <div>
                            <label className="micro-label mb-3 block">Name/Title</label>
                            <input 
                              type="text"
                              value={character.title}
                              onChange={(e) => setCharacter({...character, title: e.target.value})}
                              className="w-full p-4 border border-zinc-200 font-serif italic text-2xl focus:outline-none focus:border-zinc-900 transition-all bg-zinc-50/50"
                            />
                          </div>
                          <div>
                            <label className="micro-label mb-3 block">Description</label>
                            <textarea 
                              rows={4}
                              value={character.description}
                              onChange={(e) => setCharacter({...character, description: e.target.value})}
                              className="w-full p-4 border border-zinc-200 text-sm leading-relaxed focus:outline-none focus:border-zinc-900 transition-all bg-zinc-50/50"
                            />
                          </div>
                          <div>
                            <label className="micro-label mb-3 block">Visual Details</label>
                            <textarea 
                              rows={3}
                              value={character.visualDetails}
                              onChange={(e) => setCharacter({...character, visualDetails: e.target.value})}
                              className="w-full p-4 border border-zinc-200 text-xs italic focus:outline-none focus:border-zinc-900 transition-all bg-zinc-50/50"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <h3 className="text-3xl font-serif italic text-zinc-900 leading-tight">{character.title}</h3>
                          <p className="text-base leading-relaxed text-zinc-700">{character.description}</p>
                          <div className="bg-zinc-50 p-6 border border-zinc-100 relative">
                            <div className="absolute top-0 left-0 w-1 h-full bg-zinc-200"></div>
                            <p className="text-xs leading-relaxed text-zinc-500 italic">{character.visualDetails}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Topic Card */}
                    <div className="editorial-card p-10 relative group">
                      <h4 className="micro-label mb-8">Content Topic</h4>
                      
                      {isEditingContent ? (
                        <div className="space-y-8">
                          <div>
                            <label className="micro-label mb-3 block">Headline</label>
                            <input 
                              type="text"
                              value={selectedContent.title}
                              onChange={(e) => setSelectedContent({...selectedContent, title: e.target.value})}
                              className="w-full p-4 border border-zinc-200 font-serif italic text-2xl focus:outline-none focus:border-zinc-900 transition-all bg-zinc-50/50"
                            />
                          </div>
                          <div>
                            <label className="micro-label mb-3 block">Summary / Remedy</label>
                            <textarea 
                              rows={8}
                              value={'summary' in selectedContent ? selectedContent.summary : selectedContent.remedy}
                              onChange={(e) => {
                                if ('summary' in selectedContent) {
                                  setSelectedContent({...selectedContent, summary: e.target.value});
                                } else {
                                  setSelectedContent({...selectedContent, remedy: e.target.value});
                                }
                              }}
                              className="w-full p-4 border border-zinc-200 text-sm leading-relaxed focus:outline-none focus:border-zinc-900 transition-all bg-zinc-50/50"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <h3 className="text-3xl font-serif italic text-zinc-900 leading-tight">{selectedContent.title}</h3>
                          <div className="text-base leading-relaxed text-zinc-700 space-y-4">
                            {('summary' in selectedContent ? selectedContent.summary : selectedContent.remedy).split('\n').map((para, i) => (
                              <p key={i}>{para}</p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <button 
                    onClick={handleGenerateVisuals}
                    disabled={loading}
                    className="w-full py-8 bg-zinc-900 text-white font-mono text-xs uppercase tracking-[0.3em] hover:bg-zinc-800 transition-all flex items-center justify-center gap-4 disabled:opacity-50 shadow-xl active:scale-[0.99]"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="animate-spin" size={18} />
                        <span>Developing Visual Assets...</span>
                      </>
                    ) : (
                      <>
                        <span>Develop Visual Assets</span>
                        <ChevronRight size={20} />
                      </>
                    )}
                  </button>
                </div>
              )}

              {currentStep === 'visuals' && multiAnglePrompts && (
                <div className="space-y-12">
                  <button 
                    onClick={() => setCurrentStep('character')}
                    className="flex items-center gap-3 text-ink/40 hover:text-ink mb-12 transition-all group"
                  >
                    <div className="p-2 bg-ink/5 rounded-full group-hover:bg-ink group-hover:text-paper transition-all">
                      <ArrowLeft size={16} />
                    </div>
                    <span className="micro-label !opacity-100">Back to Character</span>
                  </button>
                  {renderStepHeader("Visual Assets", <Camera size={24} />, "Step 04 / Multi-Angle Production")}
                  
                  <div className="grid grid-cols-1 gap-10 mb-12">
                    {Object.entries(multiAnglePrompts).map(([angle, prompt]) => (
                      <div key={angle} className="editorial-card p-10 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-1 bg-ink/5 group-hover:bg-ink transition-colors duration-500"></div>
                        <div className="flex justify-between items-center mb-8 border-b border-ink/5 pb-6">
                          <h3 className="micro-label !opacity-100 text-ink font-black">{angle.replace(/([A-Z])/g, ' $1')}</h3>
                          <div className="flex gap-4">
                            {!refinedPrompts[angle] && (
                              <button 
                                onClick={() => handleRefinePrompt(angle as keyof MultiAnglePrompts, prompt)}
                                className="px-3 py-1.5 hover:bg-ink hover:text-paper transition-all flex items-center gap-2 text-ink/40 border border-transparent hover:border-ink"
                              >
                                <RefreshCw size={14} />
                                <span className="micro-label !opacity-100 !tracking-tighter">Refine</span>
                              </button>
                            )}
                            <button 
                              onClick={() => copyToClipboard(refinedPrompts[angle]?.prompt || prompt, angle)}
                              className="px-3 py-1.5 hover:bg-ink hover:text-paper transition-all flex items-center gap-2 text-ink/40 border border-transparent hover:border-ink"
                            >
                              {copied === angle ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                              <span className="micro-label !opacity-100 !tracking-tighter">Copy Prompt</span>
                            </button>
                          </div>
                        </div>
                        
                        {refinedPrompts[angle] ? (
                          <div className="space-y-6">
                            <div className="p-6 bg-paper border border-ink/5 shadow-inner">
                              <h4 className="micro-label mb-4 !opacity-30">Refined Production Prompt</h4>
                              <p className="text-xl font-serif italic leading-relaxed text-ink/80">{refinedPrompts[angle].prompt}</p>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                              <div className="space-y-1">
                                <span className="micro-label !opacity-20 block">Aspect Ratio</span>
                                <span className="text-sm font-mono font-black">{refinedPrompts[angle].settings.aspect_ratio}</span>
                              </div>
                              <div className="space-y-1">
                                <span className="micro-label !opacity-20 block">Resolution</span>
                                <span className="text-sm font-mono font-black">{refinedPrompts[angle].settings.resolution}</span>
                              </div>
                              <div className="space-y-1">
                                <span className="micro-label !opacity-20 block">CFG Scale</span>
                                <span className="text-sm font-mono font-black">{refinedPrompts[angle].settings.cfg_scale}</span>
                              </div>
                              <div className="space-y-1">
                                <span className="micro-label !opacity-20 block">Steps</span>
                                <span className="text-sm font-mono font-black">{refinedPrompts[angle].settings.steps}</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <p className="text-2xl font-serif italic leading-relaxed text-ink/70">
                            {prompt}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={handleGenerateScript}
                    className="w-full py-10 bg-ink text-paper font-mono text-xs uppercase tracking-[0.4em] font-black hover:scale-[1.01] active:scale-[0.99] transition-all shadow-2xl flex items-center justify-center gap-4"
                  >
                    Generate Voiceover Script <ChevronRight size={20} />
                  </button>
                </div>
              )}

              {currentStep === 'script' && (
                <div className="space-y-12">
                  <button 
                    onClick={() => setCurrentStep('visuals')}
                    className="flex items-center gap-3 text-ink/40 hover:text-ink mb-12 transition-all group"
                  >
                    <div className="p-2 bg-ink/5 rounded-full group-hover:bg-ink group-hover:text-paper transition-all">
                      <ArrowLeft size={16} />
                    </div>
                    <span className="micro-label !opacity-100">Back to Visuals</span>
                  </button>
                  {renderStepHeader("Content Script", <MessageSquare size={24} />, `Step 05 / 1-Minute Facebook Reel Script`)}
                  
                  <div className="editorial-card p-16 mb-12 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-ink"></div>
                    <div className="flex justify-between items-center mb-12 border-b border-ink/5 pb-8">
                      <h3 className="micro-label !opacity-100 text-ink font-black">Final Production Script</h3>
                      <div className="flex gap-4">
                        <button 
                          onClick={handleGenerateVoice}
                          disabled={isGeneratingVoice}
                          className="px-4 py-2 hover:bg-ink hover:text-paper transition-all flex items-center gap-3 text-ink/40 border border-transparent hover:border-ink"
                        >
                          {isGeneratingVoice ? <Loader2 size={18} className="animate-spin" /> : <Video size={18} />}
                          <span className="micro-label !opacity-100 !tracking-tighter">Generate Voiceover</span>
                        </button>
                        <button 
                          onClick={() => copyToClipboard(script, 'script')}
                          className="px-4 py-2 hover:bg-ink hover:text-paper transition-all flex items-center gap-3 text-ink/40 border border-transparent hover:border-ink"
                        >
                          {copied === 'script' ? <Check size={18} className="text-green-600" /> : <Copy size={18} />}
                          <span className="micro-label !opacity-100 !tracking-tighter">Copy Script</span>
                        </button>
                      </div>
                    </div>
                    {voiceOverUrl && (
                      <div className="mb-8 p-6 bg-ink/5 border border-ink/10 rounded-none flex items-center gap-6">
                        <div className="p-3 bg-ink text-paper rounded-full">
                          <Video size={20} />
                        </div>
                        <div className="flex-1">
                          <p className="micro-label mb-2 !opacity-100">AI Voiceover Preview ({selectedLanguage})</p>
                          <audio src={voiceOverUrl} controls className="w-full h-8" />
                        </div>
                        <a 
                          href={voiceOverUrl} 
                          download={`voiceover_${selectedLanguage}.mp3`}
                          className="p-3 hover:bg-ink hover:text-paper transition-all border border-ink/10"
                        >
                          <Download size={20} />
                        </a>
                      </div>
                    )}
                    <div className="text-3xl font-serif italic leading-[1.7] text-ink/80 whitespace-pre-wrap selection:bg-ink selection:text-paper">
                      <ReactMarkdown>
                        {script}
                      </ReactMarkdown>
                    </div>
                    {scriptSinhala && (
                      <div className="mt-12 pt-12 border-t border-red-900/10">
                        <h4 className="micro-label mb-8 !opacity-30 text-red-900">Sinhala Translation</h4>
                        <div className="text-xl font-serif italic leading-[1.7] text-red-900/40 whitespace-pre-wrap">
                          <ReactMarkdown>{scriptSinhala}</ReactMarkdown>
                        </div>
                      </div>
                    )}
                    {scriptEnglish && (
                      <div className="mt-12 pt-12 border-t border-ink/5">
                        <h4 className="micro-label mb-8 !opacity-30">English Translation</h4>
                        <div className="text-xl font-serif italic leading-[1.7] text-ink/40 whitespace-pre-wrap">
                          <ReactMarkdown>{scriptEnglish}</ReactMarkdown>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="editorial-card p-12 bg-zinc-50 border border-zinc-100 mb-12">
                    <div className="flex justify-between items-end mb-6">
                      <div>
                        <h3 className="micro-label !mb-1">Production Scale</h3>
                        <p className="text-[10px] font-mono uppercase tracking-widest text-ink/40">How many scenes to visualize?</p>
                      </div>
                      <button 
                        onClick={async () => {
                          if (!script) return;
                          setIsRecommendingCount(true);
                          const recommended = await recommendSceneCount(script);
                          setSceneCount(recommended);
                          setIsRecommendingCount(false);
                        }}
                        disabled={isRecommendingCount || !script}
                        className="px-4 py-2 bg-white border border-ink/10 text-[10px] font-mono uppercase tracking-widest text-ink/60 hover:text-ink hover:border-ink transition-all flex items-center gap-2 shadow-sm"
                      >
                        {isRecommendingCount ? <RefreshCw size={12} className="animate-spin" /> : <TrendingUp size={12} />}
                        <span>{isRecommendingCount ? 'Analyzing Script...' : 'AI Recommend Based on Story'}</span>
                      </button>
                    </div>
                    <div className="relative group">
                      <select
                        value={sceneCount}
                        onChange={(e) => setSceneCount(parseInt(e.target.value))}
                        className="w-full p-8 bg-white border border-ink/10 rounded-none appearance-none font-serif italic text-3xl focus:outline-none focus:border-ink transition-all cursor-pointer pr-16 shadow-sm group-hover:shadow-md"
                      >
                        {[3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                          <option key={num} value={num}>
                            {num} Scenes
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-ink/30 group-hover:text-ink transition-colors">
                        <ChevronDown size={32} />
                      </div>
                    </div>
                    <div className="mt-6 flex items-center gap-3 text-[10px] font-mono text-ink/30 uppercase tracking-widest">
                      <Search size={12} />
                      <span>The AI will distribute your story across these {sceneCount} scenes</span>
                    </div>
                  </div>

                  <button 
                    onClick={handleGenerateScenes}
                    className="w-full py-10 bg-ink text-paper font-mono text-xs uppercase tracking-[0.4em] font-black hover:scale-[1.01] active:scale-[0.99] transition-all shadow-2xl flex items-center justify-center gap-4"
                  >
                    Generate Scene-by-Scene Prompts <ChevronRight size={20} />
                  </button>
                </div>
              )}

              {currentStep === 'scenes' && (
                <div className="space-y-12">
                  <div className="flex justify-between items-center">
                    <button 
                      onClick={() => setCurrentStep('script')}
                      className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition-colors"
                    >
                      <ArrowLeft size={16} />
                      <span className="font-mono text-[10px] uppercase tracking-widest">Back to Script</span>
                    </button>
                    <button 
                      onClick={reset}
                      className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition-colors"
                    >
                      <RefreshCw size={16} />
                      <span className="font-mono text-[10px] uppercase tracking-widest">Start Over</span>
                    </button>
                  </div>

                  {renderStepHeader("Video Scene Prompts", <Video size={24} />, "Step 06 / 8-Second Clip Prompts")}
                  
                  <div className="flex flex-col md:flex-row justify-between items-center p-6 bg-white border border-zinc-200 shadow-sm gap-6">
                    <div className="flex items-center gap-6">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">Selection:</span>
                      <button 
                        onClick={() => setScenes(prev => prev.map(s => ({ ...s, selected: true })))}
                        className="text-[10px] font-mono uppercase tracking-widest text-zinc-900 hover:underline underline-offset-4"
                      >
                        Select All
                      </button>
                      <button 
                        onClick={() => setScenes(prev => prev.map(s => ({ ...s, selected: false })))}
                        className="text-[10px] font-mono uppercase tracking-widest text-zinc-900 hover:underline underline-offset-4"
                      >
                        Deselect All
                      </button>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-900 font-bold">
                        {scenes.filter(s => s.selected).length} / {scenes.length} Scenes Selected
                      </div>
                      <button 
                        onClick={() => {
                          const allPrompts = scenes
                            .filter(s => s.selected)
                            .map(s => `Scene ${s.sceneNumber}:\n${s.imagePrompt}`)
                            .join('\n\n');
                          copyToClipboard(allPrompts, 'all-scenes-only');
                        }}
                        className="px-6 py-3 bg-white border border-ink text-ink font-mono text-[10px] uppercase tracking-widest hover:bg-ink hover:text-paper transition-all flex items-center gap-2 shadow-sm"
                      >
                        {copied === 'all-scenes-only' ? <Check size={14} /> : <Copy size={14} />}
                        <span>Copy All Prompts</span>
                      </button>
                      <button 
                        onClick={() => {
                          const allPrompts = scenes
                            .filter(s => s.selected)
                            .map(s => `Scene ${s.sceneNumber}:\nPrompt: ${s.imagePrompt}\nScript: ${s.scriptLine}\n---`)
                            .join('\n\n');
                          copyToClipboard(allPrompts, 'all-scenes');
                        }}
                        className="px-6 py-3 bg-ink text-paper font-mono text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shadow-lg"
                      >
                        {copied === 'all-scenes' ? <Check size={14} /> : <Copy size={14} />}
                        <span>Copy All (Full Data)</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-16">
                    {scenes.map((scene, idx) => (
                      <div key={idx} className={`editorial-card transition-all overflow-hidden ${scene.selected ? 'opacity-100' : 'opacity-40 grayscale'}`}>
                        <div className={`p-6 flex justify-between items-center ${scene.selected ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-500'}`}>
                          <div className="flex items-center gap-4">
                            <input 
                              type="checkbox" 
                              checked={scene.selected} 
                              onChange={() => toggleSceneSelection(idx)}
                              className="w-4 h-4 accent-zinc-900 cursor-pointer"
                            />
                            <div className="flex items-center gap-4">
                              <h3 className="font-mono text-xs uppercase tracking-[0.2em]">Scene {scene.sceneNumber} — {scene.startTime}</h3>
                              {idx === 0 && (
                                <div className="px-3 py-1 bg-paper text-ink text-[8px] font-mono uppercase tracking-widest font-black flex items-center gap-2">
                                  <TrendingUp size={10} />
                                  Retention Hook
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <button 
                              onClick={() => copyToClipboard(scene.imagePrompt, `scene-top-${idx}`)}
                              className={`flex items-center gap-2 px-4 py-2 border transition-all font-mono text-[10px] uppercase tracking-widest ${
                                copied === `scene-top-${idx}` 
                                  ? 'bg-green-50 border-green-200 text-green-700' 
                                  : 'bg-white/10 border-white/20 text-white hover:bg-white hover:text-ink'
                              }`}
                            >
                              {copied === `scene-top-${idx}` ? <Check size={12} /> : <Copy size={12} />}
                              <span>{copied === `scene-top-${idx}` ? 'Copied' : 'Copy Video Prompt'}</span>
                            </button>
                            <span className="font-mono text-[10px] opacity-50 uppercase tracking-widest">{scene.duration}</span>
                          </div>
                        </div>
                        
                        <div className="p-10 space-y-10">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                            <div>
                              <h4 className="micro-label mb-4">Script Line ({selectedLanguage})</h4>
                              <p className="text-2xl font-serif italic text-zinc-800 leading-relaxed">"{scene.scriptLine}"</p>
                            </div>
                            {scene.scriptLineSinhala && (
                              <div>
                                <h4 className="micro-label mb-4 !opacity-30 text-red-900">Sinhala Translation</h4>
                                <p className="text-xl font-serif italic text-red-900/40 leading-relaxed">"{scene.scriptLineSinhala}"</p>
                              </div>
                            )}
                            {scene.scriptLineEnglish && (
                              <div>
                                <h4 className="micro-label mb-4 !opacity-30">English Translation</h4>
                                <p className="text-xl font-serif italic text-zinc-400 leading-relaxed">"{scene.scriptLineEnglish}"</p>
                              </div>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-8">
                              <div>
                                <h4 className="micro-label mb-3">Character Description</h4>
                                <p className="text-sm leading-relaxed text-zinc-600">{scene.characterDescription}</p>
                              </div>
                              <div>
                                <h4 className="micro-label mb-3">Expression & Micro-Movement</h4>
                                <p className="text-sm leading-relaxed text-zinc-600">{scene.expression}</p>
                              </div>
                              <div>
                                <h4 className="micro-label mb-3">Body Language</h4>
                                <p className="text-sm leading-relaxed text-zinc-600">{scene.bodyLanguage}</p>
                              </div>
                            </div>
                            
                            <div className="space-y-8">
                              <div className="grid grid-cols-2 gap-6">
                                <div>
                                  <h4 className="micro-label mb-2">Camera</h4>
                                  <p className="text-sm font-bold text-zinc-900">{scene.camera}</p>
                                </div>
                                <div>
                                  <h4 className="micro-label mb-2">Audio</h4>
                                  <p className="text-sm font-bold text-zinc-900">{scene.audio}</p>
                                </div>
                              </div>
                              <div>
                                <h4 className="micro-label mb-3">Environment</h4>
                                <p className="text-sm leading-relaxed text-zinc-600">{scene.environment}</p>
                              </div>
                              <div className="bg-zinc-50 p-6 border border-zinc-100">
                                <h4 className="micro-label mb-4">Voice Direction</h4>
                                <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                                  <div>
                                    <span className="text-[10px] text-zinc-400 block uppercase tracking-widest mb-1">Pace</span>
                                    <span className="text-xs font-bold text-zinc-900">{scene.voiceDirection.pace}</span>
                                  </div>
                                  <div>
                                    <span className="text-[10px] text-zinc-400 block uppercase tracking-widest mb-1">Tone</span>
                                    <span className="text-xs font-bold text-zinc-900">{scene.voiceDirection.tone}</span>
                                  </div>
                                  <div className="col-span-2">
                                    <span className="text-[10px] text-zinc-400 block uppercase tracking-widest mb-1">Delivery</span>
                                    <span className="text-xs italic text-zinc-700">"{scene.voiceDirection.delivery}"</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="pt-10 border-t border-zinc-100">
                            <div className="flex justify-between items-center mb-6">
                              <h4 className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-900 font-bold">Image Generation Prompt</h4>
                              <div className="flex gap-4">
                                <button 
                                  onClick={() => copyToClipboard(scene.imagePrompt, `scene-${idx}`)}
                                  className={`flex items-center gap-2 px-4 py-2 border transition-all font-mono text-[10px] uppercase tracking-widest ${
                                    copied === `scene-${idx}` 
                                      ? 'bg-green-50 border-green-200 text-green-700' 
                                      : 'bg-white border-zinc-200 text-zinc-500 hover:border-zinc-900 hover:text-zinc-900'
                                  }`}
                                >
                                  {copied === `scene-${idx}` ? <Check size={12} /> : <Copy size={12} />}
                                  <span>{copied === `scene-${idx}` ? 'Copied' : 'Copy Prompt'}</span>
                                </button>
                              </div>
                            </div>
                            <div className="p-8 bg-zinc-50 border border-zinc-100 rounded-sm group relative">
                              <p className="text-xl font-serif italic leading-relaxed text-zinc-800">
                                {scene.imagePrompt}
                              </p>
                              <div className="mt-6 flex items-center gap-2 text-[9px] font-mono text-zinc-400 uppercase tracking-widest">
                                <Search size={10} />
                                <span>Tip: Use the main character image as a reference for consistency</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-16 p-12 bg-zinc-900 text-white flex flex-col md:flex-row justify-between items-center gap-8 shadow-2xl">
                    <div className="text-center md:text-left">
                      <h3 className="text-2xl font-serif italic mb-3">Ready to produce?</h3>
                      <p className="text-xs font-mono uppercase tracking-widest opacity-60">Finalize your production package and save to history.</p>
                    </div>
                    <button 
                      onClick={saveToHistory}
                      className="px-12 py-5 bg-white text-zinc-900 font-mono text-xs uppercase tracking-[0.2em] hover:bg-zinc-100 transition-all hover:scale-105 active:scale-95 flex items-center gap-3 shadow-lg"
                    >
                      Finalize & Save <Download size={16} />
                    </button>
                  </div>
                </div>
              )}

              {currentStep === 'history' && (
                <div className="space-y-12">
                  <div className="flex justify-between items-center">
                    {renderStepHeader("Generation History", <History size={24} />, "Your past lifestyle productions")}
                    <button 
                      onClick={() => setCurrentStep('selection')}
                      className="px-6 py-3 bg-zinc-900 text-white font-mono text-[10px] uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-md active:scale-95"
                    >
                      New Generation
                    </button>
                  </div>

                  {history.length === 0 ? (
                    <div className="py-40 text-center border-2 border-dashed border-zinc-200 bg-zinc-50/50">
                      <History size={48} className="mx-auto text-zinc-200 mb-6" strokeWidth={1} />
                      <p className="font-mono text-xs uppercase tracking-widest text-zinc-400">No history records found.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-8">
                      {history.map((record) => (
                        <div key={record.id} className="editorial-card p-10 group hover:border-zinc-900 transition-all">
                          <div className="flex justify-between items-start mb-8">
                            <div>
                              <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-400 block mb-2">
                                {new Date(record.timestamp).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} — {new Date(record.timestamp).toLocaleTimeString()}
                              </span>
                              <h3 className="text-3xl font-serif italic text-zinc-900">{record.content.title}</h3>
                            </div>
                            <div className="flex gap-3">
                              <button 
                                onClick={() => loadHistoryItem(record)}
                                className="p-3 bg-zinc-50 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-all rounded-full"
                                title="View Record"
                              >
                                <Eye size={20} />
                              </button>
                              <button 
                                onClick={() => deleteHistoryItem(record.id)}
                                className="p-3 bg-zinc-50 text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-all rounded-full"
                                title="Delete Record"
                              >
                                <Trash2 size={20} />
                              </button>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-8 text-[10px] font-mono uppercase tracking-widest text-zinc-500 border-t border-zinc-100 pt-8">
                            <div className="flex items-center gap-2">
                              <Globe size={14} className="text-zinc-300" />
                              <span className="text-zinc-900 font-bold">{record.country.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Layers size={14} className="text-zinc-300" />
                              <span className="text-zinc-900 font-bold">{record.niche.title}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <User size={14} className="text-zinc-300" />
                              <span className="text-zinc-900 font-bold">{record.character.title}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {currentStep === 'package' && selectedContent && character && (
                <div className="space-y-12">
                  <div className="flex justify-between items-center">
                    <button 
                      onClick={() => setCurrentStep('scenes')}
                      className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition-colors"
                    >
                      <ArrowLeft size={16} />
                      <span className="font-mono text-[10px] uppercase tracking-widest">Back to Scenes</span>
                    </button>
                    <div className="flex gap-4">
                      <button 
                        onClick={() => setCurrentStep('history')}
                        className="px-6 py-3 bg-white border border-zinc-200 text-zinc-900 font-mono text-[10px] uppercase tracking-widest hover:bg-zinc-50 transition-all shadow-sm"
                      >
                        View History
                      </button>
                      <button 
                        onClick={reset}
                        className="px-6 py-3 bg-zinc-900 text-white font-mono text-[10px] uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-md active:scale-95"
                      >
                        New Project
                      </button>
                    </div>
                  </div>
                  {renderStepHeader("Production Package", <Download size={24} />, "Final assets for your lifestyle video")}

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 space-y-12">
                      <div className="editorial-card p-10 relative">
                        <div className="flex justify-between items-center mb-8">
                          <h4 className="micro-label">Final Script</h4>
                          <button 
                            onClick={() => copyToClipboard(script, 'pkg-script')}
                            className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-zinc-500 hover:text-zinc-900 transition-colors"
                          >
                            {copied === 'pkg-script' ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
                            <span>{copied === 'pkg-script' ? 'Copied' : 'Copy Script'}</span>
                          </button>
                        </div>
                        <div className="text-2xl font-serif italic leading-relaxed text-zinc-800 whitespace-pre-wrap">
                          <ReactMarkdown>{script}</ReactMarkdown>
                        </div>
                        {scriptSinhala && (
                          <div className="mt-8 pt-8 border-t border-red-900/10">
                            <h4 className="micro-label mb-4 !opacity-30 text-red-900">Sinhala Translation</h4>
                            <div className="text-lg font-serif italic leading-relaxed text-red-900/40 whitespace-pre-wrap">
                              <ReactMarkdown>{scriptSinhala}</ReactMarkdown>
                            </div>
                          </div>
                        )}
                        {scriptEnglish && (
                          <div className="mt-8 pt-8 border-t border-zinc-100">
                            <h4 className="micro-label mb-4 !opacity-30">English Translation</h4>
                            <div className="text-lg font-serif italic leading-relaxed text-zinc-400 whitespace-pre-wrap">
                              <ReactMarkdown>{scriptEnglish}</ReactMarkdown>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="space-y-8">
                        <h4 className="micro-label">Selected Scenes ({scenes.filter(s => s.selected).length})</h4>
                        <div className="space-y-6">
                          {scenes.filter(s => s.selected).map((scene, idx) => (
                            <div key={idx} className="editorial-card p-8 flex gap-8 items-start group">
                              <div className="w-14 h-14 bg-zinc-900 text-white flex items-center justify-center font-mono text-sm shrink-0 shadow-lg">
                                {scene.sceneNumber}
                              </div>
                              <div className="flex-1">
                                <p className="text-lg font-serif italic mb-2 text-zinc-800">"{scene.scriptLine}"</p>
                                {scene.scriptLineSinhala && (
                                  <p className="text-sm font-serif italic mb-2 text-red-900/40">"{scene.scriptLineSinhala}"</p>
                                )}
                                {scene.scriptLineEnglish && (
                                  <p className="text-sm font-serif italic mb-4 text-zinc-400">"{scene.scriptLineEnglish}"</p>
                                )}
                                <div className="p-5 bg-zinc-50 border border-zinc-100 rounded text-xs text-zinc-600 leading-relaxed italic relative group">
                                  {scene.imagePrompt}
                                  <button 
                                    onClick={() => copyToClipboard(scene.imagePrompt, `pkg-scene-inner-${idx}`)}
                                    className="absolute top-2 right-2 p-2 bg-white/80 border border-zinc-200 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:border-zinc-900"
                                    title="Copy Prompt"
                                  >
                                    {copied === `pkg-scene-inner-${idx}` ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                                  </button>
                                </div>
                              </div>
                              <button 
                                onClick={() => copyToClipboard(scene.imagePrompt, `pkg-scene-${idx}`)}
                                className={`px-6 py-3 border transition-all font-mono text-[10px] uppercase tracking-widest flex items-center gap-2 shrink-0 ${
                                  copied === `pkg-scene-${idx}`
                                    ? 'bg-green-50 border-green-200 text-green-700'
                                    : 'bg-white border-zinc-200 text-zinc-500 hover:border-zinc-900 hover:text-zinc-900'
                                }`}
                              >
                                {copied === `pkg-scene-${idx}` ? <Check size={14} /> : <Copy size={14} />}
                                <span>{copied === `pkg-scene-${idx}` ? 'Copied' : 'Copy Prompt'}</span>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-12">
                      <div className="editorial-card p-10">
                        <h4 className="micro-label mb-8">Character Persona</h4>
                        <h3 className="text-2xl font-serif italic mb-4 text-zinc-900">{character.title}</h3>
                        <p className="text-sm leading-relaxed text-zinc-600 mb-8">{character.description}</p>
                        <div className="p-6 bg-zinc-50 border border-zinc-100 text-xs italic text-zinc-500 leading-relaxed">
                          {character.visualDetails}
                        </div>
                      </div>

                      <div className="bg-zinc-900 text-white p-10 shadow-xl">
                        <h4 className="micro-label opacity-50 mb-8">Production Summary</h4>
                        <div className="space-y-6">
                          <div className="flex justify-between text-xs font-mono uppercase tracking-widest">
                            <span className="opacity-40">Country</span>
                            <span className="text-white">{selectedCountry.name}</span>
                          </div>
                          <div className="flex justify-between text-xs font-mono uppercase tracking-widest">
                            <span className="opacity-40">Niche</span>
                            <span className="text-white">{selectedNiche.title}</span>
                          </div>
                          <div className="flex justify-between text-xs font-mono uppercase tracking-widest">
                            <span className="opacity-40">Scenes</span>
                            <span className="text-white">{scenes.filter(s => s.selected).length}</span>
                          </div>
                          <div className="pt-8 border-t border-zinc-800">
                            <p className="text-[11px] leading-relaxed opacity-50 italic font-serif">
                              "This content is optimized for global visual appeal while maintaining deep cultural authenticity."
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="pl-20 mt-32 border-t border-ink/5 px-8 py-16 bg-ink text-paper">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-paper text-ink flex items-center justify-center font-black text-lg tracking-tighter">
                NT
              </div>
              <h2 className="text-xl font-black tracking-tighter uppercase">Niche Story Generator</h2>
            </div>
            <p className="text-paper/40 font-serif italic text-sm leading-relaxed">
              An advanced AI production suite for creating localized, high-retention social media content. Designed for creators who value cultural depth and visual precision.
            </p>
            <p className="micro-label !opacity-100 !text-paper/20">by Thamoda</p>
          </div>
          
          <div className="space-y-6">
            <h3 className="micro-label !opacity-100 !text-paper">Production Tools</h3>
            <ul className="space-y-3 font-mono text-[10px] uppercase tracking-widest text-paper/40">
              <li className="hover:text-paper cursor-pointer transition-colors flex items-center gap-2">
                <ChevronRight size={10} /> Viral News Discovery
              </li>
              <li className="hover:text-paper cursor-pointer transition-colors flex items-center gap-2">
                <ChevronRight size={10} /> Cultural Character Engine
              </li>
              <li className="hover:text-paper cursor-pointer transition-colors flex items-center gap-2">
                <ChevronRight size={10} /> Multi-Angle Prompting
              </li>
              <li className="hover:text-paper cursor-pointer transition-colors flex items-center gap-2">
                <ChevronRight size={10} /> Retention Scripting
              </li>
            </ul>
          </div>

          <div className="space-y-6">
            <h3 className="micro-label !opacity-100 !text-paper">System Status</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-paper/60">Gemini 1.5 Pro Active</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-paper/60">Voice Engine Ready</span>
              </div>
              <p className="text-[10px] font-mono text-paper/20 uppercase tracking-widest pt-4">
                © 2026 Niche Story Generator by Thamoda. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
        </>
      )}
    </div>
  );
}
