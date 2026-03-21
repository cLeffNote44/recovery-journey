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
  title: 'Recovery Journey | HIPAA-Compliant Recovery Management',
  description:
    'HIPAA & 42 CFR Part 2 compliant substance abuse recovery management platform. Streamline facility operations, secure messaging, and patient engagement for rehab centers and addiction counselors.',
  keywords: [
    'HIPAA compliant',
    'substance abuse recovery',
    'rehab management software',
    'addiction treatment platform',
    '42 CFR Part 2',
    'recovery management',
    'patient engagement',
    'clinical workflow',
  ],
  metadataBase: new URL('https://recoverjourney.com'),
  openGraph: {
    title: 'Recovery Journey | HIPAA-Compliant Recovery Management',
    description:
      'Streamline recovery management with our HIPAA & 42 CFR Part 2 compliant platform. Built for rehab facilities, outpatient clinics, and addiction counselors.',
    url: 'https://recoverjourney.com',
    siteName: 'Recovery Journey',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Recovery Journey | HIPAA-Compliant Recovery Management',
    description:
      'Streamline recovery management with our HIPAA & 42 CFR Part 2 compliant platform.',
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
