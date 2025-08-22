import { NextResponse } from 'next/server' 
import { db } from '@/lib/firebase' 
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

// In-memory rate limiting store (use Redis in production)
const rateLimitStore = new Map()
const RATE_LIMIT_WINDOW = 15 * 60 * 1000 // 15 minutes in milliseconds
const MAX_REQUESTS = 5 // Max requests per window

// Get client IP
function getClientIP(request) {
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : request.ip
  return ip || 'unknown'
}

// Rate limiting function
function checkRateLimit(ip) {
  const now = Date.now()
  const windowStart = now - RATE_LIMIT_WINDOW
  
  if (!rateLimitStore.has(ip)) {
    rateLimitStore.set(ip, [])
  }
  
  const requests = rateLimitStore.get(ip)
  
  // Remove old requests outside the window
  const validRequests = requests.filter(timestamp => timestamp > windowStart)
  
  if (validRequests.length >= MAX_REQUESTS) {
    return false // Rate limit exceeded
  }
  
  // Add current request
  validRequests.push(now)
  rateLimitStore.set(ip, validRequests)
  
  return true // Request allowed
}

// FIXED: Proper sanitization that preserves spaces
function sanitizeInput(input) {
  if (!input || typeof input !== 'string') return ''
  
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+\s*=/gi, '') // Remove event handlers like onclick=
    .replace(/vbscript:/gi, '') // Remove VBScript
    .replace(/data:\s*text\/html/gi, '') // Remove data URLs with HTML
    .trim() // Remove leading/trailing whitespace
    .replace(/\s+/g, ' ') // Normalize multiple spaces to single spaces (preserves spaces!)
    .substring(0, 1000) // Limit length
}

// Email validation
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 100
}

// Phone validation
function validatePhone(phone) {
  if (!phone) return true // Optional field
  const phoneRegex = /^[\+]?[1-9]?[\d\s\-\(\)]{10,15}$/
  return phoneRegex.test(phone)
}

export async function POST(request) {
  try {
    // Get client IP for rate limiting
    const clientIP = getClientIP(request)
    
    // Check rate limit
    if (!checkRateLimit(clientIP)) {
      return NextResponse.json({
        success: false,
        message: 'Too many requests. Please try again later.'
      }, { status: 429 })
    }

    // Extract and validate request body
    const body = await request.json()
    console.log('Received form data:', body) // Debug log
    
    const { name, email, phone, homeTypes, lookingFor, message } = body

    // Server-side validation
    if (!name || name.length < 2 || name.length > 100) {
      return NextResponse.json({
        success: false,
        message: 'Name must be between 2 and 100 characters'
      }, { status: 400 })
    }

    if (!email || !validateEmail(email)) {
      return NextResponse.json({
        success: false,
        message: 'Valid email is required'
      }, { status: 400 })
    }

    if (phone && !validatePhone(phone)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid phone number format'
      }, { status: 400 })
    }

    if (!lookingFor || !['purchase', 'sell', 'rent', 'fsbo'].includes(lookingFor)) {
      return NextResponse.json({
        success: false,
        message: 'Please select what you are looking for'
      }, { status: 400 })
    }

    if (!Array.isArray(homeTypes)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid home types format'
      }, { status: 400 })
    }

    // FIXED: Sanitize and prepare data with proper space handling
    const sanitizedData = {
      name: sanitizeInput(name),
      email: sanitizeInput(email.toLowerCase()),
      phone: sanitizeInput(phone || ''),
      homeTypes: homeTypes.filter(type => 
        ['Condo', 'Home', 'Land'].includes(type)
      ).slice(0, 3), // Limit to 3 types
      lookingFor: lookingFor,
      message: sanitizeInput(message || ''), // This now preserves spaces properly
      timestamp: serverTimestamp(),
      status: 'new',
      metadata: {
        ip: clientIP,
        userAgent: request.headers.get('user-agent')?.substring(0, 200) || '',
        referer: request.headers.get('referer') || '',
        submittedAt: new Date().toISOString()
      }
    }

    console.log('Sanitized data:', sanitizedData) // Debug log to check message field

    // Save to Firestore
    const docRef = await addDoc(collection(db, 'contactForms'), sanitizedData)

    // Optional: Send email notification here
    // await sendEmailNotification(sanitizedData)

    console.log(`Form submitted successfully. Document ID: ${docRef.id}, IP: ${clientIP}`)

    return NextResponse.json({
      success: true,
      message: 'Form submitted successfully',
      id: docRef.id
    })

  } catch (error) {
    console.error('Error processing form submission:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Internal server error. Please try again.'
    }, { status: 500 })
  }
}

// Optional: Clean up old rate limit entries periodically
setInterval(() => {
  const now = Date.now()
  const cutoff = now - RATE_LIMIT_WINDOW
  
  for (const [ip, requests] of rateLimitStore.entries()) {
    const validRequests = requests.filter(timestamp => timestamp > cutoff)
    if (validRequests.length === 0) {
      rateLimitStore.delete(ip)
    } else {
      rateLimitStore.set(ip, validRequests)
    }
  }
}, 5 * 60 * 1000) // Clean up every 5 minutes