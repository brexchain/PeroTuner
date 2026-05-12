import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, Settings2, Info } from 'lucide-react';
import { useTuner } from '../hooks/useTuner';
import { GUITAR_STRINGS } from '../lib/audio-utils';

export default function TunerUI() {
  const { isActive, noteInfo, clarity, error, startTuner, stopTuner } = useTuner();

  const getCentsRotation = (cents: number) => {
    // Math.max/min to clamp between -50 and 50
    const clamped = Math.max(-50, Math.min(50, cents));
    return clamped * 1.8; // 1.8 degrees per cent (90 degrees total side to side)
  };

  const isInTune = noteInfo && Math.abs(noteInfo.cents) < 5;

  return (
    <div className="h-screen w-full bg-[#08090b] text-zinc-300 font-sans flex flex-col overflow-hidden relative">
      {/* Background Glow */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none transition-opacity duration-1000" 
        style={{ 
          backgroundImage: `radial-gradient(circle at 50% 50%, ${isActive ? (isInTune ? '#10b981' : '#f59e0b') : '#27272a'} 0%, transparent 70%)` 
        }} 
      />
      
      {/* Header */}
      <header className="flex justify-between items-center px-6 md:px-10 py-6 z-10 border-b border-zinc-800/50 bg-[#08090b]/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full transition-all duration-500 ${
            isActive ? (isInTune ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.6)]' : 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.6)]') : 'bg-zinc-700'
          }`} />
          <h1 className="text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase text-zinc-400">
            StrandTuner Pro <span className="text-amber-500/50 ml-1">v4.2</span>
          </h1>
        </div>
        <div className="hidden md:flex gap-8">
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase tracking-widest text-zinc-500">Reference</span>
            <span className="text-sm font-mono text-amber-500">440.00 Hz</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase tracking-widest text-zinc-500">Input</span>
            <span className="text-sm font-mono text-zinc-300">Acoustic Mic</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase tracking-widest text-zinc-500">Mode</span>
            <span className="text-sm font-mono text-zinc-300">Offline</span>
          </div>
        </div>
      </header>

      {/* Main Display */}
      <main className="flex-1 flex flex-col items-center justify-center relative z-10 p-4">
        <div className="relative w-full max-w-[400px] aspect-square flex items-center justify-center">
          {/* Decorative Rings */}
          <div className="absolute inset-0 rounded-full border border-zinc-800/30 flex items-center justify-center">
             <div className="w-[90%] h-[90%] rounded-full border border-dashed border-zinc-900/50"></div>
          </div>
          
          {/* Inner Display Disk */}
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className={`w-full h-full rounded-full transition-all duration-700 flex items-center justify-center border border-white/5 shadow-2xl relative overflow-hidden ${
              isActive ? 'bg-zinc-900/40' : 'bg-zinc-900/10'
            }`}>
              
              {!isActive && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startTuner}
                  className="z-50 flex flex-col items-center gap-4 group"
                >
                  <div className="w-24 h-24 rounded-full bg-amber-500 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.4)] group-hover:shadow-[0_0_50px_rgba(245,158,11,0.6)] transition-all">
                    <Mic size={40} className="text-[#08090b]" />
                  </div>
                  <span className="text-amber-500 font-bold tracking-[0.3em] uppercase text-xs animate-pulse">
                    Start Tuning
                  </span>
                </motion.button>
              )}

              <div className={`text-center transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-0'}`}>
                <AnimatePresence mode="wait">
                  {noteInfo && clarity > 0.8 ? (
                    <motion.div
                      key={noteInfo.note}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.1 }}
                      className="flex flex-col items-center"
                    >
                      <div className={`text-[120px] md:text-[180px] font-black leading-none tracking-tighter transition-colors duration-300 ${
                        isInTune ? 'text-emerald-400 drop-shadow-[0_0_20px_rgba(52,211,153,0.3)]' : 'text-white'
                      }`}>
                        {noteInfo.note}
                        <span className={`text-[40px] md:text-[60px] align-top mt-6 ml-2 font-light ${
                          isInTune ? 'text-emerald-500/50' : 'text-amber-500/50'
                        }`}>{noteInfo.octave}</span>
                      </div>
                      <div className={`text-sm md:text-lg font-mono tracking-[0.2em] -mt-2 uppercase transition-colors duration-300 ${
                         isInTune ? 'text-emerald-500' : 'text-amber-500'
                      }`}>
                        {isInTune ? 'Perfect Pitch' : (noteInfo.cents > 0 ? 'Sharp' : 'Flat')}
                      </div>
                    </motion.div>
                  ) : (
                    <div className="text-zinc-800 text-[120px] md:text-[180px] font-black leading-none tracking-tighter animate-pulse">
                      --
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* SVG Animated Ring */}
          <div className={`absolute inset-0 transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-20'}`}>
            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
              <circle cx="50" cy="50" r="48" fill="none" stroke="#27272a" strokeWidth="0.5" />
              <motion.circle 
                cx="50" cy="50" r="48" fill="none" 
                stroke={isInTune ? "#10b981" : "#f59e0b"} 
                strokeWidth="1.5" 
                strokeDasharray="0.5 4" 
                strokeLinecap="round"
                animate={{ rotate: 360 }}
                transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
              />
            </svg>
          </div>
          
          {/* Cents Indicator Needle Top */}
          <div className="absolute -top-6 flex flex-col items-center">
             <motion.div 
               className={`w-1 h-12 transition-colors duration-300 ${isActive ? (isInTune ? 'bg-emerald-500 shadow-[0_0_15px_#10b981]' : 'bg-amber-500 shadow-[0_0_15px_#f59e0b]') : 'bg-zinc-800'}`}
               animate={{ x: noteInfo ? (noteInfo.cents * 1.5) : 0 }}
               transition={{ type: 'spring', stiffness: 50 }}
             />
             <span className={`text-[10px] mt-2 tracking-[0.3em] font-bold transition-colors ${isActive ? (isInTune ? 'text-emerald-500' : 'text-amber-500') : 'text-zinc-600'}`}>
                {noteInfo ? `${noteInfo.cents > 0 ? '+' : ''}${noteInfo.cents.toFixed(1)} CENTS` : '0.0 CENTS'}
             </span>
          </div>
        </div>

        {/* Horizontal Tuning Meter */}
        <div className="w-full max-w-xl px-10 mt-12">
          <div className="flex justify-between text-[8px] md:text-[10px] tracking-widest text-zinc-600 mb-3 font-bold">
            <span>-50</span>
            <span>-25</span>
            <span className={isInTune ? 'text-emerald-500' : 'text-amber-500/50'}>IN TUNE</span>
            <span>+25</span>
            <span>+50</span>
          </div>
          <div className="h-1.5 w-full bg-zinc-900 rounded-full flex items-center relative overflow-hidden border border-white/5">
            {/* Center mark */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-zinc-800 z-10" />
            {/* Needle line */}
            <motion.div 
              className={`h-full absolute left-1/2 w-0.5 z-20 ${isInTune ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-amber-500 shadow-[0_0_8px_#f59e0b]'}`}
              animate={{ x: noteInfo ? (noteInfo.cents * 2.5) : 0 }}
              transition={{ type: 'spring', stiffness: 100, damping: 15 }}
            />
            {/* Dot indicator */}
            <motion.div 
              className={`h-2 w-2 rounded-full absolute left-1/2 top-1/2 -translate-y-1/2 z-30 ${isInTune ? 'bg-emerald-400 shadow-[0_0_10px_#34d399]' : 'bg-amber-400 shadow-[0_0_10px_#fbbf24]'}`}
              animate={{ x: noteInfo ? (noteInfo.cents * 2.5) - 4 : -4 }}
              transition={{ type: 'spring', stiffness: 100, damping: 15 }}
            />
          </div>
        </div>
      </main>

      {/* Footer Grid */}
      <footer className="grid grid-cols-1 md:grid-cols-3 border-t border-zinc-800/50 bg-[#0c0d10] z-10">
        <div className="p-6 border-b md:border-b-0 md:border-r border-zinc-800/50 flex flex-col gap-1 hover:bg-zinc-800/20 transition-colors cursor-pointer group">
          <span className="text-[10px] uppercase tracking-widest text-zinc-500">Active Tuning</span>
          <span className="text-sm md:text-base font-medium text-zinc-200 flex items-center justify-between">
            Standard E <span className="text-[10px] text-zinc-600 group-hover:text-zinc-400 transition-colors">E A D G B E</span>
          </span>
        </div>
        
        <div className={`p-6 border-b md:border-b-0 md:border-r border-zinc-800/50 flex flex-col gap-1 transition-colors duration-500 ${isActive ? 'bg-amber-500/5' : ''}`}>
          <span className={`text-[10px] uppercase font-bold tracking-widest ${isActive ? 'text-amber-500' : 'text-zinc-500'}`}>
            Pitch Accuracy
          </span>
          <span className={`text-sm md:text-lg font-mono flex items-center gap-3 ${isActive ? 'text-zinc-200' : 'text-zinc-500'}`}>
            {noteInfo ? `${noteInfo.frequency.toFixed(2)} Hz` : '000.00 Hz'}
            <span className="text-[10px] opacity-40">± 0.01</span>
          </span>
        </div>

        <div className="p-6 flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <span className="text-[10px] uppercase tracking-widest text-zinc-500">Input Level</span>
            <div className="flex items-end gap-1 h-6 w-32">
               {Array.from({ length: 8 }).map((_, i) => {
                 const barH = [20, 40, 90, 70, 50, 30, 20, 10][i];
                 return (
                   <motion.div 
                     key={i} 
                     className={`w-1 transition-all duration-300 ${
                       isActive && (clarity * 8 > i) ? (isInTune ? 'bg-emerald-500 shadow-[0_0_5px_#10b981]' : 'bg-amber-500 shadow-[0_0_5px_#f59e0b]') : 'bg-zinc-800'
                     }`}
                     style={{ height: `${barH}%` }}
                     animate={{ height: isActive ? `${barH + (Math.random() * 10 - 5)}%` : `${barH}%` }}
                   />
                 );
               })}
            </div>
          </div>
          
          <button 
            id="tuner-toggle"
            onClick={isActive ? stopTuner : startTuner}
            className={`w-14 h-14 rounded-full border flex items-center justify-center transition-all duration-500 group ${
              isActive 
                ? 'border-red-900/50 bg-red-900/10 text-red-500 hover:border-red-500' 
                : 'border-zinc-700 text-zinc-400 hover:border-amber-500 hover:text-amber-500'
            }`}
          >
            {isActive ? <MicOff size={24} /> : <Mic size={24} className={isActive ? '' : 'group-hover:scale-110'} />}
          </button>
        </div>
      </footer>

      {error && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 bg-red-500/10 border border-red-500/20 px-4 py-2 rounded text-[10px] text-red-500 uppercase tracking-widest">
          {error}
        </div>
      )}
    </div>
  );
}
