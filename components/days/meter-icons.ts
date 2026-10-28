import { Coffee, Crosshair, GraduationCap, Moon, Sparkles, Users, type LucideIcon } from 'lucide-react';
import type { MeterKey } from '@/lib/days';

export const METER_ICONS: Record<MeterKey, LucideIcon> = {
  sleep: Moon,
  focus: Crosshair,
  academic: GraduationCap,
  social: Users,
  rest: Coffee,
  extra: Sparkles,
};
