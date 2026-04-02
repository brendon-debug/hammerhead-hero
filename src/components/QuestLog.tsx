import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Quest } from '../types';
import { X, Scroll, CheckCircle2, Circle, Trophy } from 'lucide-react';

interface QuestLogProps {
  quests: Quest[];
  onClose: () => void;
}

export const QuestLog: React.FC<QuestLogProps> = ({ quests, onClose }) => {
  const activeQuests = quests.filter(q => q.status === 'active');
  const completedQuests = quests.filter(q => q.status === 'completed');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-slate-900 border-2 border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Scroll className="text-amber-500" size={32} />
            <h2 className="text-3xl font-black text-white tracking-tight">QUEST LOG</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
            <X className="text-slate-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Active Quests */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Active Quests</h3>
            {activeQuests.length === 0 ? (
              <div className="h-40 flex items-center justify-center border-2 border-dashed border-slate-800 rounded-xl">
                <p className="text-slate-600 font-bold">No active quests...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {activeQuests.map((quest) => (
                  <div 
                    key={quest.id}
                    className="bg-slate-800/50 border-l-4 border-amber-500 p-6 rounded-r-xl shadow-lg"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-lg font-bold text-white">
                      {quest.title.includes('Deep Sea Terror') ? (
                        <span className="text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]">{quest.title}</span>
                      ) : quest.title}
                    </h4>
                      <span className={`text-[10px] font-black px-2 py-1 rounded-full ${
                        quest.type === 'main' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50' : 'bg-slate-700 text-slate-400'
                      }`}>
                        {quest.type.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm mb-4 leading-relaxed">
                      {quest.description.split('Corrupted Abyssal Maw').map((part, i, arr) => (
                        <React.Fragment key={i}>
                          {part}
                          {i < arr.length - 1 && (
                            <span className="text-purple-400 font-bold drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]">Corrupted Abyssal Maw</span>
                          )}
                        </React.Fragment>
                      ))}
                    </p>
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 mb-4">
                      <Circle size={12} />
                      <span>
                        {quest.objective.split('Corrupted Abyssal Maw').map((part, i, arr) => (
                          <React.Fragment key={i}>
                            {part}
                            {i < arr.length - 1 && (
                              <span className="text-purple-400 font-bold drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]">Corrupted Abyssal Maw</span>
                            )}
                          </React.Fragment>
                        ))}
                      </span>
                      {quest.targetCount && (
                        <span className="text-slate-500 ml-auto">
                          {quest.currentCount || 0} / {quest.targetCount}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 pt-4 border-t border-slate-700/50">
                      <div className="flex items-center gap-1 text-xs font-bold text-yellow-500">
                        <Trophy size={12} /> {quest.reward.gold} Gold
                      </div>
                      <div className="flex items-center gap-1 text-xs font-bold text-blue-400">
                        <Trophy size={12} /> {quest.reward.exp} EXP
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Completed Quests */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Completed</h3>
            {completedQuests.length === 0 ? (
              <div className="h-40 flex items-center justify-center border-2 border-dashed border-slate-800 rounded-xl">
                <p className="text-slate-600 font-bold">No completed quests yet...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {completedQuests.map((quest) => (
                  <div 
                    key={quest.id}
                    className="bg-slate-800/20 border border-slate-800 p-4 rounded-xl flex items-center justify-between opacity-60"
                  >
                    <div className="flex items-center gap-4">
                      <CheckCircle2 className="text-emerald-500" size={20} />
                      <div>
                        <p className="text-slate-300 font-bold text-sm">{quest.title}</p>
                        <p className="text-slate-500 text-xs">Rewards collected</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
