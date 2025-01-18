/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
      return [
        {
          source: '/video_feed',
          destination: 'http://192.168.36.113:5000', // Update with your Flask server IP
        },
        {
          source: '/stream',
          destination: 'http://localhost:5000/stream', // Update with your Flask server IP
        },
      ]
    },
    images: {
      domains: ['localhost'], // Add your Flask server domain here
    }
  }
  
  module.exports = nextConfig