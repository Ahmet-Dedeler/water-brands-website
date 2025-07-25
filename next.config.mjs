/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        unoptimized: true,
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'connect.live-oasis.com',
                port: '',
                pathname: '/storage/v1/object/public/website/items/**',
            },
        ],
    },
};

export default nextConfig; 