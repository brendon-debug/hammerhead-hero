import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Item, Stats } from '../types';
import { Sword, Shield, X, Coins, ShoppingCart } from 'lucide-react';
import { ITEMS } from '../constants';

interface ShopOverlayProps {
  inventory: Item[];
  gold: number;
  shopTitle?: string;
  shopItems?: Item[];
  onBuy: (item: Item) => void;
  onSell: (item: Item) => void;
  onClose: () => void;
}

export const ShopOverlay: React.FC<ShopOverlayProps> = ({
  inventory,
  gold,
  shopTitle = "BLACKSMITH SHOP",
  shopItems = [
    ITEMS.rusty_sword,
    ITEMS.steel_blade,
    ITEMS.poison_steel_sword,
    ITEMS.leather_armor,
    ITEMS.kelp
  ],
  onBuy,
  onSell,
  onClose
}) => {

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-slate-900 border-2 border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <ShoppingCart className="text-emerald-500" size={32} />
            <h2 className="text-3xl font-black text-white tracking-tight">{shopTitle}</h2>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-full border border-slate-700">
              <Coins className="text-yellow-400" size={20} />
              <span className="text-xl font-black text-white">{gold}</span>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
              <X className="text-slate-400" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Buy Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Buy Gear</h3>
            <div className="grid grid-cols-1 gap-3">
              {shopItems.map((item) => (
                <div 
                  key={`buy-${item.id}`}
                  className="bg-slate-800/30 border border-slate-700 p-4 rounded-xl flex items-center justify-between group hover:bg-slate-800/50 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 flex items-center justify-center overflow-hidden">
                      {item.sprite.startsWith('http') ? (
                        <img src={item.sprite} alt={item.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                      ) : (
                        <span className={`text-3xl ${item.id === 'poison_steel_sword' ? 'poison-sword-tint' : ''}`}>
                          {item.sprite}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">{item.name}</p>
                      <p className="text-slate-500 text-xs">{item.description}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => onBuy(item)}
                    disabled={gold < item.value}
                    className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2 ${
                      gold >= item.value 
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white' 
                        : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                    }`}
                  >
                    <Coins size={14} /> {item.value}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Sell Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Sell Your Loot</h3>
            {inventory.length === 0 ? (
              <div className="h-40 flex items-center justify-center border-2 border-dashed border-slate-800 rounded-xl">
                <p className="text-slate-600 font-bold">Nothing to sell...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {inventory.map((item, idx) => (
                  <div 
                    key={`sell-${item.id}-${idx}`}
                    className="bg-slate-800/30 border border-slate-700 p-4 rounded-xl flex items-center justify-between group hover:bg-slate-800/50 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative w-12 h-12 flex items-center justify-center overflow-hidden">
                        {item.sprite.startsWith('http') ? (
                          <img src={item.sprite} alt={item.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                        ) : (
                          <span className={`text-3xl ${item.id === 'poison_steel_sword' ? 'poison-sword-tint' : ''}`}>
                            {item.sprite}
                          </span>
                        )}
                        {item.quantity && item.quantity > 1 && (
                          <div className="absolute -bottom-1 -right-1 bg-sky-600 text-white text-[8px] font-black px-1 rounded-full border border-sky-400">
                            x{item.quantity}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-white font-bold text-sm">{item.name}</p>
                        <p className="text-slate-500 text-xs">Value: {Math.floor(item.value / 2)} gold</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => onSell(item)}
                      className="px-4 py-2 bg-rose-600/20 hover:bg-rose-600/40 text-rose-400 border border-rose-600/50 rounded-lg font-bold transition-all"
                    >
                      SELL
                    </button>
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
