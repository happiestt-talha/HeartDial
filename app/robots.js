const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://heartdial.vercel.app';

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/aulia/'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
