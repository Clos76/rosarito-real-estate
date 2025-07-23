"use client"
import React, { useState } from 'react'
import { Phone, Mail, MapPin, Facebook, Instagram, Youtube, Linkedin, CheckCircle, AlertCircle } from 'lucide-react'
import { db } from '@/lib/firebase'
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore'

const Footer: React.FC = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error' | null; text: string }>({
        type: null,
        text: ''
    });

    const handleNewsletterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email.trim()) {
            setMessage({ type: 'error', text: 'Please input your email address' })
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setMessage({ type: 'error', text: 'Please enter a valid email' });
            return;
        }

        setLoading(true);
        setMessage({ type: null, text: '' });

        try {
            // Check if email exists - Fixed typo: 'newsleter' -> 'newsletter'
            const q = query(collection(db, 'newsletter'), where('email', '==', email.toLowerCase()));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                setMessage({ type: 'error', text: 'This email is already registered' });
                setLoading(false);
                return;
            }

            // Add to newsletter collection
            await addDoc(collection(db, 'newsletter'), {
                email: email.toLowerCase().trim(),
                subscribed: true,
                createdAt: new Date(),
                source: 'footer',
                preferences: {
                    newListings: true, // Fixed typo: 'newsListings' -> 'newListings'
                    marketUpdates: true,
                    priceAlerts: true
                }
            });

            setMessage({
                type: 'success',
                text: 'Thank you! You are now subscribed to receive the newest properties'
            });
            setEmail('');
        } catch (error) {
            console.error('Newsletter signup error:', error);
            setMessage({
                type: 'error',
                text: 'Error while subscribing, try again'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <footer className='bg-black text-white'>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Main footer content */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">

                    {/* Company info */}
                    <div className="lg:col-span-1">
                        <h3 className="text-xl font-bold text-blue-400 mb-4">Rosarito Resorts</h3>
                        <p className="text-gray-300 text-sm mb-6 leading-relaxed">
                            Your trusted partner for beachfront properties and investment opportunities in beautiful Rosarito, Baja California.
                        </p>

                        <div className="space-y-3">
                            <div className="flex items-center text-gray-300 text-sm">
                                <Phone className="w-4 h-4 mr-3 text-blue-400" />
                                <span>+52 664 558 7200</span>
                            </div>
                            <div className="flex items-center text-gray-300 text-sm">
                                <Mail className="w-4 h-4 mr-3 text-blue-400" />
                                <span>agents@rosaritoresorts.com</span>
                            </div>
                            <div className="flex items-center text-gray-300 text-sm">
                                <MapPin className="w-4 h-4 mr-3 text-blue-400" />
                                <span>Rosarito, Baja California, Mexico</span>
                            </div>
                        </div>

                        {/* Social media */}
                        <div className="flex space-x-4 mt-6">
                            <a href="https://www.facebook.com/carlos.investinthebestbaja" className="bg-gray-800 hover:bg-blue-600 p-2 rounded-full transition-colors duration-300">
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a href="#" className="bg-gray-800 hover:bg-blue-600 p-2 rounded-full transition-colors duration-300">
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a href="https://www.youtube.com/@investinbaja" className="bg-gray-800 hover:bg-blue-600 p-2 rounded-full transition-colors duration-300">
                                <Youtube className="w-5 h-5" />
                            </a>
                            <a href="https://www.linkedin.com/in/carlos-castro-89a375172/" className="bg-gray-800 hover:bg-blue-600 p-2 rounded-full transition-colors duration-300">
                                <Linkedin className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Property Types */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Types of Properties</h4>
                        <ul className="space-y-2">
                            <li><a href="#" className="text-gray-300 hover:text-blue-400 text-sm transition-colors">Beachfront Condos</a></li>
                            <li><a href="#" className="text-gray-300 hover:text-blue-400 text-sm transition-colors">Beachfront Communities</a></li>
                            <li><a href="#" className="text-gray-300 hover:text-blue-400 text-sm transition-colors">Beachfront Homes</a></li>
                            <li><a href="#" className="text-gray-300 hover:text-blue-400 text-sm transition-colors">Beachfront Lots</a></li>
                            <li><a href="#" className="text-gray-300 hover:text-blue-400 text-sm transition-colors">New Developments</a></li>
                            <li><a href="#" className="text-gray-300 hover:text-blue-400 text-sm transition-colors">Luxury Homes</a></li>
                        </ul>
                    </div>

                    {/* Popular areas */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Popular Areas</h4>
                        <ul className="space-y-2">
                            <li><a href="#" className="text-gray-300 hover:text-blue-400 text-sm transition-colors">La Jolla Excellence</a></li>
                            <li><a href="#" className="text-gray-300 hover:text-blue-400 text-sm transition-colors">Club Marena</a></li>
                            <li><a href="#" className="text-gray-300 hover:text-blue-400 text-sm transition-colors">Seahouz</a></li>
                            <li><a href="#" className="text-gray-300 hover:text-blue-400 text-sm transition-colors">Las Olas Mar y Sol</a></li>
                            <li><a href="#" className="text-gray-300 hover:text-blue-400 text-sm transition-colors">Palacio del Mar</a></li>
                            <li><a href="#" className="text-gray-300 hover:text-blue-400 text-sm transition-colors">Punta Piedra</a></li>
                        </ul>
                    </div>

                    {/* Services */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Services</h4>
                        <ul className="space-y-2 mb-6">
                            <li><a href="#" className="text-gray-300 hover:text-blue-400 text-sm transition-colors">Buy Homes</a></li>
                            <li><a href="#" className="text-gray-300 hover:text-blue-400 text-sm transition-colors">Sell Home</a></li>
                            <li><a href="#" className="text-gray-300 hover:text-blue-400 text-sm transition-colors">Rent Home</a></li>
                            <li><a href="#" className="text-gray-300 hover:text-blue-400 text-sm transition-colors">Get a Loan</a></li>
                            <li><a href="#" className="text-gray-300 hover:text-blue-400 text-sm transition-colors">For Sale by Owner</a></li>
                            <li><a href="#" className="text-gray-300 hover:text-blue-400 text-sm transition-colors">Custom Build a Home</a></li>
                        </ul>

                        {/* Newsletter signup */}
                        <div className="bg-gray-800 p-4 rounded-lg">
                            <h5 className="text-sm font-semibold mb-2">Newsletter</h5>
                            <p className="text-xs text-gray-400 mb-3">Receive the best offers</p>

                            <form onSubmit={handleNewsletterSubmit}>
                                <div className="flex">
                                    <input
                                        type="email"
                                        placeholder="Your email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="flex-1 px-3 py-2 text-sm bg-gray-700 border border-gray-600 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        disabled={loading}
                                    />
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white text-sm rounded-r-md transition-colors flex items-center"
                                    >
                                        {loading ? (
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            'Subscribe'
                                        )}
                                    </button>
                                </div>
                            </form>

                            {/* Success/Error messages */}
                            {message.type && (
                                <div className={`mt-3 p-2 rounded text-xs flex items-center ${
                                    message.type === 'success'
                                        ? 'bg-green-800 text-green-200'
                                        : 'bg-red-800 text-red-200'
                                }`}>
                                    {message.type === 'success' ? (
                                        <CheckCircle className='w-3 h-3 mr-2' />
                                    ) : (
                                        <AlertCircle className='w-3 h-3 mr-2' />
                                    )}
                                    {message.text}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Bottom section */}
                <div className="border-t border-gray-800 pt-8">
                    <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
                        {/* Left side - logo and copyright */}
                        <div className="flex flex-col lg:flex-row items-center space-y-2 lg:space-y-0 lg:space-x-6">
                            <div className="text-xl font-bold text-blue-400">Rosarito Resorts</div>
                            <p className="text-gray-400 text-sm">
                                © 2025 Rosarito Resorts. All rights reserved.
                            </p>
                        </div>
                        
                        {/* Right side - legal links */}
                        <div className="flex flex-wrap justify-center lg:justify-end space-x-6 text-sm">
                            <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">Terms and Conditions</a>
                            <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">Privacy Center</a>
                            <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">Cookies</a>
                            <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">Contact</a>
                        </div> 
                    </div>
                        
                    {/* Additional Legal Info */}
                    <div className="mt-6 pt-6 border-t border-gray-800">
                        <p className="text-xs text-gray-500 text-center leading-relaxed">
                            *All prices are subject to change without prior notice. 
                            The photos and property descriptions are for informational purposes only. 
                            It is recommended to verify all information with an authorized agent.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer;