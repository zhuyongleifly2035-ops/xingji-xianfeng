import React from 'react';
import { Shield, Zap, MousePointer2, Keyboard, Info, Trophy } from 'lucide-react';

export const Sidebar: React.FC = () => {
  return (
    <div className="hidden lg:flex flex-col gap-6 w-80 h-full overflow-y-auto pr-4">
      <section className="glass p-6 rounded-2xl space-y-4">
        <div className="flex items-center gap-2 text-blue-400">
          <Keyboard size={20} />
          <h3 className="font-display font-bold uppercase">操作指南</h3>
        </div>
        <ul className="space-y-3 text-sm text-white/70">
          <li className="flex justify-between items-center">
            <span>移动</span>
            <span className="px-2 py-1 bg-white/10 rounded text-xs">WASD / 方向键</span>
          </li>
          <li className="flex justify-between items-center">
            <span>射击</span>
            <span className="px-2 py-1 bg-white/10 rounded text-xs">空格键</span>
          </li>
          <li className="flex justify-between items-center">
            <span>暂停</span>
            <span className="px-2 py-1 bg-white/10 rounded text-xs">P 键</span>
          </li>
          <li className="flex justify-between items-center">
            <span>移动端</span>
            <span className="px-2 py-1 bg-white/10 rounded text-xs">触摸移动</span>
          </li>
        </ul>
      </section>

      <section className="glass p-6 rounded-2xl space-y-4">
        <div className="flex items-center gap-2 text-emerald-400">
          <Zap size={20} />
          <h3 className="font-display font-bold uppercase">道具说明</h3>
        </div>
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-lg bg-rose-500/20 flex items-center justify-center text-rose-500 shrink-0">
              <Zap size={20} />
            </div>
            <div>
              <p className="text-sm font-bold">三向子弹</p>
              <p className="text-xs text-white/60">大幅增强火力，持续10秒</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <Shield size={20} />
            </div>
            <div>
              <p className="text-sm font-bold">能量护盾</p>
              <p className="text-xs text-white/60">抵挡一次致命伤害</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center text-yellow-500 shrink-0">
              <Zap size={20} />
            </div>
            <div>
              <p className="text-sm font-bold">急速射击</p>
              <p className="text-xs text-white/60">射击频率翻倍，持续10秒</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-500 shrink-0">
              <Trophy size={20} />
            </div>
            <div>
              <p className="text-sm font-bold">积分加成</p>
              <p className="text-xs text-white/60">立即获得 500 积分</p>
            </div>
          </div>
        </div>
      </section>

      <section className="glass p-6 rounded-2xl space-y-4">
        <div className="flex items-center gap-2 text-amber-400">
          <Info size={20} />
          <h3 className="font-display font-bold uppercase">游戏提示</h3>
        </div>
        <p className="text-xs text-white/60 leading-relaxed">
          击毁敌机获得积分。每获得2000分提升一个关卡。
          <br /><br />
          <span className="text-rose-400 font-bold">注意：</span> 漏掉敌机将扣除50分！
        </p>
      </section>
    </div>
  );
};
