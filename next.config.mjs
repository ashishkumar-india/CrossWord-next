/** @type {import('next').NextConfig} */
const nextConfig = {
    // Use React strict mode
    reactStrictMode: true,
    // Turn off image optimization since we are not using next/image (retaining existing vanilla HTML if any)
    images: { unoptimized: true },
};

export default nextConfig;
