import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// In-memory rate limiting store (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Cleanup function to prevent memory leaks
function cleanupRateLimitStore() {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

// Rate limiting function
function checkRateLimit(ip: string, limit: number = 100, windowMs: number = 3600000): boolean {
  const now = Date.now();
  const key = `${ip}`;
  
  // Clean up old entries periodically
  if (Math.random() < 0.01) { // 1% chance to cleanup on each request
    cleanupRateLimitStore();
  }
  
  const current = rateLimitStore.get(key);
  
  if (!current || now > current.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (current.count >= limit) {
    return false;
  }
  
  current.count++;
  return true;
}

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Generate a secure nonce for each request
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64').substring(0, 16);
  
  // Enhanced CSP with nonce and temporary unsafe-inline (remove once refactored)
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'nonce-${nonce}' https://www.googletagmanager.com https://www.google-analytics.com https://maps.googleapis.com https://cdnjs.cloudflare.com;
    style-src 'self' 'unsafe-inline' 'nonce-${nonce}' https://fonts.googleapis.com;
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
  `.replace(/\s{2,}/g, ' ').trim();

  // Apply comprehensive security headers
  response.headers.set('Content-Security-Policy', cspHeader);
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Remove deprecated X-XSS-Protection header
  // response.headers.set('X-XSS-Protection', '1; mode=block'); // Removed
  
  // Enhanced security headers
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  response.headers.set('Permissions-Policy', 'geolocation=(self), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()');
  response.headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  response.headers.set('Cross-Origin-Resource-Policy', 'same-origin');
  
  // Remove server information
  response.headers.set('Server', '');
  
  // Enhanced cache control
  const pathname = request.nextUrl.pathname;
  
  if (pathname.includes('/admin') || 
      pathname.includes('/dashboard') ||
      pathname.includes('/profile') ||
      pathname.includes('/api/')) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
  } else if (pathname.startsWith('/_next/static') || 
             pathname === '/favicon.ico' ||
             pathname === '/robots.txt' ||
             pathname === '/sitemap.xml') {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  } else {
    response.headers.set('Cache-Control', 'no-cache, must-revalidate, max-age=0');
  }

  // Enhanced rate limiting for API routes
  if (pathname.startsWith('/api/')) {
    // Get real IP address
    const ip = 
      request.headers.get('cf-connecting-ip') || // Cloudflare
      request.headers.get('x-real-ip') ||
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-client-ip') ||
      '127.0.0.1';
      
    const userAgent = request.headers.get('user-agent') || '';
    
    // Enhanced bot detection
    const allowedBots = [
      'googlebot', 'bingbot', 'slurp', 'duckduckbot',
      'baiduspider', 'yandexbot', 'facebookexternalhit',
      'twitterbot', 'linkedinbot', 'whatsapp', 'telegrambot'
    ];
    
    const suspiciousBots = [
      'scrapy', 'wget', 'curl', 'python', 'requests',
      'bot', 'crawler', 'spider', 'scraper'
    ];
    
    const userAgentLower = userAgent.toLowerCase();
    const isLegitimateBot = allowedBots.some(bot => userAgentLower.includes(bot));
    const isSuspiciousBot = suspiciousBots.some(bot => userAgentLower.includes(bot));
    
    // Block suspicious bots but allow legitimate ones
    if (!isLegitimateBot && isSuspiciousBot) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // Apply rate limiting
    const isAllowed = checkRateLimit(ip);
    
    if (!isAllowed) {
      return new NextResponse('Too Many Requests', { 
        status: 429,
        headers: {
          'Retry-After': '3600',
          'X-RateLimit-Limit': '100',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Date.now() + 3600000)
        }
      });
    }

    // Add rate limiting headers
    const current = rateLimitStore.get(ip);
    response.headers.set('X-RateLimit-Limit', '100');
    response.headers.set('X-RateLimit-Remaining', String(100 - (current?.count || 0)));
    response.headers.set('X-RateLimit-Reset', String(current?.resetTime || Date.now() + 3600000));
  }

  // Validate request method
  const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'];
  if (!allowedMethods.includes(request.method)) {
    return new NextResponse('Method Not Allowed', { status: 405 });
  }

  // Enhanced suspicious pattern detection
  const suspiciousPatterns = [
    /\.\.\//g,                    // Path traversal
    /<script[\s\S]*?>/gi,        // Script tags
    /javascript:/gi,              // JavaScript protocol
    /vbscript:/gi,               // VBScript protocol
    /data:.*base64/gi,           // Base64 data URLs
    /%3c/gi,                     // URL encoded <
    /%3e/gi,                     // URL encoded >
    /%22/gi,                     // URL encoded "
    /%27/gi,                     // URL encoded '
    /union[\s]+select/gi,        // SQL injection
    /\bselect\b.*\bfrom\b/gi,    // SQL injection
    /\bdrop\b.*\btable\b/gi,     // SQL injection
    /\binsert\b.*\binto\b/gi,    // SQL injection
    /\bdelete\b.*\bfrom\b/gi,    // SQL injection
   // /on\w+\s*=/gi,               // Event handlers
  ];

  const url = request.nextUrl.pathname + request.nextUrl.search;
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(url)) {
      console.warn(`Blocked suspicious request: ${url} from IP: ${request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || 'unknown'}`);
      return new NextResponse('Bad Request', { status: 400 });
    }
  }

  // Validate Content-Type for POST/PUT requests
  if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
    const contentType = request.headers.get('content-type');
    const allowedContentTypes = [
      'application/json',
      'application/x-www-form-urlencoded',
      'multipart/form-data',
      'text/plain'
    ];
    
    if (contentType && !allowedContentTypes.some(type => contentType.includes(type))) {
      return new NextResponse('Unsupported Media Type', { status: 415 });
    }
  }

  // Set nonce in request headers for use in components
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files
     */
    {
      source: '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};