import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image optimization settings
  images: {
    domains: ["firebasestorage.googleapis.com"],
    // Add additional security for images
    dangerouslyAllowSVG: false,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // MAIN CSP (not report-only) - Fixed missing directives
          {
            key: "Content-Security-Policy", 
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://maps.googleapis.com https://cdnjs.cloudflare.com;
              style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
              img-src 'self' data: blob: https://firebasestorage.googleapis.com https://rosaritoresorts.com https://maps.googleapis.com https://maps.gstatic.com;
              font-src 'self' https://fonts.gstatic.com;
              connect-src 'self' https://firebasestorage.googleapis.com https://*.firebaseio.com https://*.googleapis.com https://www.google-analytics.com https://analytics.google.com;
              frame-src 'self' https://maps.googleapis.com;
              frame-ancestors 'self';
              object-src 'none';
              base-uri 'self';
              form-action 'self';
              manifest-src 'self';
              worker-src 'self' blob:;
              child-src 'self' blob:;
              media-src 'self' blob: data:;
              prefetch-src 'self';
              navigate-to 'self' https:;
              report-uri /api/csp-report;
              upgrade-insecure-requests;
              block-all-mixed-content;
            `.replace(/\s{2,}/g, ' ').trim()
          },
          // Prevent MIME type sniffing
          {
            key: "X-Content-Type-Options",
            value: "nosniff"
          },
          // Prevent clickjacking
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN"
          },
          // Control referrer information
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin"
          },
          // Control browser features
          {
            key: "Permissions-Policy",
            value: "accelerometer=(), ambient-light-sensor=(), autoplay=(), battery=(), camera=(), cross-origin-isolated=(), display-capture=(), document-domain=(), encrypted-media=(), execution-while-not-rendered=(), execution-while-out-of-viewport=(), fullscreen=(), geolocation=(self), gyroscope=(), keyboard-map=(), magnetometer=(), microphone=(), midi=(), navigation-override=(), payment=(), picture-in-picture=(), publickey-credentials-get=(), screen-wake-lock=(), sync-xhr=(), usb=(), web-share=(), xr-spatial-tracking=()"
          },
          // Force HTTPS
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload"
          },
          // Remove XSS Protection (deprecated, causes issues)
          // Cache control - more specific
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate, max-age=0, private"
          },
          // Cross-origin policies
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "require-corp"
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin"
          },
          {
            key: "Cross-Origin-Resource-Policy",
            value: "same-origin"
          },
          // Remove server info
          {
            key: "Server",
            value: ""
          }
        ]
      },
      // Specific headers for API routes
      {
        source: "/api/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "default-src 'none'; frame-ancestors 'none';"
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff"
          },
          {
            key: "X-Frame-Options",
            value: "DENY"
          },
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate, private, max-age=0"
          },
          {
            key: "Access-Control-Allow-Origin",
            value: process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_SITE_URL || 'https://rosaritoresorts.com' : 'http://localhost:3000'
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS"
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization, X-Requested-With"
          },
          {
            key: "Access-Control-Allow-Credentials",
            value: "true"
          },
          {
            key: "Access-Control-Max-Age",
            value: "86400"
          }
        ]
      },
      // Headers for static assets
      {
        source: "/(_next/static|favicon.ico|robots.txt|sitemap.xml)/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable"
          },
          {
            key: "Cross-Origin-Resource-Policy",
            value: "cross-origin"
          }
        ]
      },
    ];
  },

  // Environment variables validation
  env: {
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  },

  // Enable React strict mode
  reactStrictMode: true,
  
  // Remove powered by header for security
  poweredByHeader: false,
  
  // Server external packages
  serverExternalPackages: ['@prisma/client'],
  
  // Experimental features
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;