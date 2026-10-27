import { Coffee, Crosshair, GraduationCap, Heart, Moon, Sparkles, Users, type LucideIcon } from 'lucide-react';
import type { MeterKey } from '@/lib/days';

export const METER_ICONS: Record<MeterKey, LucideIcon> = {
  health: Heart,
  sleep: Moon,
  focus: Crosshair,
  academic: GraduationCap,
  social: Users,
  rest: Coffee,
  extra: Sparkles,
};
