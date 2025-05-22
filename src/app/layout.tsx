
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Script from 'next/script';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppHeader } from '@/components/layout/app-header';
import { AppSidebar } from '@/components/layout/app-sidebar';
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
      <head>
      <meta name="google-site-verification" content="cCR-ztFIGjE3d_fBCL-MJ2ILmMI_iq-0tnbYkIciP9o" />
      <meta name="naver-site-verification" content="0da5f9a2c067d35668f801c183d865aae7d8ea1e" />
      <meta name="msvalidate.01" content="726E5D486B11503DB517C26BE9744A3E" />
      {/* Google 애드센스 광고 스크립트 */}
      <meta name="google-adsense-account" content="ca-pub-1164626264867058" />
      <script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1164626264867058"
        crossOrigin="anonymous"
        data-nscript="afterInteractive"
        data-checked-head="true"
      />
      </head>
      <body className={cn(geistSans.variable, geistMono.variable, "antialiased font-sans")}>
        <SidebarProvider defaultOpen={true}>
          <AppSidebar />
          <SidebarInset> {/* SidebarInset이 AppHeader와 main 컨텐츠를 감싸도록 수정 */}
            <AppHeader />
            <main className="flex-1 p-4 md:p-6 lg:p-8">
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}

