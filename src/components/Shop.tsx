import React from 'react';
import { motion } from 'motion/react';
import { 
  ShoppingBag, 
  Heart, 
  Zap, 
  Shield, 
  ArrowUp, 
  X,
  Coins
} from 'lucide-react';

interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: React.ReactNode;
  color: string;
  onPurchase: () => void;
  disabled?: boolean;
}

interface ShopProps {
  credits: number;
  health: number;
  maxHealth: number;
  onClose: () => void;
  onPurchaseHealth: () => void;
  onPurchaseMaxHealth: () => void;
  onPurchaseShield: () => void;
  onPurchaseRapidFire: () => void;
  onPurchaseTripleShot: () => void;
}

export const Shop: React.FC<ShopProps> = ({
  credits,
  health,
  maxHealth,
  onClose,
  onPurchaseHealth,
  onPurchaseMaxHealth,
  onPurchaseShield,
  onPurchaseRapidFire,
  onPurchaseTripleShot,
}) => {
  const items: ShopItem[] = [
    {
      id: 'repair',
      name: '修复船体',
      description: '恢复 1 点生命值',
      price: 200,
      icon: <Heart size={24} />,
      color: 'text-rose-500',
      onPurchase: onPurchaseHealth,
      disabled: health >= maxHealth,
    },
    {
      id: 'max_health',
      name: '强化装甲',
      description: '永久增加 1 点生命上限',
      price: 1000,
      icon: <ArrowUp size={24} />,
      color: 'text-blue-500',
      onPurchase: onPurchaseMaxHealth,
    },
    {
      id: 'shield',
      name: '能量护盾',
      description: '获得一个抵挡伤害的护盾',
      price: 300,
      icon: <Shield size={24} />,
      color: 'text-emerald-500',
      onPurchase: onPurchaseShield,
    },
    {
      id: 'rapid_fire',
      name: '急速射击',
      description: '立即获得 15 秒急速射击',
      price: 500,
      icon: <Zap size={24} />,
      color: 'text-yellow-500',
      onPurchase: onPurchaseRapidFire,
    },
    {
      id: 'triple_shot',
      name: '三向子弹',
      description: '立即获得 15 秒三向子弹',
      price: 600,
      icon: <Zap size={24} />,
      color: 'text-rose-400',
      onPurchase: onPurchaseTripleShot,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="absolute inset-0 z-30 flex items-center justify-center p-4"
    >
      <div className="glass-dark backdrop-blur-2xl w-full max-w-2xl rounded-3xl border border-white/10 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-bottom border-white/5 flex justify-between items-center bg-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
              <ShoppingBag size={24} />
            </div>
            <div>
              <h2 className="text-xl font-display font-bold uppercase tracking-wider">星际商店</h2>
              <p className="text-xs text-white/40 uppercase">升级你的战机以应对更强的敌人</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="glass px-4 py-2 rounded-xl flex items-center gap-2 border-amber-500/20">
              <Coins size={18} className="text-amber-400" />
              <span className="font-display font-bold text-xl text-amber-400">{credits}</span>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Items Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item) => (
            <button
              key={item.id}
              disabled={item.disabled || credits < item.price}
              onClick={item.onPurchase}
              className={`
                flex items-center gap-4 p-4 rounded-2xl border transition-all text-left
                ${item.disabled || credits < item.price 
                  ? 'bg-white/5 border-white/5 opacity-50 cursor-not-allowed' 
                  : 'glass hover:bg-white/10 border-white/10 active:scale-[0.98]'}
              `}
            >
              <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center ${item.color}`}>
                {item.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-bold">{item.name}</h3>
                <p className="text-xs text-white/50">{item.description}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 justify-end text-amber-400 font-bold">
                  <Coins size={14} />
                  {item.price}
                </div>
                {item.disabled && <span className="text-[10px] text-rose-400 uppercase font-bold">已满</span>}
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="p-6 bg-white/5 text-center">
          <button 
            onClick={onClose}
            className="btn-glass px-8 py-3 w-full md:w-auto border-white/10 hover:border-white/30"
          >
            返回战斗
          </button>
        </div>
      </div>
    </motion.div>
  );
};
