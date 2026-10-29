import { GraduationCap, Heart, Moon, Sprout, Users, type LucideIcon } from 'lucide-react';
import type { MeterKey } from '@/lib/days';

export const METER_ICONS: Record<MeterKey, LucideIcon> = {
  sleep: Moon,
  academic: GraduationCap,
  social: Users,
  rest: Heart,
  extra: Sprout,
};
