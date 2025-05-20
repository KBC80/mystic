import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { AppHeader } from '@/components/layout/app-header';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Mystic Muse',
  description: '통합 운세 서비스: 사주, 작명, 타로, 꿈 해석을 제공합니다.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={cn(geistSans.variable, geistMono.variable, "antialiased font-sans")}>
        {/* KakaoScriptLoader removed */}
        <SidebarProvider defaultOpen={true}>
          <AppSidebar />
          <div className="flex flex-1 flex-col min-h-screen"> 
            <AppHeader />
            <main className="flex-1 flex flex-col p-4 md:p-6 lg:p-8"> 
              {children}
            </main>
          </div>
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}
