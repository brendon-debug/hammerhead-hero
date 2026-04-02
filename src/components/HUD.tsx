
import React from 'react';
import { Stats } from '../types';
import { Heart, Sword, Shield, Coins, Zap, Backpack, ScrollText, Book, Volume2, VolumeX } from 'lucide-react';

interface HUDProps {
  stats: Stats;
  locationName: string;
  isMuted: boolean;
  onMuteToggle: () => void;
  onInventoryOpen: () => void;
  onQuestsOpen: () => void;
  onStoryOpen: () => void;
}

export const HUD: React.FC<HUDProps> = ({ stats, locationName, isMuted, onMuteToggle, onInventoryOpen, onQuestsOpen, onStoryOpen }) => {
  const hpPercent = (stats.hp / stats.maxHp) * 100;

  return (
    <div className="bg-slate-900/80 backdrop-blur-md border-b-2 border-sky-500/30 p-4 sticky top-0 z-40 shadow-[0_4px_20_rgba(14,165,233,0.1)]">
      <div className="absolute inset-0 caustics-overlay opacity-10 pointer-events-none" />
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 relative z-10">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Location</span>
            <span className="text-lg font-bold text-white">{locationName}</span>
          </div>
          
          <div className="h-10 w-px bg-slate-700 hidden sm:block" />

          <div className="flex flex-col min-w-[150px]">
            <div className="flex justify-between items-end mb-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                <Heart size={12} className="text-rose-500" /> Health
              </span>
              <span className="text-xs font-mono text-white">{stats.hp}/{stats.maxHp}</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-rose-500 transition-all duration-300" 
                style={{ width: `${hpPercent}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4 mr-4">
            <button 
              onClick={onStoryOpen}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg border border-slate-700 transition-all flex items-center gap-2"
              title="Story & Lore"
            >
              <Book size={20} />
              <span className="text-xs font-bold uppercase hidden sm:inline">Story</span>
            </button>
            <button 
              onClick={onQuestsOpen}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-lg border border-slate-700 transition-all flex items-center gap-2"
              title="Quest Log"
            >
              <ScrollText size={20} />
              <span className="text-xs font-bold uppercase hidden sm:inline">Quests</span>
            </button>
            <button 
              onClick={onInventoryOpen}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-lg border border-slate-700 transition-all flex items-center gap-2"
              title="Inventory"
            >
              <Backpack size={20} />
              <span className="text-xs font-bold uppercase hidden sm:inline">Items</span>
            </button>
            <button 
              onClick={onMuteToggle}
              className={`p-2 rounded-lg border border-slate-700 transition-all flex items-center gap-2 ${isMuted ? 'bg-rose-900/30 text-rose-400' : 'bg-slate-800 hover:bg-slate-700 text-sky-400'}`}
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              <span className="text-xs font-bold uppercase hidden sm:inline">{isMuted ? 'Muted' : 'Sound'}</span>
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700">
              <Sword size={16} className="text-amber-400" />
              <span className="text-sm font-bold text-white">{stats.attack}</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700">
              <Shield size={16} className="text-blue-400" />
              <span className="text-sm font-bold text-white">{stats.defense}</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700">
              <Coins size={16} className="text-yellow-400" />
              <span className="text-sm font-bold text-white">{stats.gold}</span>
            </div>
            <div className="flex items-center gap-2 bg-emerald-900/30 px-3 py-1.5 rounded-lg border border-emerald-800/50">
              <Zap size={16} className="text-emerald-400" />
              <span className="text-sm font-bold text-emerald-400">LVL {stats.level}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
