"use client"

import { useState, useEffect } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useCallback } from 'react'

interface PropertyContactFormProps {
  propertyId: string
  propertyTitle: string
  propertyAddress: string
  propertyPrice: number
  agentName: string
  agentEmail: string
  agentContact: string
  onClose: () => void
  formType: 'contact' | 'tour'
}

export default function PropertyContactForm({
  propertyId,
  propertyTitle,
  propertyAddress,
  propertyPrice,
  agentName,
  agentEmail,
  agentContact,
  onClose,
  formType
}: PropertyContactFormProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: formType === 'tour'
      ? `I would like to schedule a tour for ${propertyTitle} at ${propertyAddress}.`
      : `I am interested in ${propertyTitle} at ${propertyAddress} and would like more information.`,
    preferredContactMethod: 'email' as 'email' | 'phone',
    preferredDate: '',
    preferredTime: '',
    tourType: 'in-person' as 'in-person' | 'virtual'
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  // Animation and scroll lock effects
  useEffect(() => {
    // Disable body scroll
    document.body.style.overflow = 'hidden'

    // Trigger animation
    const timer = setTimeout(() => setIsVisible(true), 10)

    return () => {
      document.body.style.overflow = 'unset'
      clearTimeout(timer)
    }
  }, [])

  // Inside PropertyContactForm
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose()
      }
    }

    window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [])


 const handleClose = useCallback(() => {
  setIsVisible(false)
  setTimeout(() => {
    onClose()
  }, 300) // Wait for animation to complete
}, [onClose]) // only depends on onClose

  // Sanitization and validation functions
  const sanitizeInput = (input: string): string => {
    return input
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .trim()
      .replace(/\s+/g, ' ')
      .substring(0, 1000)
  }

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[\+]?[1-9]?[\d\s\-\(\)]{10,15}$/
    return phone === '' || phoneRegex.test(phone)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    const sanitizedValue = name === 'message' ? value : sanitizeInput(value)

    setFormData(prev => ({
      ...prev,
      [name]: sanitizedValue
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    // Validation
    if (!formData.name || formData.name.length < 2) {
      setError('Please enter a valid name (at least 2 characters)')
      setIsSubmitting(false)
      return
    }

    if (!formData.email || !validateEmail(formData.email)) {
      setError('Please enter a valid email address')
      setIsSubmitting(false)
      return
    }

    if (formData.phone && !validatePhone(formData.phone)) {
      setError('Please enter a valid phone number')
      setIsSubmitting(false)
      return
    }

    if (formType === 'tour' && !formData.preferredDate) {
      setError('Please select a preferred date for the tour')
      setIsSubmitting(false)
      return
    }

    try {
      const submitData = {
        name: sanitizeInput(formData.name),
        email: formData.email.toLowerCase().trim(),
        phone: formData.phone,
        message: sanitizeInput(formData.message),
        preferredContactMethod: formData.preferredContactMethod,
        propertyId,
        propertyTitle,
        propertyAddress,
        propertyPrice,
        agentName,
        agentEmail,
        agentContact,
        requestType: formType,
        ...(formType === 'tour' && {
          preferredDate: formData.preferredDate,
          preferredTime: formData.preferredTime,
          tourType: formData.tourType
        }),
        status: 'new',
        createdAt: serverTimestamp(),
        source: 'property-detail-page'
      }

      const collectionName = formType === 'tour' ? 'tourRequests' : 'contactRequests'
      await addDoc(collection(db, collectionName), submitData)
      await addDoc(collection(db, 'leads'), {
        ...submitData,
        leadType: formType
      })

      setSubmitted(true)
      setTimeout(() => {
        handleClose()
      }, 3000)

    } catch (error) {
      console.error('Submission error:', error)
      setError('Failed to submit request. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  if (submitted) {
    return (
      <div
        id="property-contact-modal"
        className={`fixed inset-0 bg-black transition-all duration-300 flex items-center justify-center z-[9999] p-4 ${isVisible ? 'bg-opacity-50' : 'bg-opacity-0'
          }`}
        onClick={handleBackdropClick}
      >
        <div className={`bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl transform transition-all duration-300 ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}>
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {formType === 'tour' ? 'Tour Requested!' : 'Message Sent!'}
          </h2>
          <p className="text-gray-600">
            {formType === 'tour'
              ? `${agentName} will contact you shortly to confirm your tour.`
              : `${agentName} will get back to you soon.`
            }
          </p>
          <p className="text-sm text-gray-500 mt-2">This window will close automatically...</p>
        </div>
      </div>
    )
  }

  return (
    <div
      id="property-contact-modal"
      className={`fixed inset-0 bg-black transition-all duration-300 flex items-center justify-center z-[9999] p-4 ${isVisible ? 'bg-opacity-50' : 'bg-opacity-0'
        }`}
      onClick={handleBackdropClick}
    >
      <div className={`bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl transform transition-all duration-300 ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                {formType === 'tour' ? 'Schedule a Tour' : 'Contact Agent'}
              </h2>
              <p className="text-blue-100">
                {formType === 'tour'
                  ? 'Schedule a tour for this property'
                  : 'Get more information about this property'
                }
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-white hover:text-gray-200 text-2xl font-bold transition-colors hover:scale-110"
            >
              ×
            </button>
          </div>

          {/* Property Info */}
          <div className="mt-4 pt-4 border-t border-white/20">
            <h3 className="font-semibold text-lg">{propertyTitle}</h3>
            <p className="text-blue-100">{propertyAddress}</p>
            <p className="text-xl font-bold">${propertyPrice.toLocaleString()}</p>
            <p className="text-xs text-blue-200 mt-1">Property ID: {propertyId}</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Contact Information */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Your full name"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="your@email.com"
              />
            </div>
          </div>

          {/* Phone and Preferred Contact Method */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="phone" className="block text-gray-700 font-medium mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="(555) 123-4567"
              />
            </div>
            <div>
              <label htmlFor="preferredContactMethod" className="block text-gray-700 font-medium mb-2">
                Preferred Contact Method
              </label>
              <select
                id="preferredContactMethod"
                name="preferredContactMethod"
                value={formData.preferredContactMethod}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="email">Email</option>
                <option value="phone">Phone</option>
              </select>
            </div>
          </div>

          {/* Tour-specific fields */}
          {formType === 'tour' && (
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="preferredDate" className="block text-gray-700 font-medium mb-2">
                  Preferred Date *
                </label>
                <input
                  type="date"
                  id="preferredDate"
                  name="preferredDate"
                  value={formData.preferredDate}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label htmlFor="preferredTime" className="block text-gray-700 font-medium mb-2">
                  Preferred Time
                </label>
                <input
                  type="time"
                  id="preferredTime"
                  name="preferredTime"
                  value={formData.preferredTime}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label htmlFor="tourType" className="block text-gray-700 font-medium mb-2">
                  Tour Type
                </label>
                <select
                  id="tourType"
                  name="tourType"
                  value={formData.tourType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="in-person">In-Person Tour</option>
                  <option value="virtual">Virtual Tour</option>
                </select>
              </div>
            </div>
          )}

          {/* Message */}
          <div>
            <label htmlFor="message" className="block text-gray-700 font-medium mb-2">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
              placeholder={formType === 'tour'
                ? "Any specific requirements or questions about the tour?"
                : "Tell us what you'd like to know about this property..."
              }
            />
          </div>

          {/* Agent Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-800 mb-2">Your request will be sent to:</h4>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold">
                  {agentName.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-800">{agentName}</p>
                <p className="text-sm text-gray-600">{agentEmail}</p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 animate-pulse">
              <p className="text-red-600 text-center">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-3 px-6 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transform hover:scale-105'
                }`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Sending...</span>
                </div>
              ) : (
                formType === 'tour' ? 'Request Tour' : 'Send Message'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}