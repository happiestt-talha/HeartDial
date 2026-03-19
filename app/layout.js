import './globals.css';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://heartdial.live';

export const metadata = {
  metadataBase: new URL(BASE_URL),

  title: {
    default: 'HeartDial — Because You Mean Everything',
    template: '%s | HeartDial',
  },
  description:
    'Spin a photo dial with your voice message — a romantic, interactive gift for someone you love, no matter the distance.',
  keywords: [
    'HeartDial',
    'love',
    'long distance relationship',
    'romantic gift',
    'voice message',
    'photo dial',
    'interactive gift',
    'heartfelt message',
  ],
  authors: [{ name: 'M Talha Manzoor', url: 'https://mtalha.me' }],
  creator: 'M Talha Manzoor',
  publisher: 'M Talha Manzoor',

  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon.png', sizes: '96x96', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },

  manifest: '/manifest.webmanifest',

  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: BASE_URL,
    siteName: 'HeartDial',
    title: 'HeartDial — Because You Mean Everything',
    description:
      'Spin a photo dial with your voice message — a romantic, interactive gift for someone you love.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'HeartDial — Spin the dial. Hear their voice. Feel the love.',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'HeartDial — Because You Mean Everything',
    description:
      'Spin a photo dial with your voice message — a romantic, interactive gift for someone you love.',
    images: ['/og-image.png'],
    creator: '@mtalhamanzoor',
  },

  robots: {
    index: true,
    follow: true,
  },

  other: {
    'theme-color': '#FF6B9D',
    'color-scheme': 'light',
  },
};

export const viewport = {
  themeColor: '#FF6B9D',
  colorScheme: 'light',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
