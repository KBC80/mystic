
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image'; // Image 컴포넌트 임포트

import { cn } from '@/lib/utils';
import { navItems, type NavItem } from '@/config/nav';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar variant="sidebar" collapsible="icon" className="border-r">
      <SidebarHeader className="p-4">
        <Link href="/" className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
          <Button variant="ghost" size="icon" className="h-10 w-10 flex items-center justify-center">
            <Image src="/image/main.png" alt="Mystic Muse 로고" width={32} height={32} className="object-contain"/>
          </Button>
          <h1 className="text-xl font-semibold text-sidebar-primary-foreground group-data-[collapsible=icon]:hidden break-words">
            Mystic Muse
          </h1>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} passHref legacyBehavior>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))}
                  tooltip={item.title}
                  disabled={item.disabled}
                  className="justify-start"
                >
                  <a>
                    <item.icon className="h-5 w-5" />
                    <span className="group-data-[collapsible=icon]:hidden break-words">{item.title}</span>
                  </a>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4 group-data-[collapsible=icon]:hidden">
        <p className="text-xs text-muted-foreground break-words">
          &copy; {new Date().getFullYear()} Mystic Muse
        </p>
      </SidebarFooter>
    </Sidebar>
  );
}
