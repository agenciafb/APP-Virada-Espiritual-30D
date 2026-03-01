import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Flame, 
  Calendar, 
  ShieldAlert, 
  Quote, 
  CheckCircle2, 
  ChevronRight, 
  ArrowLeft,
  Sun,
  Moon,
  Lock,
  Star,
  BookOpen,
  Volume2,
  Loader2,
  User as UserIcon,
  Share2,
  Trophy
} from 'lucide-react';
import { User, Day, Prayer, Checklist, Declaration } from './types';
import { GoogleGenAI, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// --- Components ---

const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  className = '',
  disabled = false 
}: { 
  children: React.ReactNode; 
  onClick?: () => void; 
  variant?: 'primary' | 'secondary' | 'outline' | 'gold';
  className?: string;
  disabled?: boolean;
}) => {
  const variants = {
    primary: 'bg-zinc-800 hover:bg-zinc-700 text-white',
    secondary: 'bg-white text-black hover:bg-zinc-200',
    outline: 'border border-white/20 hover:bg-white/10 text-white',
    gold: 'gold-gradient text-white shadow-lg shadow-gold-600/20 hover:opacity-90'
  };

  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`px-6 py-3 rounded-xl font-medium transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

const ProgressBar = ({ current, total }: { current: number; total: number }) => {
  const percentage = Math.min((current / total) * 100, 100);
  return (
    <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        className="h-full gold-gradient"
      />
    </div>
  );
};

// --- Pages ---

const LoginPage = ({ onLogin, theme, onToggleTheme }: { onLogin: (email: string) => void; theme: 'light' | 'dark'; onToggleTheme: () => void }) => {
  const [email, setEmail] = useState('');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="absolute top-6 right-6">
        <button onClick={onToggleTheme} className="p-3 rounded-full bg-zinc-900/10 dark:bg-zinc-100/10 border border-zinc-200 dark:border-white/10">
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md text-center space-y-8"
      >
        <div className="space-y-2">
          <h1 className="text-4xl font-serif italic gold-text">Virada Espiritual</h1>
          <p className="opacity-60">Sua jornada de 30 dias com Deus começa aqui.</p>
        </div>

        <div className="space-y-4">
          <input 
            type="email" 
            placeholder="Seu melhor e-mail"
            className="app-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button 
            variant="gold" 
            className="w-full py-4 text-lg"
            onClick={() => email && onLogin(email)}
          >
            Entrar na Jornada
          </Button>
        </div>

        <div className="flex items-center gap-4 py-4">
          <div className="h-px bg-white/10 flex-1" />
          <span className="text-zinc-500 text-sm">ou continue com</span>
          <div className="h-px bg-white/10 flex-1" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" className="flex items-center justify-center gap-2">
            Google
          </Button>
          <Button variant="outline" className="flex items-center justify-center gap-2">
            Apple
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

const HomePage = ({ 
  user, 
  onStartDay, 
  onOpenCrisis, 
  onOpenChecklist, 
  onOpenDeclarations,
  theme,
  onToggleTheme
}: { 
  user: User; 
  onStartDay: (dayId: number) => void;
  onOpenCrisis: () => void;
  onOpenChecklist: () => void;
  onOpenDeclarations: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}) => {
  return (
    <div className="min-h-screen pb-24">
      <header className="p-6 flex justify-between items-center">
        <div>
          <p className="opacity-50 text-sm">Bem-vindo de volta,</p>
          <h2 className="text-xl font-medium">{user.name}</h2>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onToggleTheme} className="p-2 rounded-full border border-zinc-200 dark:border-white/10">
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <div className="flex items-center gap-2 bg-zinc-900/10 dark:bg-zinc-900 px-3 py-1.5 rounded-full border border-zinc-200 dark:border-white/5">
            <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
            <span className="font-bold text-sm">{user.streak}</span>
          </div>
        </div>
      </header>

      <main className="px-6 space-y-8">
        {/* Progress Card */}
        <section className="card-dark p-6 space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <h3 className="text-2xl font-serif italic">Dia {user.progress + 1}</h3>
              <p className="opacity-60 text-sm">Progresso: {user.progress}/30 dias</p>
            </div>
            <div className="text-gold-500 text-sm font-medium">
              {Math.round((user.progress / 30) * 100)}%
            </div>
          </div>
          <ProgressBar current={user.progress} total={30} />
          <Button 
            variant="gold" 
            className="w-full py-4 flex items-center justify-center gap-2"
            onClick={() => onStartDay(user.progress + 1)}
          >
            Começar meus 10 minutos
            <ChevronRight className="w-5 h-5" />
          </Button>
        </section>

        {/* Quick Access */}
        <section className="grid grid-cols-2 gap-4">
          <button 
            onClick={onOpenCrisis}
            className="card-dark p-4 flex flex-col items-center gap-3 hover:bg-zinc-800/50 transition-colors"
          >
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
              <ShieldAlert className="w-6 h-6 text-red-500" />
            </div>
            <span className="font-medium">Modo Crise</span>
          </button>
          <button 
            onClick={onOpenDeclarations}
            className="card-dark p-4 flex flex-col items-center gap-3 hover:bg-zinc-800/50 transition-colors"
          >
            <div className="w-12 h-12 rounded-full bg-gold-500/10 flex items-center justify-center">
              <Quote className="w-6 h-6 text-gold-500" />
            </div>
            <span className="font-medium">Declarações</span>
          </button>
          <button 
            onClick={onOpenChecklist}
            className="card-dark p-4 flex flex-col items-center gap-3 hover:bg-zinc-800/50 transition-colors col-span-2"
          >
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            </div>
            <span className="font-medium">Checklists Diários</span>
          </button>
        </section>

        {/* Daily Verse */}
        <section className="text-center py-8 space-y-4 opacity-60">
          <Quote className="w-8 h-8 mx-auto text-gold-500/40" />
          <p className="text-lg font-serif italic leading-relaxed">
            "Lâmpada para os meus pés é tua palavra e luz, para o meu caminho."
          </p>
          <p className="text-sm uppercase tracking-widest">Salmos 119:105</p>
        </section>
      </main>
    </div>
  );
};

const DayDetail = ({ 
  day, 
  onComplete, 
  onBack 
}: { 
  day: Day; 
  onComplete: () => void; 
  onBack: () => void;
}) => {
  const [reflection, setReflection] = useState('');
  const [playing, setPlaying] = useState(false);

  const playAudio = async () => {
    if (playing) return;
    setPlaying(true);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Leia esta reflexão devocional com voz inspiradora: ${day.reflection}. O versículo base é ${day.verse}.` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const audio = new Audio(`data:audio/wav;base64,${base64Audio}`);
        audio.onended = () => setPlaying(false);
        audio.play();
      } else {
        setPlaying(false);
      }
    } catch (err) {
      console.error("TTS Error:", err);
      setPlaying(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="min-h-screen pb-12"
    >
      <header className="p-6 flex items-center justify-between sticky top-0 bg-transparent backdrop-blur-md z-10">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 -ml-2">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h2 className="text-lg font-medium">Dia {day.id}</h2>
        </div>
        <button 
          onClick={playAudio}
          disabled={playing}
          className="p-3 rounded-full bg-zinc-900/10 dark:bg-zinc-100/10 border border-zinc-200 dark:border-white/10 disabled:opacity-50"
        >
          {playing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Volume2 className="w-5 h-5" />}
        </button>
      </header>

      <main className="px-6 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-serif italic gold-text">{day.title}</h1>
          <div className="p-4 bg-zinc-900/10 dark:bg-zinc-900/50 border-l-2 border-gold-500 italic opacity-80">
            "{day.verse}"
          </div>
        </div>

        <section className="space-y-4">
          <h3 className="text-gold-600 dark:text-gold-500 font-bold uppercase text-xs tracking-widest">Reflexão</h3>
          <p className="opacity-80 leading-relaxed">{day.reflection}</p>
        </section>

        <section className="space-y-4">
          <h3 className="text-gold-600 dark:text-gold-500 font-bold uppercase text-xs tracking-widest">Aplicação Prática</h3>
          <p className="opacity-80 leading-relaxed">{day.application}</p>
        </section>

        <section className="space-y-4">
          <h3 className="text-gold-600 dark:text-gold-500 font-bold uppercase text-xs tracking-widest">Exercício de Escrita</h3>
          <p className="opacity-60 text-sm">{day.exercise}</p>
          <textarea 
            className="app-input min-h-[120px]"
            placeholder="Escreva aqui seus pensamentos..."
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
          />
        </section>

        <section className="card-dark p-6 text-center space-y-4 bg-gold-950/5 dark:bg-gold-950/20 border-gold-500/20">
          <h3 className="text-gold-600 dark:text-gold-500 font-bold uppercase text-xs tracking-widest">Declaração Profética</h3>
          <p className="text-xl font-serif italic">"{day.declaration}"</p>
        </section>

        <Button variant="gold" className="w-full py-4" onClick={onComplete}>
          Concluir Dia {day.id}
        </Button>
      </main>
    </motion.div>
  );
};

const CrisisMode = ({ onBack }: { onBack: () => void }) => {
  const [selectedPrayer, setSelectedPrayer] = useState<Prayer | null>(null);
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [playing, setPlaying] = useState(false);
  const categories = ["Ansiedade", "Medo", "Desânimo", "Ataque Espiritual", "Confusão", "Financeiro", "Família"];

  useEffect(() => {
    fetch('/api/prayers')
      .then(res => res.json())
      .then(data => setPrayers(data));
  }, []);

  const getPrayerByCategory = (cat: string) => {
    return prayers.find(p => p.category === cat) || prayers[0];
  };

  const playAudio = async (text: string) => {
    if (playing) return;
    setPlaying(true);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Leia esta oração de forma calma e inspiradora: ${text}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const audio = new Audio(`data:audio/wav;base64,${base64Audio}`);
        audio.onended = () => setPlaying(false);
        audio.play();
      } else {
        setPlaying(false);
      }
    } catch (err) {
      console.error("TTS Error:", err);
      setPlaying(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen pb-12"
    >
      <header className="p-6 flex items-center gap-4">
        <button onClick={onBack} className="p-2 -ml-2">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-lg font-medium">Modo Crise</h2>
      </header>

      <main className="px-6 space-y-6">
        <AnimatePresence mode="wait">
          {!selectedPrayer ? (
            <motion.div 
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 gap-3"
            >
              <p className="opacity-60 mb-2">O que você está enfrentando agora?</p>
              {categories.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setSelectedPrayer(getPrayerByCategory(cat))}
                  className="card-dark p-5 flex justify-between items-center hover:bg-zinc-800/20 transition-colors"
                >
                  <span className="text-lg font-medium">{cat}</span>
                  <ChevronRight className="w-5 h-5 opacity-40" />
                </button>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              key="prayer"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-8"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <span className="text-red-500 font-bold uppercase text-xs tracking-widest">{selectedPrayer.category}</span>
                  <h1 className="text-3xl font-serif italic gold-text">{selectedPrayer.title}</h1>
                </div>
                <button 
                  onClick={() => playAudio(selectedPrayer.content)}
                  disabled={playing}
                  className="p-3 rounded-full bg-zinc-900/10 dark:bg-zinc-100/10 border border-zinc-200 dark:border-white/10 disabled:opacity-50"
                >
                  {playing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Volume2 className="w-5 h-5" />}
                </button>
              </div>

              <div className="space-y-4 opacity-80 leading-relaxed text-lg">
                {selectedPrayer.content.split('\n').map((p, i) => <p key={i}>{p}</p>)}
              </div>

              <div className="card-dark p-6 text-center space-y-4 bg-red-950/5 dark:bg-red-950/10 border-red-500/20">
                <h3 className="text-red-500 font-bold uppercase text-xs tracking-widest">Declaração de Poder</h3>
                <p className="text-xl font-serif italic">"{selectedPrayer.declaration}"</p>
              </div>

              <Button variant="outline" className="w-full" onClick={() => { setSelectedPrayer(null); setPlaying(false); }}>
                Escolher outro motivo
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </motion.div>
  );
};

const DeclarationsPage = ({ onBack }: { onBack: () => void }) => {
  const [declarations, setDeclarations] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/declarations')
      .then(res => res.json())
      .then(data => setDeclarations(data));
  }, []);

  const handleShare = (decl: any) => {
    if (navigator.share) {
      navigator.share({
        title: 'Declaração Profética',
        text: `"${decl.content}" - ${decl.reference}`,
        url: window.location.href,
      });
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen pb-12"
    >
      <header className="p-6 flex items-center gap-4">
        <button onClick={onBack} className="p-2 -ml-2">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-lg font-medium">Declarações</h2>
      </header>

      <main className="px-6 space-y-6">
        <p className="opacity-60">Ative as promessas sobre sua vida.</p>
        <div className="space-y-4">
          {declarations.map(decl => (
            <motion.div 
              key={decl.id}
              whileHover={{ scale: 1.02 }}
              className="card-dark p-6 space-y-3 relative group"
            >
              <button 
                onClick={() => handleShare(decl)}
                className="absolute top-4 right-4 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Share2 className="w-4 h-4 opacity-40" />
              </button>
              <Quote className="w-5 h-5 text-gold-500 opacity-40" />
              <p className="text-xl font-serif italic leading-relaxed">"{decl.content}"</p>
              <p className="text-xs uppercase tracking-widest text-gold-600 dark:text-gold-500">{decl.reference}</p>
            </motion.div>
          ))}
        </div>
      </main>
    </motion.div>
  );
};

const ProfilePage = ({ user, onBack, onLogout }: { user: User; onBack: () => void; onLogout: () => void }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="min-h-screen pb-12"
    >
      <header className="p-6 flex items-center gap-4">
        <button onClick={onBack} className="p-2 -ml-2">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-lg font-medium">Meu Perfil</h2>
      </header>

      <main className="px-6 space-y-8">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-24 h-24 rounded-full gold-gradient flex items-center justify-center text-white text-3xl font-bold">
            {user.name[0].toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p className="opacity-50 text-sm">{user.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="card-dark p-6 text-center space-y-2">
            <Trophy className="w-6 h-6 mx-auto text-gold-500" />
            <div className="text-2xl font-bold">{user.progress}</div>
            <div className="text-[10px] uppercase tracking-widest opacity-50">Dias Concluídos</div>
          </div>
          <div className="card-dark p-6 text-center space-y-2">
            <Flame className="w-6 h-6 mx-auto text-orange-500" />
            <div className="text-2xl font-bold">{user.streak}</div>
            <div className="text-[10px] uppercase tracking-widest opacity-50">Dias Seguidos</div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest opacity-40">Configurações</h3>
          <button onClick={onLogout} className="w-full card-dark p-4 text-left text-red-500 flex items-center gap-3">
            <Lock className="w-5 h-5" />
            <span>Sair da Conta</span>
          </button>
        </div>
      </main>
    </motion.div>
  );
};

const ChecklistPage = ({ userId, onBack }: { userId: number; onBack: () => void }) => {
  const [morning, setMorning] = useState<string[]>([]);
  const [night, setNight] = useState<string[]>([]);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetch(`/api/checklists/${userId}/${today}`)
      .then(res => res.json())
      .then(data => {
        setMorning(JSON.parse(data.morning_status));
        setNight(JSON.parse(data.night_status));
      });
  }, [userId, today]);

  const saveChecklist = (newMorning: string[], newNight: string[]) => {
    fetch('/api/checklists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        date: today,
        morning_status: newMorning,
        night_status: newNight
      })
    });
  };

  const morningItems = [
    "Agradeci 3 bênçãos",
    "Declarei minha identidade",
    "Li um versículo",
    "Orei por proteção",
    "Identifiquei um ato de obediência"
  ];

  const nightItems = [
    "Onde vi Deus agir hoje?",
    "Que vitória celebro?",
    "O que aprendi?",
    "Pelo que sou grato?"
  ];

  const toggleItem = (item: string, list: string[], setList: (l: string[]) => void, isMorning: boolean) => {
    const newList = list.includes(item) ? list.filter(i => i !== item) : [...list, item];
    setList(newList);
    if (isMorning) saveChecklist(newList, night);
    else saveChecklist(morning, newList);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="min-h-screen pb-12"
    >
      <header className="p-6 flex items-center gap-4">
        <button onClick={onBack} className="p-2 -ml-2">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-lg font-medium">Checklists Diários</h2>
      </header>

      <main className="px-6 space-y-8">
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-gold-500">
            <Sun className="w-5 h-5" />
            <h3 className="font-bold uppercase text-xs tracking-widest">Checklist Matinal</h3>
          </div>
          <div className="space-y-2">
            {morningItems.map(item => (
              <button 
                key={item}
                onClick={() => toggleItem(item, morning, setMorning, true)}
                className={`w-full p-4 rounded-xl border flex items-center gap-3 transition-all ${
                  morning.includes(item) 
                    ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500' 
                    : 'bg-zinc-900/5 dark:bg-zinc-900 border-zinc-200 dark:border-white/5 opacity-60'
                }`}
              >
                <div className={`w-5 h-5 rounded flex items-center justify-center border ${
                  morning.includes(item) ? 'bg-emerald-500 border-emerald-500' : 'border-zinc-300 dark:border-white/20'
                }`}>
                  {morning.includes(item) && <CheckCircle2 className="w-4 h-4 text-white dark:text-black" />}
                </div>
                <span className="text-sm font-medium">{item}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2 text-indigo-500">
            <Moon className="w-5 h-5" />
            <h3 className="font-bold uppercase text-xs tracking-widest">Checklist Noturno</h3>
          </div>
          <div className="space-y-2">
            {nightItems.map(item => (
              <button 
                key={item}
                onClick={() => toggleItem(item, night, setNight, false)}
                className={`w-full p-4 rounded-xl border flex items-center gap-3 transition-all ${
                  night.includes(item) 
                    ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-500' 
                    : 'bg-zinc-900/5 dark:bg-zinc-900 border-zinc-200 dark:border-white/5 opacity-60'
                }`}
              >
                <div className={`w-5 h-5 rounded flex items-center justify-center border ${
                  night.includes(item) ? 'bg-indigo-500 border-indigo-500' : 'border-zinc-300 dark:border-white/20'
                }`}>
                  {night.includes(item) && <CheckCircle2 className="w-4 h-4 text-white dark:text-black" />}
                </div>
                <span className="text-sm font-medium">{item}</span>
              </button>
            ))}
          </div>
        </section>
      </main>
    </motion.div>
  );
};

const DiaryPage = ({ userId, onBack }: { userId: number; onBack: () => void }) => {
  const [gratitude, setGratitude] = useState('');
  const [learning, setLearning] = useState('');
  const [saved, setSaved] = useState(false);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetch(`/api/diary/${userId}/${today}`)
      .then(res => res.json())
      .then(data => {
        setGratitude(data.gratitude);
        setLearning(data.learning);
      });
  }, [userId, today]);

  const handleSave = () => {
    fetch('/api/diary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        date: today,
        gratitude,
        learning
      })
    }).then(() => {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen pb-12"
    >
      <header className="p-6 flex items-center gap-4">
        <button onClick={onBack} className="p-2 -ml-2">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-lg font-medium">Modo Diário</h2>
      </header>

      <main className="px-6 space-y-8">
        <div className="space-y-4">
          <h3 className="text-gold-600 dark:text-gold-500 font-bold uppercase text-xs tracking-widest">Pelo que você é grato hoje?</h3>
          <textarea 
            className="app-input min-h-[120px]"
            placeholder="Hoje sou grato por..."
            value={gratitude}
            onChange={(e) => setGratitude(e.target.value)}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-gold-600 dark:text-gold-500 font-bold uppercase text-xs tracking-widest">O que aprendeu com Deus?</h3>
          <textarea 
            className="app-input min-h-[120px]"
            placeholder="Deus me ensinou que..."
            value={learning}
            onChange={(e) => setLearning(e.target.value)}
          />
        </div>

        <Button variant="gold" className="w-full py-4 flex items-center justify-center gap-2" onClick={handleSave}>
          {saved ? <CheckCircle2 className="w-5 h-5" /> : 'Salvar no Diário'}
          {saved ? 'Salvo!' : ''}
        </Button>

        {saved && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-emerald-500 text-sm"
          >
            Sua reflexão foi guardada com carinho.
          </motion.p>
        )}
      </main>
    </motion.div>
  );
};

export default function App() {
  const [view, setView] = useState<'login' | 'home' | 'day' | 'crisis' | 'checklist' | 'declarations' | 'diary' | 'profile'>('login');
  const [user, setUser] = useState<User | null>(null);
  const [currentDay, setCurrentDay] = useState<Day | null>(null);
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('app_theme') as 'light' | 'dark';
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('light', savedTheme === 'light');
    }

    const savedEmail = localStorage.getItem('user_email');
    if (savedEmail) {
      handleLogin(savedEmail);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('app_theme', newTheme);
    document.documentElement.classList.toggle('light', newTheme === 'light');
  };

  const handleLogin = async (email: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/user/${email}`);
      const userData = await res.json();
      setUser(userData);
      localStorage.setItem('user_email', email);
      setView('home');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const startDay = async (dayId: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/days/${dayId}`);
      const dayData = await res.json();
      setCurrentDay(dayData);
      setView('day');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const completeDay = async () => {
    if (!user || !currentDay) return;
    
    const newProgress = Math.max(user.progress, currentDay.id);
    const newStreak = user.streak + 1; // Simplified streak logic

    try {
      await fetch('/api/user/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, progress: newProgress, streak: newStreak })
      });
      
      setUser({ ...user, progress: newProgress, streak: newStreak });
      setView('home');
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-10 h-10 border-2 border-gold-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto min-h-screen shadow-2xl shadow-black/20 dark:shadow-white/5">
      <AnimatePresence mode="wait">
        {view === 'login' && <LoginPage onLogin={handleLogin} theme={theme} onToggleTheme={toggleTheme} />}
        {view === 'home' && user && (
          <HomePage 
            user={user} 
            onStartDay={startDay}
            onOpenCrisis={() => setView('crisis')}
            onOpenChecklist={() => setView('checklist')}
            onOpenDeclarations={() => setView('declarations')} 
            theme={theme}
            onToggleTheme={toggleTheme}
          />
        )}
        {view === 'day' && currentDay && (
          <DayDetail 
            day={currentDay} 
            onComplete={completeDay} 
            onBack={() => setView('home')} 
          />
        )}
        {view === 'crisis' && <CrisisMode onBack={() => setView('home')} />}
        {view === 'declarations' && <DeclarationsPage onBack={() => setView('home')} />}
        {view === 'checklist' && <ChecklistPage userId={user.id} onBack={() => setView('home')} />}
        {view === 'diary' && <DiaryPage userId={user.id} onBack={() => setView('home')} />}
        {view === 'profile' && <ProfilePage user={user} onBack={() => setView('home')} onLogout={() => {
          localStorage.removeItem('user_email');
          setView('login');
        }} />}
      </AnimatePresence>

      {/* Navigation Bar (only on home) */}
      {view === 'home' && (
        <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto nav-blur px-8 py-4 flex justify-between items-center z-20">
          <button 
            onClick={() => setView('home')}
            className={`${view === 'home' ? 'text-gold-500' : 'opacity-40'} flex flex-col items-center gap-1`}
          >
            <Calendar className="w-6 h-6" />
            <span className="text-[10px] font-bold uppercase">Jornada</span>
          </button>
          <button 
            onClick={() => setView('diary')}
            className={`${view === 'diary' ? 'text-gold-500' : 'opacity-40'} flex flex-col items-center gap-1`}
          >
            <BookOpen className="w-6 h-6" />
            <span className="text-[10px] font-bold uppercase">Diário</span>
          </button>
          <button 
            onClick={() => setView('profile')}
            className={`${view === 'profile' ? 'text-gold-500' : 'opacity-40'} flex flex-col items-center gap-1`}
          >
            <UserIcon className="w-6 h-6" />
            <span className="text-[10px] font-bold uppercase">Perfil</span>
          </button>
        </nav>
      )}
    </div>
  );
}
