export default function manifest() {
  return {
    name: 'HeartDial — Because You Mean Everything',
    short_name: 'HeartDial',
    description: 'Spin a photo dial with your voice message. A romantic gift for someone you love.',
    start_url: '/',
    display: 'standalone',
    background_color: '#FFF0F6',
    theme_color: '#FF6B9D',
    orientation: 'portrait',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
