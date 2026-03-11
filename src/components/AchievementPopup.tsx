import React from 'react';
import { Target, Shield, Trophy, Zap, Star } from 'lucide-react';

const iconMap: Record<string, any> = {
  Target,
  Shield,
  Trophy,
  Zap,
  Star,
};

interface AchievementPopupProps {
  achievement: { title: string; description: string; icon: string } | null;
}

export const AchievementPopup: React.FC<AchievementPopupProps> = ({ achievement }) => {
  if (!achievement) return null;

  const Icon = iconMap[achievement.icon] || Star;

  return (
    <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 animate-bounce">
      <div className="glass px-6 py-4 rounded-2xl flex items-center gap-4 border-yellow-500/50">
        <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-500">
          <Icon size={24} />
        </div>
        <div>
          <h4 className="font-display font-bold text-yellow-500">成就解锁！</h4>
          <p className="text-sm font-bold">{achievement.title}</p>
          <p className="text-xs text-white/60">{achievement.description}</p>
        </div>
      </div>
    </div>
  );
};
