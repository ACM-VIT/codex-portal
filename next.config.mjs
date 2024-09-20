/** @type {import('next').NextConfig} */
const nextConfig = {
    async headers() {
      return [
        {
          source: "/api/sse-leaderboard",
          destination: '/', // redirect to home if accessed during build
          permanent: false,
          headers: [
            {
              key: "Cache-Control",
              value: "no-store", 
            },
          ],
        },
        {
          source: "/api/leaderboard",
          headers: [
            {
              key: "Cache-Control",
              value: "no-store",
            },
          ],
        },
        {
          source: "/api/:path*",
          headers: [
            {
              key: "Cache-Control",
              value: "no-store", 
            },
          ],
        },
      ];
    },
    
    // Other Next.js configurations can go here
    reactStrictMode: true,
  
    // Enable server-side events (SSE) if necessary
    experimental: {
      serverComponentsExternalPackages: ["pg"], // Ensuring external packages like pg are allowed
    },
  };
  
  export default nextConfig;
  