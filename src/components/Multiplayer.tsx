
import React from 'react';
import { Users, Shield, Zap } from 'lucide-react';
import { motion } from 'motion/react';

interface OtherPlayer {
  id: string;
  name: string;
  level: number;
  pos: { x: number; y: number };
  mapId: string;
}

interface MultiplayerProps {
  players: OtherPlayer[];
  currentMapId: string;
}

export const Multiplayer: React.FC<MultiplayerProps> = ({ players, currentMapId }) => {
  const activePlayers = players.filter(p => p.mapId === currentMapId);

  return (
    <div className="fixed top-4 right-4 z-40 flex flex-col items-end gap-2 pointer-events-none">
      <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700 p-3 rounded-2xl shadow-xl flex items-center gap-3">
        <Users className="text-sky-400" size={20} />
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Online</span>
          <span className="text-lg font-black text-white leading-none">{players.length} Sharks</span>
        </div>
      </div>

      <div className="space-y-1">
        {activePlayers.slice(0, 5).map((player, i) => (
          <motion.div 
            key={player.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-slate-900/40 backdrop-blur-sm border border-slate-800/50 p-2 rounded-xl flex items-center gap-2"
          >
            <div className="w-6 h-6 bg-sky-500/20 rounded-full flex items-center justify-center">
              <Shield size={12} className="text-sky-400" />
            </div>
            <span className="text-xs font-bold text-slate-300">{player.name}</span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 rounded-full font-black">Lvl {player.level}</span>
          </motion.div>
        ))}
        {activePlayers.length > 5 && (
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest text-right pr-2">
            + {activePlayers.length - 5} more in this area
          </div>
        )}
      </div>
    </div>
  );
};
