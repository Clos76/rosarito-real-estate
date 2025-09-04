// app/api/property-contact/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Reuse the same rate limiting logic from your existing contact form
const rateLimitStore = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 5;

function getClientIP(request: NextRequest) {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
  return ip;
}

function checkRateLimit(ip: string) {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW;
  
  if (!rateLimitStore.has(ip)) {
    rateLimitStore.set(ip, []);
  }
  
  const requests = rateLimitStore.get(ip);
  const validRequests = requests.filter((timestamp: number) => timestamp > windowStart);
  
  if (validRequests.length >= MAX_REQUESTS) {
    return false;
  }
  
  validRequests.push(now);
  rateLimitStore.set(ip, validRequests);
  return true;
}

function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/data:\s*text\/html/gi, '')
    .trim()
    .replace(/\s+/g, ' ')
    .substring(0, 1000);
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 100;
}

function validatePhone(phone: string): boolean {
  if (!phone) return true;
  const phoneRegex = /^[\+]?[1-9]?[\d\s\-\(\)]{10,15}$/;
  return phoneRegex.test(phone);
}

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    
    if (!checkRateLimit(clientIP)) {
      return NextResponse.json({
        success: false,
        message: 'Too many requests. Please try again later.'
      }, { status: 429 });
    }

    const body = await request.json();
    console.log('Property contact form data:', body);
    
    const {
      name,
      email,
      phone,
      message,
      preferredContactMethod = 'email',
      propertyId,
      propertyTitle,
      propertyAddress,
      propertyPrice,
      agentName,
      agentEmail,
      agentContact,
      requestType = 'contact',
      // Tour-specific fields
      preferredDate,
      preferredTime,
      tourType,
    } = body;

    // Validation
    if (!name || name.length < 2 || name.length > 100) {
      return NextResponse.json({
        success: false,
        message: 'Name must be between 2 and 100 characters'
      }, { status: 400 });
    }

    if (!email || !validateEmail(email)) {
      return NextResponse.json({
        success: false,
        message: 'Valid email is required'
      }, { status: 400 });
    }

    if (phone && !validatePhone(phone)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid phone number format'
      }, { status: 400 });
    }

    if (!propertyId || !propertyTitle) {
      return NextResponse.json({
        success: false,
        message: 'Property information is missing'
      }, { status: 400 });
    }

    if (requestType === 'tour' && !preferredDate) {
      return NextResponse.json({
        success: false,
        message: 'Please select a preferred date for the tour'
      }, { status: 400 });
    }

    // Sanitize and prepare data
    const sanitizedData = {
      // Contact info
      name: sanitizeInput(name),
      email: sanitizeInput(email.toLowerCase()),
      phone: sanitizeInput(phone || ''),
      message: sanitizeInput(message || ''),
      preferredContactMethod,
      
      // Property info
      propertyId,
      propertyTitle: sanitizeInput(propertyTitle),
      propertyAddress: sanitizeInput(propertyAddress),
      propertyPrice: Number(propertyPrice),
      
      // Agent info
      agentName: sanitizeInput(agentName),
      agentEmail: sanitizeInput(agentEmail.toLowerCase()),
      agentContact: sanitizeInput(agentContact),
      
      // Request type
      requestType,
      
      // Tour specific fields (only if tour request)
      ...(requestType === 'tour' && {
        preferredDate,
        preferredTime: preferredTime || '',
        tourType: tourType || 'in-person'
      }),
      
      // Metadata
      status: 'new',
      timestamp: serverTimestamp(),
      source: 'property-detail-page',
      metadata: {
        ip: clientIP,
        userAgent: request.headers.get('user-agent')?.substring(0, 200) || '',
        referer: request.headers.get('referer') || '',
        submittedAt: new Date().toISOString()
      }
    };

    // Save to appropriate collection based on request type  
    const collectionName = requestType === 'tour' ? 'tourRequests' : 'contactRequests';
    const docRef = await addDoc(collection(db, collectionName), sanitizedData);

    // Also save to leads collection
    await addDoc(collection(db, 'leads'), {
      ...sanitizedData,
      leadType: requestType,
      originalDocId: docRef.id,
      originalCollection: collectionName
    });

    console.log(`Property contact form submitted. Document ID: ${docRef.id}, Type: ${requestType}, IP: ${clientIP}`);

    return NextResponse.json({
      success: true,
      message: requestType === 'tour' 
        ? 'Tour request submitted successfully! The agent will contact you soon.'
        : 'Message sent successfully! The agent will get back to you soon.',
      id: docRef.id
    });

  } catch (error) {
    console.error('Error processing property contact form:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Internal server error. Please try again.'
    }, { status: 500 });
  }
}

// Clean up old rate limit entries
setInterval(() => {
  const now = Date.now();
  const cutoff = now - RATE_LIMIT_WINDOW;
  
  for (const [ip, requests] of rateLimitStore.entries()) {
    const validRequests = requests.filter((timestamp: number) => timestamp > cutoff);
    if (validRequests.length === 0) {
      rateLimitStore.delete(ip);
    } else {
      rateLimitStore.set(ip, validRequests);
    }
  }
}, 5 * 60 * 1000);