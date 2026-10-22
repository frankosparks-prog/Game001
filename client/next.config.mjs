/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // React Strict Mode often double-invokes R3F canvas effects in dev
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei', '@react-three/rapier'],
  webpack: (config) => {
    // Enable gltf and audio file imports if needed
    config.module.rules.push({
      test: /\.(glb|gltf)$/,
      type: 'asset/resource',
    });
    return config;
  },
};

export default nextConfig;
