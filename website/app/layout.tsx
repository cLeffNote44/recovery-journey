import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'RecoverJourney | AI-Powered Recovery Management Platform',
  description:
    'The only recovery management platform with AI-powered relapse risk prediction, real-time patient engagement, and built-in HIPAA & 42 CFR Part 2 compliance. Desktop portal for clinicians. Mobile app for patients.',
  keywords: [
    'HIPAA compliant',
    'substance abuse recovery',
    'rehab management software',
    'addiction treatment platform',
    '42 CFR Part 2',
    'recovery management',
    'patient engagement',
    'clinical workflow',
    'relapse prediction',
    'AI recovery platform',
  ],
  metadataBase: new URL('https://recoverjourney.com'),
  openGraph: {
    title: 'RecoverJourney | AI-Powered Recovery Management Platform',
    description:
      'The only recovery platform with AI relapse risk prediction, real-time patient engagement, and built-in HIPAA & 42 CFR Part 2 compliance. Desktop portal for clinicians. Mobile app for patients.',
    url: 'https://recoverjourney.com',
    siteName: 'RecoverJourney',
    type: 'website',
    locale: 'en_US',
    images: [{ url: '/og-image.svg' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RecoverJourney | AI-Powered Recovery Management Platform',
    description:
      'The only recovery platform with AI relapse risk prediction, real-time patient engagement, and built-in HIPAA compliance.',
  },
  icons: {
    icon: '/favicon.svg',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-navy-900 text-white font-sans antialiased">
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
