
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Entity } from '../types';

interface DialogueOverlayProps {
  entity: Entity;
  onClose: () => void;
  loading?: boolean;
}

export const DialogueOverlay: React.FC<DialogueOverlayProps> = ({ entity, onClose, loading }) => {
  const [index, setIndex] = React.useState(0);
  const dialogue = entity.dialogue || ["..."];

  React.useEffect(() => {
    setIndex(0);
  }, [entity.id, entity.dialogue]);

  const next = () => {
    if (loading) return;
    if (index < dialogue.length - 1) {
      setIndex(index + 1);
    } else {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-50"
      >
        <div className="bg-slate-900 border-2 border-slate-700 rounded-xl p-6 shadow-2xl text-white">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-slate-800 p-2 rounded-lg flex items-center justify-center overflow-hidden">
              {entity.sprite?.startsWith('http') ? (
                <img src={entity.sprite} alt={entity.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
              ) : (
                <span className="text-4xl">{entity.sprite}</span>
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold text-emerald-400">{entity.name}</h3>
              <p className="text-slate-400 text-sm italic uppercase">{entity.type}</p>
            </div>
          </div>
          {loading ? (
            <div className="flex items-center gap-3 text-lg leading-relaxed mb-6 font-medium text-slate-400 italic">
              <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              Generating a unique quest...
            </div>
          ) : (
            <p className="text-lg leading-relaxed mb-6 font-medium">
              "{dialogue[index].split(/(Corrupted Abyssal Maw|Abyssal Maw)/).map((part, i) => (
                <React.Fragment key={i}>
                  {part === 'Corrupted Abyssal Maw' || part === 'Abyssal Maw' ? (
                    <span className="text-purple-400 font-bold drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]">{part}</span>
                  ) : part}
                </React.Fragment>
              ))}"
            </p>
          )}
          <div className="flex justify-end">
            <button
              onClick={next}
              disabled={loading}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 rounded-lg font-bold transition-colors"
            >
              {loading ? '...' : (index < dialogue.length - 1 ? 'Next' : 'Close')}
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
