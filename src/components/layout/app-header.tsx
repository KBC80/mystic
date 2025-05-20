
"use client";

import { usePathname } from 'next/navigation';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { navItems } from '@/config/nav';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes'; 
import { useEffect, useState } from 'react';

export function AppHeader() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  const currentPage = navItems.find(item => item.href === pathname || (item.href !== "/" && pathname.startsWith(item.href)));
  const pageTitle = currentPage ? currentPage.title : "Mystic Muse";

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  if (!mounted) {
    return ( 
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur md:px-6">
        <div className="flex items-center gap-2">
          <div className="md:hidden">
             {/* SidebarTrigger 자리 표시자 */}
          </div>
          <h1 className="text-lg font-semibold md:text-xl break-words">로딩 중...</h1>
        </div>
         {/* ThemeToggle 자리 표시자 */}
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur md:px-6">
      <div className="flex items-center gap-2">
        <div className="md:hidden">
          <SidebarTrigger />
        </div>
        <h1 className="text-lg font-semibold md:text-xl break-words">{pageTitle}</h1>
      </div>
      <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="테마 전환">
        {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
      </Button>
    </header>
  );
}

