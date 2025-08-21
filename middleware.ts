// middleware.ts - Add this to your root directory
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Generate a unique nonce for each request
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  
  // Add nonce to CSP header (this overrides the next.config.ts CSP)
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://www.googletagmanager.com https://www.google-analytics.com https://maps.googleapis.com https://cdnjs.cloudflare.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' data: blob: https://firebasestorage.googleapis.com https://rosaritoresorts.com https://maps.googleapis.com https://maps.gstatic.com;
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self' https://firebasestorage.googleapis.com https://*.firebaseio.com https://*.googleapis.com https://www.google-analytics.com;
    frame-src 'self' https://maps.googleapis.com;
    frame-ancestors 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    upgrade-insecure-requests;
  `.replace(/\s{2,}/g, ' ').trim();

  // Security headers (middleware takes precedence over next.config.ts)
  response.headers.set('Content-Security-Policy', cspHeader);
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // Rate limiting for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Get IP address from various possible headers
    const ip = 
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      request.headers.get('cf-connecting-ip') || // Cloudflare
      request.headers.get('x-client-ip') ||
      'anonymous';
      
    const userAgent = request.headers.get('user-agent') || '';
    
    // Allow legitimate search engine bots
    const allowedBots = [
      'googlebot',
      'bingbot', 
      'slurp', // Yahoo
      'duckduckbot',
      'baiduspider',
      'yandexbot',
      'facebookexternalhit',
      'twitterbot',
      'linkedinbot',
      'whatsapp',
      'telegrambot'
    ];
    
    const userAgentLower = userAgent.toLowerCase();
    const isLegitimateBot = allowedBots.some(bot => userAgentLower.includes(bot));
    
    // Block malicious bots but allow legitimate ones
    if (!isLegitimateBot && (
        userAgentLower.includes('bot') || 
        userAgentLower.includes('crawler') ||
        userAgentLower.includes('spider') ||
        userAgentLower.includes('scraper')
    )) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // Add rate limiting headers
    response.headers.set('X-RateLimit-Limit', '100');
    response.headers.set('X-RateLimit-Remaining', '99');
    response.headers.set('X-Client-IP', ip);
  }

  // Validate request method
  const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'];
  if (!allowedMethods.includes(request.method)) {
    return new NextResponse('Method Not Allowed', { status: 405 });
  }

  // Check for suspicious patterns in URL
  const suspiciousPatterns = [
    /\.\.\//g,  // Path traversal
    /<script/gi, // Script injection
    /javascript:/gi, // JavaScript protocol
    /data:.*base64/gi, // Base64 data URLs
    /%3c/gi, // URL encoded <
    /%3e/gi, // URL encoded >
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(request.nextUrl.pathname) || 
        pattern.test(request.nextUrl.search)) {
      return new NextResponse('Bad Request', { status: 400 });
    }
  }

  // Set nonce in request headers for use in pages
  request.headers.set('x-nonce', nonce);

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    {
      source: '/((?!_next/static|_next/image|favicon.ico|public/).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};