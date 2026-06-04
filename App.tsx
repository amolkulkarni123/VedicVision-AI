
import React, { useState, useEffect } from 'react';
import { 
  Map, TrendingUp, Hand, Globe, Users, Clock, 
  MessageCircle, Image as ImageIcon, ChevronDown, Sparkles, 
  Video, Search, Landmark, Heart, ShieldAlert, Book, AlertCircle, CheckCircle2, Info, Sun, Zap, ZapOff,
  RotateCw, Music, ShieldCheck, Wifi, WifiOff, Key, ExternalLink
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { 
  AppView, Language, UserBirthDetails, ChartData, DailyHoroscopeData 
} from './types';
import { ASSETS, SUPPORTED_LANGUAGES } from './constants';
import { GeminiService } from './services/geminiService';
import { PalmLeafCard, LoadingOverlay } from './components/Shared';
import ErrorBoundary from './components/ErrorBoundary';
import { 
  SouthIndianChart, PredictionPanel, Matchmaking, ChatInterface, 
  PalmistryReader, VisionInterface, AIAgentGuide, 
  TodayHoroscope, DivineCinema, RishiCouncil, ScriptureResearch, RemediesPortal, LoshuGrid
} from './components/AstrologyModules';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.LANDING);
  const [lang, setLang] = useState<Language>('English');
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline' | 'restricted'>('checking');
  
  const [birthDetails, setBirthDetails] = useState<UserBirthDetails | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [dailyQuickInsight, setDailyQuickInsight] = useState<DailyHoroscopeData | null>(null);
  const [loadingDaily, setLoadingDaily] = useState(false);

  // Production Sanity Check & Persistence
  const checkHealth = async () => {
    setApiStatus('checking');
    const status = await GeminiService.checkCelestialHealth();
    setApiStatus(status);
    if (status === 'restricted') {
      showToast("Access Restricted. Authorization Required.", "error");
    }
  };

  useEffect(() => {
    const initApp = async () => {
      await checkHealth();

      const savedDetails = localStorage.getItem('vv_birth_details');
      if (savedDetails) {
        try {
          const details = JSON.parse(atob(savedDetails));
          handleGenerateChart(details, true);
        } catch (e) {
          localStorage.removeItem('vv_birth_details');
        }
      }
    };
    initApp();
  }, []);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const validateBirthData = (details: UserBirthDetails): string | null => {
    if (!details.name.trim()) return "Please enter your name.";
    if (!details.date) return "Please provide your date of birth.";
    if (!details.location.trim()) return "Birth location is required.";
    const birthDate = new Date(details.date);
    if (birthDate > new Date()) return "Birth date cannot be in the future.";
    return null;
  };

  const fetchDailyQuickInsight = async (chart: ChartData) => {
    setLoadingDaily(true);
    try {
      const insight = await GeminiService.generateDailyHoroscope(chart, lang);
      if (insight) setDailyQuickInsight(insight);
    } catch (e) {
      console.error("Dashboard Sync Error:", e);
    } finally {
      setLoadingDaily(false);
    }
  };

  const handleGenerateChart = async (details: UserBirthDetails, skipPersistence = false) => {
    const error = validateBirthData(details);
    if (error) {
      showToast(error, 'error');
      return;
    }

    setLoading(true);
    try {
      const data = await GeminiService.generateBirthChart(details, lang);
      if(data) { 
          setBirthDetails(details); 
          setChartData(data); 
          setView(AppView.DASHBOARD); 
          if (!skipPersistence) {
            localStorage.setItem('vv_birth_details', btoa(JSON.stringify(details)));
            showToast("Celestial Alignment Confirmed", 'success');
          }
          fetchDailyQuickInsight(data);
      } else {
          showToast("Cosmic calibration failed. Retrying...", 'error');
      }
    } catch (e: any) {
      if (e?.status === 403) {
        showToast("Activation required for this analysis level.", "info");
      } else {
        showToast("Planetary interference detected.", 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const triggerActivation = async () => {
    if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
      await window.aistudio.openSelectKey();
      await checkHealth(); // Re-check health after key selection
    }
  };

  const handleNavItemClick = async (targetView: AppView) => {
    const requiresKey = [
      AppView.DIVINE_CINEMA, 
      AppView.SCRIPTURE_RESEARCH, 
      AppView.PALMISTRY, 
      AppView.VISION
    ].includes(targetView);

    if (requiresKey) {
      try {
        if (!(await (window as any).aistudio.hasSelectedApiKey())) {
          showToast("Premium module requires activation", 'info');
          await triggerActivation();
        }
      } catch (e) {
        showToast("Activation cancelled", 'info');
        return;
      }
    }
    setView(targetView);
  };

  const navItems = [ 
    { v: AppView.DASHBOARD, i: Map, l: 'Your Kundali' }, 
    { v: AppView.TODAY_HOROSCOPE, i: Sparkles, l: 'Daily Gochara' },
    { v: AppView.MATCHMAKING, i: Heart, l: 'Matchmaking', premium: true },
    { v: AppView.REMEDIES, i: ShieldAlert, l: 'Upaya Portal', premium: true },
    { v: AppView.DIVINE_CINEMA, i: Video, l: 'Divine Cinema', premium: true },
    { v: AppView.RISHI_COUNCIL, i: Users, l: 'Rishi Parishad', premium: true },
    { v: AppView.SCRIPTURE_RESEARCH, i: Search, l: 'Jyotish Research' },
    { v: AppView.PREDICTIONS, i: TrendingUp, l: 'Bhavishya Phala' }, 
    { v: AppView.PALMISTRY, i: Hand, l: 'Palmistry Vision' }, 
    { v: AppView.CHAT, i: MessageCircle, l: 'Ask Rishi AI' },
    { v: AppView.VISION, i: ImageIcon, l: 'Darshan' },
    { v: AppView.AI_GUIDE, i: Landmark, l: 'Agent Sutras' }
  ];

  return (
    <div className="min-h-screen font-sans pb-24 relative overflow-hidden text-vedic-primary bg-vedic-paper">
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40" style={{ backgroundImage: `url(${ASSETS.TEXTURE})` }}></div>
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20 bg-gradient-to-br from-[#f5deb3] via-[#e6cc96] to-[#d4a856]"></div>

      {/* Production Toast System */}
      <div className="fixed top-24 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className={`pointer-events-auto flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border-2 animate-fade-in
            ${t.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 
              t.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800' : 
              'bg-blue-50 border-blue-200 text-blue-800'}`}>
            {t.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : 
             t.type === 'error' ? <AlertCircle className="w-5 h-5" /> : 
             <Info className="w-5 h-5" />}
            <span className="font-serif font-bold text-sm">{t.message}</span>
          </div>
        ))}
      </div>

      <header className="sticky top-0 z-50 bg-[#e6cc96]/95 backdrop-blur-md border-b-4 border-vedic-accent shadow-xl">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between relative z-10">
          <div 
            role="button"
            tabIndex={0}
            className="flex items-center gap-3 cursor-pointer group outline-none" 
            onClick={() => setView(birthDetails ? AppView.DASHBOARD : AppView.LANDING)}
            onKeyDown={e => e.key === 'Enter' && setView(birthDetails ? AppView.DASHBOARD : AppView.LANDING)}
          >
            <div className="w-12 h-12 bg-vedic-primary rounded-full flex items-center justify-center border-2 border-vedic-gold shadow-lg group-hover:rotate-12 transition-transform">
               <span className="text-vedic-gold font-serif font-bold text-2xl">ॐ</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-serif font-bold text-vedic-primary tracking-wider leading-none text-shadow-sm">VedicVision AI</span>
              <span className="text-[8px] uppercase tracking-widest font-black mt-1 flex items-center gap-1">
                {apiStatus === 'checking' && <span className="text-vedic-accent flex items-center gap-1"><RotateCw className="w-2 h-2 animate-spin" /> Aligning...</span>}
                {apiStatus === 'online' && <span className="text-emerald-700 flex items-center gap-1"><Wifi className="w-2 h-2" /> Cosmic Sync Active</span>}
                {apiStatus === 'offline' && <span className="text-rose-700 flex items-center gap-1"><WifiOff className="w-2 h-2" /> Alignment Failed</span>}
                {apiStatus === 'restricted' && <span className="text-amber-700 flex items-center gap-1"><ShieldAlert className="w-2 h-2" /> Authorization Needed</span>}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {apiStatus === 'restricted' && (
              <button 
                onClick={triggerActivation}
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-vedic-accent text-white text-[10px] font-black uppercase rounded-full shadow-lg hover:scale-105 transition-all"
              >
                <Key className="w-3 h-3" /> Authorize AI
              </button>
            )}
            <div className="relative group">
              <div className="flex items-center gap-2 px-4 py-2 bg-vedic-primary text-vedic-light text-xs font-bold rounded-full cursor-pointer shadow-md hover:bg-vedic-secondary transition-colors">
                  <Globe className="w-3 h-3" /><span>{lang}</span><ChevronDown className="w-3 h-3 ml-1" />
              </div>
              <select 
                aria-label="Select Language"
                value={lang} 
                onChange={(e) => setLang(e.target.value)} 
                className="absolute inset-0 opacity-0 cursor-pointer"
              >
                {SUPPORTED_LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 pt-12 relative z-10">
        {loading && <LoadingOverlay />}

        <ErrorBoundary>
          {view === AppView.LANDING && (
            <div className="flex flex-col items-center">
              <div className="text-center mb-10 animate-fade-in max-w-2xl">
                <h1 className="text-6xl font-serif font-bold text-vedic-primary mb-4 drop-shadow-md">The Path of Destiny</h1>
                <p className="text-xl text-vedic-secondary font-serif italic mb-6">Scripture-Grounded Vedic Intelligence</p>
                {apiStatus === 'restricted' && (
                  <div className="bg-amber-50 border-2 border-amber-200 p-4 rounded-3xl mb-8 flex flex-col items-center gap-3">
                     <p className="text-xs font-bold text-amber-800 text-center">
                        <AlertCircle className="w-4 h-4 inline mr-2" /> 
                        Your current cosmic key has limited permissions. For premium analysis, please authorize with a paid project.
                     </p>
                     <div className="flex gap-4">
                        <button onClick={triggerActivation} className="px-6 py-2 bg-amber-600 text-white rounded-full text-[10px] font-black uppercase hover:bg-amber-700">Authorize Link</button>
                        <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="px-6 py-2 bg-white border-2 border-amber-200 text-amber-800 rounded-full text-[10px] font-black uppercase flex items-center gap-2">Billing Guide <ExternalLink className="w-3 h-3" /></a>
                     </div>
                  </div>
                )}
              </div>
              <PalmLeafCard className="max-w-xl w-full">
                <h2 className="text-2xl font-serif text-vedic-primary mb-6 font-bold text-center border-b-2 border-vedic-accent pb-2">Enter Birth Data</h2>
                <form 
                  onSubmit={(e: any) => { 
                    e.preventDefault(); 
                    handleGenerateChart({ 
                      name: e.target.name.value, 
                      date: e.target.date.value, 
                      time: e.target.time.value, 
                      location: e.target.location.value 
                    }); 
                  }} 
                  className="space-y-6"
                >
                  <input name="name" type="text" required placeholder="Seeker's Name" className="w-full bg-vedic-light border-b-2 border-vedic-accent px-4 py-3 text-vedic-primary outline-none focus:border-vedic-highlight transition-all" />
                  <div className="grid grid-cols-2 gap-4">
                    <input name="date" type="date" required className="w-full bg-vedic-light border-b-2 border-vedic-accent px-4 py-3 text-vedic-primary outline-none focus:border-vedic-highlight" />
                    <input name="time" type="time" required className="w-full bg-vedic-light border-b-2 border-vedic-accent px-4 py-3 text-vedic-primary outline-none focus:border-vedic-highlight" />
                  </div>
                  <input name="location" type="text" required placeholder="Birth Place" className="w-full bg-vedic-light border-b-2 border-vedic-accent px-4 py-3 text-vedic-primary outline-none focus:border-vedic-highlight" />
                  <button type="submit" className="w-full py-4 bg-vedic-accent text-white font-bold rounded shadow-lg hover:bg-vedic-highlight transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2">
                    <ShieldCheck className="w-4 h-4" /> Align with the Stars
                  </button>
                </form>
                <div className="mt-6 text-center">
                   <p className="text-[10px] text-vedic-primary/50 uppercase font-black tracking-tighter">Production Grade Gemini 2.0 Integration</p>
                </div>
              </PalmLeafCard>
            </div>
          )}

          {chartData && (
            <div className="grid lg:grid-cols-12 gap-8">
              <div className="lg:col-span-3 space-y-4">
                  <div className="bg-white/60 p-6 rounded-3xl border-2 border-vedic-accent shadow-lg text-center backdrop-blur-md">
                     <div className="w-20 h-20 bg-vedic-primary text-vedic-gold rounded-full flex items-center justify-center text-3xl font-serif mx-auto mb-4 border-2 border-vedic-gold shadow-inner">{birthDetails?.name.charAt(0)}</div>
                     <h2 className="text-xl font-serif font-bold text-vedic-primary mb-1">{birthDetails?.name}</h2>
                     <p className="text-[9px] text-white uppercase tracking-widest font-black bg-vedic-highlight px-3 py-1 inline-block rounded-full">{chartData.ascendant} Ascendant</p>
                  </div>
                  
                  <nav className="space-y-1">
                     {navItems.map(item => (
                       <button 
                         key={item.v} 
                         onClick={() => handleNavItemClick(item.v as AppView)} 
                         className={`w-full p-4 rounded-2xl text-xs font-bold flex items-center justify-between transition-all ${view === item.v ? 'bg-vedic-primary text-white shadow-xl' : 'bg-white/40 text-vedic-primary hover:bg-white/60'}`}
                       >
                         <div className="flex items-center gap-3"><item.i className="w-4 h-4" /> <span>{item.l}</span></div>
                         {item.premium && <span className="text-[7px] bg-vedic-accent text-white px-1.5 py-0.5 rounded font-black tracking-tighter">AI 2.0</span>}
                       </button>
                     ))}
                  </nav>

                  <div className="p-5 bg-vedic-primary/10 rounded-3xl border border-vedic-gold/30">
                     <h4 className="text-[10px] uppercase font-black text-vedic-primary mb-3 flex items-center gap-2"><Book className="w-3 h-3" /> Classical Citations</h4>
                     <ul className="text-[9px] space-y-2 text-vedic-secondary font-bold italic">
                        {chartData.scriptureCitations.map((cite, i) => <li key={i} className="flex items-center gap-2"><span>•</span> {cite}</li>)}
                     </ul>
                  </div>
                  
                  <button onClick={() => { localStorage.removeItem('vv_birth_details'); window.location.reload(); }} className="w-full p-2 text-[9px] uppercase font-black text-rose-600 hover:text-rose-800 transition-colors">
                     Clear Sacred Records
                  </button>
              </div>

              <div className="lg:col-span-9">
                 {view === AppView.DASHBOARD && (
                    <div className="space-y-8 animate-fade-in">
                       <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                          <div className="md:col-span-8">
                            <PalmLeafCard className="rounded-[2rem] border-vedic-accent/60 bg-white shadow-2xl overflow-hidden p-0">
                               <div className="bg-gradient-to-r from-vedic-primary to-vedic-secondary p-8 text-white flex items-center justify-between">
                                  <div className="flex items-center gap-4">
                                     <div className="p-3 bg-vedic-gold rounded-full text-vedic-primary shadow-lg animate-spin-slow">
                                        <Sun className="w-6 h-6" />
                                     </div>
                                     <div>
                                        <h3 className="text-xl font-serif font-bold">Horoscope Today</h3>
                                        <div className="flex items-center gap-2 text-[10px] uppercase font-black tracking-widest opacity-60">
                                           <Zap className="w-3 h-3" /> Gochara Optimized
                                        </div>
                                     </div>
                                  </div>
                                  <button onClick={() => setView(AppView.TODAY_HOROSCOPE)} className="bg-vedic-accent px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-tighter hover:scale-105 transition-all shadow-md">Full Vision</button>
                               </div>
                               <div className="p-8 bg-[#fffdfa] min-h-[160px] flex flex-col justify-center">
                                  {loadingDaily ? (
                                    <div className="flex items-center justify-center gap-4 opacity-40 italic font-serif">
                                       <RotateCw className="w-8 h-8 animate-spin" />
                                       <p>Syncing with current transits...</p>
                                    </div>
                                  ) : dailyQuickInsight ? (
                                    <div className="space-y-4 animate-fade-in">
                                       <p className="text-xl font-serif font-bold text-vedic-primary italic border-l-4 border-vedic-accent pl-4">
                                          "{dailyQuickInsight.cosmicMood}"
                                       </p>
                                       <p className="text-sm text-vedic-secondary font-medium leading-relaxed">
                                          {dailyQuickInsight.personalizedReading.split('\n')[0].substring(0, 180)}...
                                       </p>
                                       <div className="flex flex-wrap gap-2 pt-2">
                                          <span className="bg-vedic-primary/10 px-3 py-1 rounded-full text-[9px] font-black text-vedic-primary uppercase"><Music className="w-2 h-2 inline mr-1" /> {dailyQuickInsight.luckyMantra}</span>
                                          <span className="bg-emerald-50 px-3 py-1 rounded-full text-[9px] font-black text-emerald-800 uppercase"><CheckCircle2 className="w-2 h-2 inline mr-1" /> {dailyQuickInsight.auspiciousTime}</span>
                                       </div>
                                    </div>
                                  ) : (
                                    <div className="text-center opacity-40 font-serif italic flex flex-col items-center gap-2">
                                       <p>Celestial data pending. Re-alignment required.</p>
                                       {apiStatus === 'restricted' && <button onClick={triggerActivation} className="text-[10px] font-black underline text-vedic-accent">Authorize Pro Key</button>}
                                    </div>
                                  )}
                               </div>
                            </PalmLeafCard>
                          </div>
                          <div className="md:col-span-4">
                             <PalmLeafCard className="rounded-[2rem] border-vedic-primary/20 bg-white h-full flex flex-col justify-center p-6 text-center">
                                <h4 className="text-[10px] font-black text-vedic-accent uppercase tracking-widest mb-4">Loshu Magic Square</h4>
                                <LoshuGrid data={chartData.loshu} />
                             </PalmLeafCard>
                          </div>
                       </div>

                       <div className="grid md:grid-cols-12 gap-8">
                          <div className="md:col-span-4 space-y-8">
                            <SouthIndianChart charts={chartData.charts} />
                          </div>
                          <div className="md:col-span-8 space-y-8">
                             <PalmLeafCard className="rounded-[2rem] border-vedic-gold/40">
                               <h2 className="text-3xl font-serif text-vedic-primary mb-6 font-bold border-b-2 border-vedic-gold/20 pb-4 flex items-center gap-3">
                                 <Sparkles className="w-8 h-8 text-vedic-accent" /> Destiny Decree
                               </h2>
                               <div className="text-lg leading-relaxed text-justify h-[600px] overflow-y-auto pr-4 custom-scrollbar font-serif italic text-vedic-secondary">
                                  <ReactMarkdown>{chartData.summary}</ReactMarkdown>
                               </div>
                             </PalmLeafCard>
                          </div>
                       </div>
                    </div>
                 )}

                 {view === AppView.MATCHMAKING && <Matchmaking lang={lang} onBack={() => setView(AppView.DASHBOARD)} />}
                 {view === AppView.REMEDIES && <RemediesPortal chart={chartData} lang={lang} onBack={() => setView(AppView.DASHBOARD)} />}
                 {view === AppView.DIVINE_CINEMA && <DivineCinema lang={lang} onBack={() => setView(AppView.DASHBOARD)} />}
                 {view === AppView.RISHI_COUNCIL && <RishiCouncil chart={chartData} lang={lang} onBack={() => setView(AppView.DASHBOARD)} />}
                 {view === AppView.SCRIPTURE_RESEARCH && <ScriptureResearch lang={lang} onBack={() => setView(AppView.DASHBOARD)} />}
                 {view === AppView.TODAY_HOROSCOPE && <TodayHoroscope chart={chartData} lang={lang} onBack={() => setView(AppView.DASHBOARD)} />}
                 {view === AppView.PREDICTIONS && <PredictionPanel forecasts={chartData.forecasts} chart={chartData} lang={lang} onBack={() => setView(AppView.DASHBOARD)} />}
                 {view === AppView.PALMISTRY && <PalmistryReader lang={lang} onBack={() => setView(AppView.DASHBOARD)} onComplete={() => {}} />}
                 {view === AppView.CHAT && <ChatInterface initialContext={`User: ${chartData.ascendant} Ascendant`} lang={lang} onBack={() => setView(AppView.DASHBOARD)} />}
                 {view === AppView.VISION && <VisionInterface onBack={() => setView(AppView.DASHBOARD)} />}
                 {view === AppView.AI_GUIDE && <AIAgentGuide onBack={() => setView(AppView.DASHBOARD)} />}
              </div>
            </div>
          )}
        </ErrorBoundary>
      </main>
    </div>
  );
};

export default App;
