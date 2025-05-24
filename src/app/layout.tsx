import './globals.css';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/providers';
import { Toaster } from 'react-hot-toast';
import type { Metadata } from 'next';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: 'GBP Management Platform',
    template: '%s | GBP Management Platform',
  },
  description:
    'Comprehensive Google Business Profile management platform for agencies and business owners. Manage multiple GBP listings, posts, reviews, and analytics from one dashboard.',
  keywords: [
    'Google Business Profile',
    'GBP Management',
    'Local SEO',
    'Business Listings',
    'Review Management',
    'Google My Business',
  ],
  authors: [{ name: 'GBP Management Platform' }],
  creator: 'GBP Management Platform',
  publisher: 'GBP Management Platform',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.APP_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.APP_URL || 'http://localhost:3000',
    siteName: 'GBP Management Platform',
    title: 'GBP Management Platform',
    description:
      'Comprehensive Google Business Profile management platform for agencies and business owners.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'GBP Management Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GBP Management Platform',
    description:
      'Comprehensive Google Business Profile management platform for agencies and business owners.',
    images: ['/og-image.png'],
    creator: '@gbpmanagement',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
}

/**
 * Root layout component for the GBP Management Platform
 * Provides global styles, fonts, and essential providers
 */
export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'hsl(var(--card))',
                color: 'hsl(var(--card-foreground))',
                border: '1px solid hsl(var(--border))',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
