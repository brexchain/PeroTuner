import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, ArrowUp, ArrowDown, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useTuner } from '../hooks/useTuner';
import { GUITAR_STRINGS } from '../lib/audio-utils';

export default function TunerUI() {
  const { isActive, noteInfo, clarity, error, directionHint, isWrongDirection, startTuner, stopTuner } = useTuner();

  const isInTune = noteInfo && Math.abs(noteInfo.cents) < 5;

  return (
    <div className="h-screen w-full bg-[#08090b] text-zinc-300 font-sans flex flex-col overflow-hidden relative">
      {/* Background Glow */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none transition-opacity duration-1000" 
        style={{ 
          backgroundImage: `radial-gradient(circle at 50% 50%, ${isActive ? (isInTune ? '#10b981' : (isWrongDirection ? '#ef4444' : '#f59e0b')) : '#27272a'} 0%, transparent 70%)` 
        }} 
      />
      
      {/* Header */}
      <header className="flex justify-between items-center px-6 md:px-10 py-6 z-10 border-b border-zinc-800/50 bg-[#08090b]/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full transition-all duration-500 ${
            isActive ? (isInTune ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.6)]' : 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.6)]') : 'bg-zinc-700'
          }`} />
          <h1 className="text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase text-zinc-400">
            AcousticTuner <span className="text-amber-500/50 ml-1">Beginner Edition</span>
          </h1>
        </div>
        <div className="hidden md:flex gap-8">
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase tracking-widest text-zinc-500">Ref</span>
            <span className="text-sm font-mono text-amber-500">440Hz</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase tracking-widest text-zinc-500">Status</span>
            <span className="text-sm font-mono text-zinc-300">{isActive ? 'Listening' : 'Standby'}</span>
          </div>
        </div>
      </header>
 
      {/* Main Display */}
      <main className="flex-1 flex flex-col items-center justify-start relative z-10 p-4 pt-10">
        
        {/* Horizontal Tuning Meter (TOP AND BIGGER) */}
        <div className="w-full max-w-3xl px-6 md:px-12 mb-12">
          <div className="flex justify-between text-[10px] md:text-xs tracking-[0.3em] text-zinc-500 mb-4 font-bold uppercase">
            <span className={noteInfo && noteInfo.cents < -20 ? 'text-amber-500 transition-colors' : ''}>Flat</span>
            <span className={isInTune ? 'text-emerald-500 scale-125 transition-all' : 'text-zinc-700'}>In Tune</span>
            <span className={noteInfo && noteInfo.cents > 20 ? 'text-amber-500 transition-colors' : ''}>Sharp</span>
          </div>
          <div className="h-8 w-full bg-zinc-900/30 rounded-lg flex items-center relative overflow-hidden border border-zinc-800/80 shadow-inner">
            {/* Fine graduation marks */}
            <div className="absolute inset-0 flex justify-between px-4 opacity-10 pointer-events-none">
              {Array.from({ length: 41 }).map((_, i) => (
                <div key={i} className={`h-full bg-white ${i % 5 === 0 ? 'w-[1px] opacity-40' : 'w-[0.5px] opacity-20'}`} />
              ))}
            </div>
            
            {/* Center target zone */}
            <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-16 bg-emerald-500/5 z-0" />
            <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-emerald-500/30 z-10" />
            
            {/* Needle indicator (HUGE) */}
            <motion.div 
              className={`h-full absolute left-1/2 w-1.5 z-30 transition-colors duration-300 rounded-full ${
                isInTune ? 'bg-emerald-500 shadow-[0_0_20px_#10b981]' : (isWrongDirection ? 'bg-red-500 shadow-[0_0_20px_#ef4444]' : 'bg-amber-500 shadow-[0_0_20px_#f59e0b]')
              }`}
              animate={{ x: noteInfo ? (noteInfo.cents * 7) : 0 }}
              transition={{ type: 'spring', stiffness: 150, damping: 25 }}
            />

            {/* Glowing glow around needle */}
            <motion.div 
               className={`absolute left-1/2 w-20 h-full -ml-10 blur-xl opacity-20 z-20 transition-colors ${
                 isInTune ? 'bg-emerald-500' : (isWrongDirection ? 'bg-red-500' : 'bg-amber-500')
               }`}
               animate={{ x: noteInfo ? (noteInfo.cents * 7) : 0 }}
            />
          </div>
          
          <div className="mt-4 flex justify-center">
            <span className={`text-sm font-mono transition-colors tracking-[0.4em] ${isActive ? (isInTune ? 'text-emerald-500 font-bold' : 'text-zinc-400') : 'text-zinc-800'}`}>
               {noteInfo ? `${noteInfo.cents > 0 ? '+' : ''}${noteInfo.cents.toFixed(1)} CENTS` : 'STABLE'}
            </span>
          </div>
        </div>

        {/* HINT AREA (MIDDLE) */}
        <div className="mb-8 min-h-[60px] flex items-center justify-center w-full">
          <AnimatePresence mode="wait">
            {isActive && noteInfo && clarity > 0.8 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col items-center"
              >
                {isWrongDirection ? (
                  <div className="flex items-center gap-3 text-red-500 bg-red-500/10 px-6 py-2 rounded-full border border-red-500/20 animate-bounce">
                    <AlertTriangle size={18} />
                    <span className="text-sm font-black uppercase tracking-[0.2em]">Wrong Direction! Turn Oppostite</span>
                  </div>
                ) : directionHint === 'up' ? (
                  <div className="flex items-center gap-2 text-amber-500 px-6 py-2 rounded-full border border-amber-500/10 bg-amber-500/5">
                    <ArrowUp size={24} className="animate-pulse" />
                    <span className="text-lg font-black uppercase tracking-[0.2em]">TIGHTEN UP</span>
                  </div>
                ) : directionHint === 'down' ? (
                  <div className="flex items-center gap-2 text-amber-500 px-6 py-2 rounded-full border border-amber-500/10 bg-amber-500/5">
                    <ArrowDown size={24} className="animate-pulse" />
                    <span className="text-lg font-black uppercase tracking-[0.2em]">LOOSEN DOWN</span>
                  </div>
                ) : directionHint === 'perfect' ? (
                  <div className="flex items-center gap-2 text-emerald-500 px-6 py-2 rounded-full border border-emerald-500/20 bg-emerald-500/10">
                    <CheckCircle2 size={24} />
                    <span className="text-lg font-black uppercase tracking-[0.2em]">PERFECT</span>
                  </div>
                ) : null}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Note Disk (BOTTOM) */}
        <div className="relative w-full max-w-[280px] aspect-square flex items-center justify-center">
          {/* Decorative Rings */}
          <div className="absolute inset-0 rounded-full border border-zinc-800/30 flex items-center justify-center">
             <div className="w-[85%] h-[85%] rounded-full border border-dashed border-zinc-900/50"></div>
          </div>
          
          {/* Inner Display Disk (Smaller) */}
          <div className="absolute inset-0 flex items-center justify-center p-8">
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
                  <div className="w-16 h-16 rounded-full bg-amber-500 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.4)] group-hover:shadow-[0_0_50px_rgba(245,158,11,0.6)] transition-all">
                    <Mic size={28} className="text-[#08090b]" />
                  </div>
                  <span className="text-amber-500 font-bold tracking-[0.3em] uppercase text-[9px] animate-pulse">
                    Begin
                  </span>
                </motion.button>
              )}

              <div className={`text-center transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-0'}`}>
                <AnimatePresence mode="wait">
                  {noteInfo && clarity > 0.8 ? (
                    <motion.div
                      key={noteInfo.note}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.2 }}
                      className="flex flex-col items-center"
                    >
                      <div className={`text-[90px] md:text-[120px] font-black leading-none tracking-tighter transition-colors duration-300 ${
                        isInTune ? 'text-emerald-400 drop-shadow-[0_0_20px_rgba(52,211,153,0.3)]' : 'text-white'
                      }`}>
                        {noteInfo.note}
                        <span className={`text-[25px] md:text-[35px] align-top mt-4 ml-1 font-light ${
                          isInTune ? 'text-emerald-500/50' : 'text-amber-500/50'
                        }`}>{noteInfo.octave}</span>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="text-zinc-800 text-[90px] md:text-[120px] font-black leading-none tracking-tighter animate-pulse">
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
                stroke={isInTune ? "#10b981" : (isWrongDirection ? "#ef4444" : "#f59e0b")} 
                strokeWidth="1.5" 
                strokeDasharray="0.5 4" 
                strokeLinecap="round"
                animate={{ rotate: 360 }}
                transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
              />
            </svg>
          </div>
        </div>
      </main>

      {/* Footer Grid */}
      <footer className="grid grid-cols-1 md:grid-cols-3 border-t border-zinc-800/50 bg-[#0c0d10] z-10">
        <div className="p-6 border-b md:border-b-0 md:border-r border-zinc-800/50 flex flex-col gap-1 hover:bg-zinc-800/20 transition-colors cursor-pointer group">
          <span className="text-[10px] uppercase tracking-widest text-zinc-500">Guide</span>
          <span className="text-sm font-medium text-zinc-200">
            Acoustic Guitar <span className="text-[10px] text-zinc-600 block">E2 A2 D3 G3 B3 E4</span>
          </span>
        </div>
        
        <div className={`p-6 border-b md:border-b-0 md:border-r border-zinc-800/50 flex flex-col gap-1 transition-colors duration-500 ${isActive ? 'bg-amber-500/5' : ''}`}>
          <span className={`text-[10px] uppercase font-bold tracking-widest ${isActive ? 'text-amber-500' : 'text-zinc-500'}`}>
            Frequency
          </span>
          <span className={`text-sm md:text-lg font-mono flex items-center gap-3 ${isActive ? 'text-zinc-200' : 'text-zinc-500'}`}>
            {noteInfo ? `${noteInfo.frequency.toFixed(2)} Hz` : '---.-- Hz'}
          </span>
        </div>

        <div className="p-6 flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <span className="text-[10px] uppercase tracking-widest text-zinc-500">Voice Level</span>
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
                ? 'border-zinc-800 bg-zinc-900 text-red-500 hover:border-red-500' 
                : 'border-zinc-700 text-zinc-400 hover:border-amber-500 hover:text-amber-500'
            }`}
          >
            {isActive ? <MicOff size={24} /> : <Mic size={24} />}
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
