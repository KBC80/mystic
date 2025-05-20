import type { LucideIcon } from 'lucide-react';
import { PenTool, Baby, CloudMoon, LayoutGrid, Home, Ticket, Sparkles, Star, TrendingUp, CalendarHeart, WandSparkles as WandIcon, Heart, Users } from 'lucide-react';

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  label?: string;
  disabled?: boolean;
  subItems?: NavItem[]; 
}

export const navItems: NavItem[] = [
  {
    title: '홈',
    href: '/',
    icon: Home,
  },
  {
    title: '이름 풀이',
    href: '/name-interpretation',
    icon: PenTool,
  },
  {
    title: '천생연분 궁합',
    href: '/relationship-compatibility',
    icon: Heart,
  },
  {
    title: '작명 도우미',
    href: '/name-generation',
    icon: Baby,
  },
  {
    title: '재미로 보는 운세', 
    href: '/fortune-telling', 
    icon: Sparkles, 
    // Sub-items for fortune telling can be listed on the /fortune-telling page itself as cards.
    // If direct sidebar navigation to sub-items is needed, define them here.
    // For now, /fortune-telling acts as a landing page for various fortune types.
  },
  {
    title: '꿈 해몽',
    href: '/dream-interpretation',
    icon: CloudMoon,
  },
  {
    title: '로또 정보',
    href: '/lotto-recommendation',
    icon: Ticket, 
  },
];

