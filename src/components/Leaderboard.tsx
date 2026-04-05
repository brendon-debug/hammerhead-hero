
import React from 'react';
import { Trophy, Medal, Star } from 'lucide-react';
import { motion } from 'motion/react';

interface Score {
  name: string;
  level: number;
  gold: number;
  date: string;
}

interface LeaderboardProps {
  scores: Score[];
  onClose: () => void;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ scores, onClose }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
    >
      <div className="bg-slate-900 border-2 border-yellow-500/50 rounded-3xl w-full max-w-2xl overflow-hidden shadow-[0_0_50px_rgba(234,179,8,0.2)]">
        <div className="bg-gradient-to-r from-yellow-600 to-amber-600 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Trophy className="text-white" size={32} />
            <h2 className="text-3xl font-black text-white tracking-tighter">HALL OF HEROES</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-white/80 hover:text-white text-2xl font-bold"
          >
            ✕
          </button>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {scores.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Star size={48} className="mx-auto mb-4 opacity-20" />
              <p className="text-xl font-medium italic">No legends have been written yet...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {scores.sort((a, b) => b.level - a.level || b.gold - a.gold).map((score, i) => (
                <div 
                  key={i}
                  className={`flex items-center justify-between p-4 rounded-2xl border ${
                    i === 0 ? 'bg-yellow-500/10 border-yellow-500/30' : 
                    i === 1 ? 'bg-slate-300/10 border-slate-300/30' :
                    i === 2 ? 'bg-amber-700/10 border-amber-700/30' :
                    'bg-slate-800/30 border-slate-700/30'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 flex items-center justify-center font-black text-xl">
                      {i === 0 ? <Medal className="text-yellow-400" /> : 
                       i === 1 ? <Medal className="text-slate-300" /> :
                       i === 2 ? <Medal className="text-amber-600" /> :
                       <span className="text-slate-500">#{i + 1}</span>}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-white">{score.name}</h3>
                      <p className="text-xs text-slate-500 uppercase tracking-widest">{score.date}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-8">
                    <div className="text-center">
                      <p className="text-xs text-slate-500 uppercase">Level</p>
                      <p className="font-black text-xl text-emerald-400">{score.level}</p>
                    </div>
                    <div className="text-center w-24">
                      <p className="text-xs text-slate-500 uppercase">Gold</p>
                      <p className="font-black text-xl text-yellow-400">{score.gold.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 bg-slate-950/50 border-t border-slate-800 text-center">
          <p className="text-sm text-slate-400">Only the strongest sharks make it to the Hall of Heroes.</p>
        </div>
      </div>
    </motion.div>
  );
};
