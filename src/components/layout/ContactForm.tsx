"use client"

import { useState } from 'react'

// import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
// import { db } from '@/lib/firebase' 

export default function ContactForm() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        homeTypes: [] as string[],
        lookingFor: '',
        message: ''
    })

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [error, setError] = useState('')

    // Input sanitization function
    const sanitizeInput = (input: string): string => {
        return input
            .trim()
            .replace(/[<>]/g, '') // Remove potential HTML tags
            .replace(/javascript:/gi, '') // Remove javascript: protocols
            .replace(/on\w+=/gi, '') // Remove event handlers
            .substring(0, input.length > 1000 ? 1000 : input.length) // Limit length
    }

    // Email validation
    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(email)
    }

    // Phone validation (basic US format)
    const validatePhone = (phone: string): boolean => {
        const phoneRegex = /^[\+]?[1-9]?[\d\s\-\(\)]{10,15}$/
        return phone === '' || phoneRegex.test(phone)
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        const sanitizedValue = sanitizeInput(value)
        
        setFormData(prev => ({
            ...prev,
            [name]: sanitizedValue
        }))
    }

    const handleCheckboxChange = (homeType: string) => {
        // Validate that homeType is one of the allowed values
        const allowedTypes = ['Condo', 'Home', 'Land']
        if (!allowedTypes.includes(homeType)) return
        
        setFormData(prev => ({
            ...prev,
            homeTypes: prev.homeTypes.includes(homeType)
                ? prev.homeTypes.filter(type => type !== homeType)
                : prev.homeTypes.length < 3 // Limit to 3 selections
                    ? [...prev.homeTypes, homeType]
                    : prev.homeTypes
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError('')
        
        // Client-side validation
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
        
        if (!formData.lookingFor) {
            setError('Please select what you are looking for')
            setIsSubmitting(false)
            return
        }

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            })
            
            const result = await response.json()

            if (result.success) {
                // Handle success - show success state
                setSubmitted(true)
                
                // Reset form after 3 seconds
                setTimeout(() => {
                    setSubmitted(false)
                    setFormData({
                        name: '',
                        email: '',
                        phone: '',
                        homeTypes: [],
                        lookingFor: '',
                        message: ''
                    })
                }, 3000)
            } else {
                setError(result.message)
            }
        } catch (error) {
            console.error('Submission error:', error)
            setError('Network error. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (submitted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Thank you!</h2>
                    <p className="text-gray-600">We&apos;ll connect you with a local expert shortly.</p>
                </div>
            </div>
        )
    }

    return (
        <div  id='contact-form' className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4 flex items-center justify-center mt-6">
            <div className="w-full max-w-2xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        Talk to a Local Expert
                    </h1>
                    <p className="text-gray-300 text-lg">
                        You&apos;ll be connected with a local agent — there&apos;s no pressure or obligation.
                    </p>
                </div>

                {/* Form Container */}
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Name and Email Row */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label htmlFor="name" className="block text-white font-medium">
                                    Name *
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                                    placeholder="Your full name"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="email" className="block text-white font-medium">
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                                    placeholder="your@email.com"
                                />
                            </div>
                        </div>

                        {/* Phone */}
                        <div className="space-y-2">
                            <label htmlFor="phone" className="block text-white font-medium">
                                Phone
                            </label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                                placeholder="(555) 123-4567"
                            />
                        </div>

                        {/* Home Types */}
                        <div className="space-y-4">
                            <label className="block text-white font-medium text-lg">
                                What type of home are you looking for?
                            </label>
                            <div className="grid grid-cols-3 gap-4">
                                {['Condo', 'Home', 'Land'].map((type) => (
                                    <div
                                        key={type}
                                        onClick={() => handleCheckboxChange(type)}
                                        className={`cursor-pointer p-4 rounded-xl border-2 transition-all duration-300 text-center ${
                                            formData.homeTypes.includes(type)
                                                ? 'bg-blue-500 border-blue-400 text-white'
                                                : 'bg-white/10 border-white/30 text-white hover:bg-white/20'
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={formData.homeTypes.includes(type)}
                                            onChange={() => handleCheckboxChange(type)}
                                            className="hidden"
                                        />
                                        <span className="font-medium">{type}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Looking For */}
                        <div className="space-y-4">
                            <label className="block text-white font-medium text-lg">
                                Are you looking to...
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { value: 'purchase', label: 'Purchase' },
                                    { value: 'sell', label: 'Sell' },
                                    { value: 'rent', label: 'Rent' },
                                    { value: 'fsbo', label: 'For Sale by Owner' }
                                ].map((option) => (
                                    <div
                                        key={option.value}
                                        onClick={() => setFormData(prev => ({ ...prev, lookingFor: option.value }))}
                                        className={`cursor-pointer p-4 rounded-xl border-2 transition-all duration-300 text-center ${
                                            formData.lookingFor === option.value
                                                ? 'bg-purple-500 border-purple-400 text-white'
                                                : 'bg-white/10 border-white/30 text-white hover:bg-white/20'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="lookingFor"
                                            value={option.value}
                                            checked={formData.lookingFor === option.value}
                                            onChange={handleInputChange}
                                            className="hidden"
                                        />
                                        <span className="font-medium">{option.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Message */}
                        <div className="space-y-2">
                            <label htmlFor="message" className="block text-white font-medium">
                                What can we help you with?
                            </label>
                            <textarea
                                id="message"
                                name="message"
                                value={formData.message}
                                onChange={handleInputChange}
                                rows={4}
                                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 resize-none"
                                placeholder="Tell us about your real estate needs..."
                            />
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 mb-4">
                                <p className="text-red-200 text-center">{error}</p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 ${
                                isSubmitting
                                    ? 'bg-gray-500 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transform hover:scale-105'
                            } text-white shadow-lg`}
                        >
                            {isSubmitting ? (
                                <div className="flex items-center justify-center space-x-2">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Submitting...</span>
                                </div>
                            ) : (
                                'Connect with an Expert'
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <div className="text-center mt-6">
                    <p className="text-gray-400 text-sm">
                        Your information is secure and will only be used to connect you with a local expert.
                    </p>
                </div>
            </div>
        </div>
    )
}