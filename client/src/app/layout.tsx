import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { QueryProvider } from '@/contexts/QueryProvider';
import { ToastProvider } from '@/components/ui/Toast';
import { AIChatbot } from '@/components/ui/AIChatbot';
import { PublicLayoutWrapper } from '@/components/ui/PublicLayoutWrapper';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans'
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-heading'
});

export const metadata: Metadata = {
  title: 'SmartEdu Campus | Unified Smart Campus & Digital Learning Ecosystem',
  description: 'A comprehensive campus automation solution bridging administrative overheads and rural education gaps.',
  manifest: '/manifest.json'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-bg-primary text-text-primary">
        <ToastProvider>
          <QueryProvider>
            <AuthProvider>
              <PublicLayoutWrapper>
                {children}
              </PublicLayoutWrapper>
              <AIChatbot />
            </AuthProvider>
          </QueryProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
