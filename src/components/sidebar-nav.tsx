
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  TextSearchIcon,
  UsersIcon,
  BabyIcon,
  SparklesIcon,
  MoonStarIcon,
  TicketIcon,
  LucideIcon,
} from "lucide-react";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  matchExact?: boolean;
}

const navItems: NavItem[] = [
  { href: "/", label: "홈 (Home)", icon: HomeIcon, matchExact: true },
  { href: "/name-analysis", label: "이름 풀이", icon: TextSearchIcon },
  { href: "/relationship-compatibility", label: "천생연분 궁합", icon: UsersIcon },
  { href: "/baby-name-generator", label: "작명 도우미", icon: BabyIcon },
  { href: "/personalized-horoscopes", label: "재미로 보는 운세", icon: SparklesIcon },
  { href: "/dream-interpretation", label: "꿈 해몽", icon: MoonStarIcon },
  { href: "/lottery-number-generator", label: "로또 정보", icon: TicketIcon },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>탐색</SidebarGroupLabel>
      <SidebarMenu>
        {navItems.map((item) => {
          const isActive = item.matchExact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} passHref legacyBehavior>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  className={cn(isActive && "bg-sidebar-accent text-sidebar-accent-foreground")}
                  tooltip={item.label}
                >
                  <a>
                    <item.icon />
                    <span>{item.label}</span>
                  </a>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
