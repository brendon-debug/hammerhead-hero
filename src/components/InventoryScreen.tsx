import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Item, Stats } from '../types';
import { Sword, Shield, X, Heart } from 'lucide-react';

interface InventoryScreenProps {
  inventory: Item[];
  equippedWeapon: Item | null;
  secondaryWeapon: Item | null;
  equippedArmor: Item | null;
  equippedAccessory: Item | null;
  onEquip: (item: Item) => void;
  onUse: (item: Item) => void;
  onClose: () => void;
  stats: Stats;
}

export const InventoryScreen: React.FC<InventoryScreenProps> = ({
  inventory,
  equippedWeapon,
  secondaryWeapon,
  equippedArmor,
  equippedAccessory,
  onEquip,
  onUse,
  onClose,
  stats
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-slate-900 border-2 border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <h2 className="text-3xl font-black text-white tracking-tight">INVENTORY</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
            <X className="text-slate-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Stats & Equipment */}
          <div className="space-y-6">
            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Equipment</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center border border-slate-700 overflow-hidden">
                    {equippedWeapon ? (
                      equippedWeapon.sprite.startsWith('http') ? (
                        <img src={equippedWeapon.sprite} alt={equippedWeapon.name} className="w-full h-full object-contain p-1" referrerPolicy="no-referrer" />
                      ) : (
                        <span className={`text-2xl ${equippedWeapon.id === 'poison_steel_sword' ? 'poison-sword-tint' : ''}`}>
                          {equippedWeapon.sprite}
                        </span>
                      )
                    ) : (
                      <Sword className="text-slate-600" size={20} />
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase">Weapon</p>
                    <p className="text-white font-bold">{equippedWeapon?.name || 'Empty'}</p>
                  </div>
                </div>

                {equippedAccessory?.baseId === 'sword_holder' && (
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center border border-slate-700 overflow-hidden">
                      {secondaryWeapon ? (
                        secondaryWeapon.sprite.startsWith('http') ? (
                          <img src={secondaryWeapon.sprite} alt={secondaryWeapon.name} className="w-full h-full object-contain p-1" referrerPolicy="no-referrer" />
                        ) : (
                          <span className={`text-2xl ${secondaryWeapon.id === 'poison_steel_sword' ? 'poison-sword-tint' : ''}`}>
                            {secondaryWeapon.sprite}
                          </span>
                        )
                      ) : (
                        <Sword className="text-slate-600 opacity-50" size={20} />
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-bold uppercase">Off-hand Weapon</p>
                      <p className="text-white font-bold">{secondaryWeapon?.name || 'Empty'}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center border border-slate-700 overflow-hidden">
                    {equippedArmor ? (
                      equippedArmor.sprite.startsWith('http') ? (
                        <img src={equippedArmor.sprite} alt={equippedArmor.name} className="w-full h-full object-contain p-1" referrerPolicy="no-referrer" />
                      ) : (
                        <span className="text-2xl">{equippedArmor.sprite}</span>
                      )
                    ) : <Shield className="text-slate-600" size={20} />}
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase">Armor</p>
                    <p className="text-white font-bold">{equippedArmor?.name || 'Empty'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center border border-slate-700 overflow-hidden">
                    {equippedAccessory ? (
                      equippedAccessory.sprite.startsWith('http') ? (
                        <img src={equippedAccessory.sprite} alt={equippedAccessory.name} className="w-full h-full object-contain p-1" referrerPolicy="no-referrer" />
                      ) : (
                        <span className="text-2xl">{equippedAccessory.sprite}</span>
                      )
                    ) : <div className="text-slate-600 text-xs font-bold">RING</div>}
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase">Accessory</p>
                    <p className="text-white font-bold">{equippedAccessory?.name || 'Empty'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Current Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Heart size={16} className="text-rose-500" />
                  <span className="text-white font-mono">{stats.hp}/{stats.maxHp}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sword size={16} className="text-amber-400" />
                  <div className="flex flex-col">
                    <span className="text-white font-mono">{stats.attack}</span>
                    {equippedWeapon && secondaryWeapon && (
                      <span className="text-[10px] text-emerald-400 font-bold uppercase">+20% Dual-Wield Bonus</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Shield size={16} className="text-blue-400" />
                  <span className="text-white font-mono">{stats.defense}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Items List */}
          <div className="md:col-span-2 space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Backpack</h3>
            {inventory.length === 0 ? (
              <div className="h-40 flex items-center justify-center border-2 border-dashed border-slate-800 rounded-xl">
                <p className="text-slate-600 font-bold">Your backpack is empty...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {inventory.map((item, idx) => (
                  <div 
                    key={`${item.id}-${idx}`}
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
                    <div className="flex gap-2">
                      {item.type === 'consumable' ? (
                        <button 
                          onClick={() => onUse(item)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors"
                        >
                          USE
                        </button>
                      ) : item.type === 'quest' ? (
                        <span className="text-[10px] text-slate-500 font-bold uppercase py-1 px-2 bg-slate-900 rounded">Quest Item</span>
                      ) : (
                        <button 
                          onClick={() => onEquip(item)}
                          className={`px-3 py-1 text-white text-xs font-bold rounded-lg transition-colors ${
                            equippedWeapon?.id === item.id || 
                            secondaryWeapon?.id === item.id || 
                            equippedArmor?.id === item.id || 
                            equippedAccessory?.id === item.id
                              ? 'bg-rose-600 hover:bg-rose-500' 
                              : 'bg-blue-600 hover:bg-blue-500'
                          }`}
                        >
                          {equippedWeapon?.id === item.id || 
                           secondaryWeapon?.id === item.id || 
                           equippedArmor?.id === item.id || 
                           equippedAccessory?.id === item.id
                            ? 'UNEQUIP' 
                            : 'EQUIP'}
                        </button>
                      )}
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
