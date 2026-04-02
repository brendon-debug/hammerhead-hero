
import React from 'react';
import { motion } from 'motion/react';
import { Book, X, Scroll } from 'lucide-react';

interface StoryOverlayProps {
  onClose: () => void;
}

export const StoryOverlay: React.FC<StoryOverlayProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-slate-900 border-2 border-amber-500/50 rounded-2xl p-8 max-w-2xl w-full relative shadow-[0_0_50px_rgba(245,158,11,0.1)]"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-all"
        >
          <X size={24} />
        </button>

        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-amber-500/20 rounded-xl text-amber-400">
            <Book size={32} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Chronicles of the Deep</h2>
            <p className="text-amber-500/60 text-xs font-bold uppercase tracking-widest">The Legend of the Hammerhead Hero</p>
          </div>
        </div>

        <div className="space-y-6 text-slate-300 leading-relaxed max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar">
          <section className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50">
            <h3 className="text-amber-400 font-bold mb-2 flex items-center gap-2">
              <Scroll size={16} /> The Great Calamity
            </h3>
            <p>
              Four hundred years ago, the ocean was not the peaceful place it is today. The sky turned black, and the waters boiled as the <span className="text-purple-400 font-bold drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]">Corrupted Abyssal Maw</span> rose from the deepest trenches. It sought to consume all light and life, turning the vibrant reefs into silent graveyards.
            </p>
          </section>

          <section className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50">
            <h3 className="text-amber-400 font-bold mb-2 flex items-center gap-2">
              <Scroll size={16} /> The First Hero
            </h3>
            <p>
              A lone shark, a Hammerhead of unusual strength and wisdom, rose to challenge the Maw. Armed with a blade forged from fallen stars and tempered in the coldest currents, the Hero battled the beast for seven days and seven nights. 
            </p>
            <p className="mt-2 italic text-slate-400">
              "With a final strike that split the currents, the Hero sealed the Maw within the Abyssal Trench using three mystical keys."
            </p>
          </section>

          <section className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50">
            <h3 className="text-amber-400 font-bold mb-2 flex items-center gap-2">
              <Scroll size={16} /> The Three Keys
            </h3>
            <p>
              To ensure the Maw would never return, the Hero entrusted the keys to the guardians of the sea:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-slate-400">
              <li>The <span className="text-white">Grotto Key</span>, held by the Goblin Queen.</li>
              <li>The <span className="text-white">Peak Key</span>, guarded by the Diamond Gorilla.</li>
              <li>The <span className="text-white">Lair Key</span>, protected by Bob the Dragon.</li>
            </ul>
          </section>

          <section className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50">
            <h3 className="text-amber-400 font-bold mb-2 flex items-center gap-2">
              <Scroll size={16} /> Your Destiny
            </h3>
            <p>
              The seals are weakening. The goblins grow restless, and the dragons have returned to the surface. You, a descendant of the Hammerhead lineage, bear the mark of the Hero. Azeran the Wizard has been waiting for your arrival. The fate of the seven seas rests on your fins.
            </p>
          </section>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-[0.3em]">May the currents guide you.</p>
        </div>
      </motion.div>
    </div>
  );
};
