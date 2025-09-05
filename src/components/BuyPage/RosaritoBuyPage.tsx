"use client";
import { useState } from 'react';
import { Home, TrendingUp, Waves, Sun, DollarSign, Users, Star, ArrowRight, Phone, Mail, Calendar, MessageCircle, Play, X, } from 'lucide-react';
import Image from 'next/image';

import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";


const RosaritoBuyPage = () => {
    const [activeTab, setActiveTab] = useState<'investor' | 'secondhome' | 'retirement'>('investor');
    const [showVideoModal, setShowVideoModal] = useState(false);
    const [showContactForm, setShowContactForm] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        interest: 'investment',
        message: '',
        budget: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const sanitizeInput = (input: string): string => {
        return input
            .replace(/[<>]/g, "")
            .replace(/javascript:/gi, "")
            .replace(/on\w+=/gi, "")
            .trim()
            .replace(/\s+/g, " ")
            .substring(0, 500);
    };

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const communities = [
        {
            name: "Downtown Rosarito",
            image: "/hotelRosarito.jpg",
            description: "Prime beachfront location with luxury condos and direct beach access",
            features: ["Direct Beach Access", "Ocean Views", "Gated Community", "Pool & Spa"],
            priceRange: "$180K - $489K",
            availability: "12 units available"
        },
        {
            name: "La Jolla Residences",
            image: "/lasJollas.jpg",
            description: "Modern beachfront developments with stunning Pacific views",
            features: ["Beachfront Location", "Modern Amenities", "Security 24/7", "Gym & Restaurant"],
            priceRange: "$325K - $490K",
            availability: "16 units available"
        },
        {
            name: "Club Marena",
            image: "/clubMarena.jpg",
            description: "Exclusive beachfront communities with wine country proximity",
            features: ["Beach Access", "Wine Tours", "Golf Course", "Marina Access"],
            priceRange: "$369K - $498K",
            availability: "3 units available"
        }
    ];

    const buyingReasons = {
        investor: {
            title: "Investment Opportunity",
            icon: <TrendingUp className="w-8 h-8" />,
            benefits: [
                "High rental yield potential with vacation rental market",
                "Growing tourism industry in Baja California",
                "Appreciation in beachfront property values",
                "Tax advantages for foreign investors",
                "Strong rental demand year-round",
                "Proximity to San Diego market (45 minutes)"
            ]
        },
        secondhome: {
            title: "Second Home Paradise",
            icon: <Home className="w-8 h-8" />,
            benefits: [
                "Weekend getaway just 45 minutes from San Diego",
                "Year-round perfect climate",
                "Rich cultural experiences and local cuisine",
                "World-class surfing and water sports",
                "Affordable luxury living",
                "Strong expat community"
            ]
        },
        retirement: {
            title: "Retirement Haven",
            icon: <Sun className="w-8 h-8" />,
            benefits: [
                "Significantly lower cost of living",
                "Excellent healthcare facilities nearby",
                "Safe, welcoming expat communities",
                "Beautiful beaches for daily walks",
                "Rich cultural activities and festivals",
                "Easy access to US for visits"
            ]
        }
    };

    const stats = [
        { label: "Average Price Appreciation", value: "8.2%", subtitle: "Annual growth", trend: "+2.1% this quarter" },
        { label: "Tourism Growth", value: "15%", subtitle: "Yearly increase", trend: "Pre-COVID levels exceeded" },
        { label: "Rental Yield", value: "12-18%", subtitle: "Annual returns", trend: "Higher than SD County" },
        { label: "Distance to San Diego", value: "45 min", subtitle: "Drive time", trend: "New border improvements" }
    ];

    const testimonials = [
        {
            name: "Frank",
            location: "Los Angeles, CA",
            text: "We found our perfect beachfront house in Rosarito. The process was seamless and we're already seeing great rental returns!",
            image: "/K38.jpg",
            property: "K38 Beachfront Home"
        },
        {
            name: "Hana and Jorge",
            location: "Los Angeles, CA",
            text: "Best investment decision I've made. Beautiful property, great community, and incredible value. Carlos was very informative and helpful, definately recommend him!",
            image: "/tecate.jpg",
            property: "Plaze del Mar Beach"
        }
    ];

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");
        setSubmitted(false);

        try {
            if (!validateEmail(formData.email)) {
                setError("Please enter a valid email address.");
                setIsSubmitting(false);
                return;
            }

            // sanitize inputs
            const cleanedData = {
                name: sanitizeInput(formData.name),
                email: sanitizeInput(formData.email),
                phone: sanitizeInput(formData.phone),
                interest: sanitizeInput(formData.interest),
                message: sanitizeInput(formData.message),
                budget: sanitizeInput(formData.budget),
                createdAt: serverTimestamp(),
            };

            // save to Firestore
            await addDoc(collection(db, "buyLeads"), cleanedData);

            setSubmitted(true);
            setFormData({
                name: "",
                email: "",
                phone: "",
                interest: "investment",
                message: "",
                budget: ""
            });

            // Auto-close modal after success
            setTimeout(() => {
                setShowContactForm(false);
                setSubmitted(false);
            }, 3000);

        } catch (err) {
            console.error("Error saving form:", err);
            setError("Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Floating Contact Button - Mobile */}
            <div className="fixed bottom-4 right-4 z-50 lg:hidden">
                <button
                    onClick={() => setShowContactForm(true)}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                    <MessageCircle className="w-6 h-6" />
                </button>
            </div>

            {/* Enhanced Hero Section */}
            <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-teal-600 text-white overflow-hidden">
                <div className="absolute inset-0 bg-black opacity-30"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-blue-900 opacity-50"></div>

                {/* Animated background elements */}
                <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
                <div className="absolute top-40 right-20 w-96 h-96 bg-teal-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>

                <div className="relative max-w-7xl mx-auto px-4 py-16 sm:py-24 lg:py-32">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="text-left">
                            <div className="inline-flex items-center bg-yellow-400 text-black px-4 py-2 rounded-full text-sm font-semibold mb-6">
                                <Star className="w-4 h-4 mr-2" />
                                Rosarito&apos;s Beachfront Specialist
                            </div>

                            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                                Your Dream
                                <span className="block bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
                                    Beachfront Home
                                </span>
                                Awaits in Rosarito
                            </h1>

                            <p className="text-xl md:text-2xl mb-8 opacity-90 leading-relaxed">
                                Exclusive beachfront condos and homes from $185K. Just 45 minutes from San Diego with guaranteed ocean views and luxury amenities.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 mb-8">
                                <button
                                    onClick={() => setShowContactForm(true)}
                                    className="bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-300 hover:to-orange-300 text-black px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center"
                                >
                                    Get Exclusive Property List <ArrowRight className="ml-2 w-5 h-5" />
                                </button>
                            </div>

                            <div className="text-sm opacity-75 space-y-1">
                                <p>✓ No obligation consultation</p>
                                <p>✓ Exclusive off-market properties</p>
                                <p>✓ Complete buying assistance</p>
                            </div>
                        </div>

                        {/* Right side - Quick Contact Form */}
                        <div className="hidden lg:block">
                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                                <h3 className="text-2xl font-bold mb-6 text-center">Get Your Free Property Report</h3>
                                
                                {/* Success Message */}
                                {submitted && (
                                    <div className="bg-green-100 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
                                        Thank you! We&apos;ll send you exclusive property listings within 24 hours.
                                    </div>
                                )}

                                {/* Error Message */}
                                {error && (
                                    <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                                        {error}
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Full Name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 placeholder-white/70 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                        required
                                        disabled={isSubmitting}
                                    />
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="Email Address"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 placeholder-white/70 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                        required
                                        disabled={isSubmitting}
                                    />
                                    <input
                                        type="tel"
                                        name="phone"
                                        placeholder="Phone Number"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 placeholder-white/70 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                        disabled={isSubmitting}
                                    />
                                    <select
                                        name="budget"
                                        value={formData.budget}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                        disabled={isSubmitting}
                                    >
                                        <option value="" className="text-gray-900">Select Budget Range</option>
                                        <option value="under-200k" className="text-gray-900">Under $200K</option>
                                        <option value="200k-400k" className="text-gray-900">$200K - $400K</option>
                                        <option value="400k-600k" className="text-gray-900">$400K - $600K</option>
                                        <option value="over-600k" className="text-gray-900">Over $600K</option>
                                    </select>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className={`w-full px-6 py-3 rounded-lg font-bold transition-all duration-300 ${
                                            isSubmitting 
                                                ? 'bg-gray-400 cursor-not-allowed' 
                                                : 'bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-300 hover:to-orange-300 transform hover:scale-105'
                                        } text-black`}
                                    >
                                        {isSubmitting ? 'Sending...' : 'Send Me Properties'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Enhanced Stats with Social Proof */}
            <div className="bg-gray-50 py-12 border-b">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-8">
                        <p className="text-gray-600 mb-2">Our Team has been Trusted by 100&apos;s of satisfied clients</p>
                        <div className="flex justify-center items-center space-x-1 mb-6">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                            ))}
                            <span className="ml-2 text-gray-700 font-semibold">Invest Safely </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        {stats.map((stat, idx) => (
                            <div key={idx} className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                                <div className="text-3xl font-bold text-blue-600 mb-2">{stat.value}</div>
                                <div className="text-gray-700 font-medium mb-1">{stat.label}</div>
                                <div className="text-sm text-gray-500 mb-2">{stat.subtitle}</div>
                                <div className="text-xs text-green-600 font-medium">{stat.trend}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Enhanced Communities Section */}
            <div className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
                            Exclusive Beachfront Communities
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Hand-picked properties with guaranteed ocean views, direct beach access, and luxury amenities. Updated daily with new listings.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {communities.map((c, idx) => (
                            <div key={idx} className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                                <div className="h-64 relative overflow-hidden">
                                    <Image
                                        src={c.image || "/images/placeholder.jpg"}
                                        alt={c.name}
                                        width={800}
                                        height={600}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                    <div className="absolute top-4 right-4">
                                        <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                                            {c.availability}
                                        </span>
                                    </div>
                                    <div className="absolute bottom-4 left-4 text-white">
                                        <h3 className="text-2xl font-bold mb-1">{c.name}</h3>
                                        <p className="text-sm opacity-90">Ocean views guaranteed</p>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <p className="text-gray-600 mb-4 leading-relaxed">{c.description}</p>
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {c.features.map((f, i) => (
                                            <span key={i} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium border border-blue-100">
                                                {f}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="flex justify-between items-center mb-4">
                                        <div>
                                            <div className="text-2xl font-bold text-blue-600">{c.priceRange}</div>
                                            <div className="text-sm text-gray-500">Starting prices</div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowContactForm(true)}
                                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
                                    >
                                        View Available Units <ArrowRight className="ml-2 w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Social Proof Section */}
            <div className="bg-gray-50 py-16">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">What Our Clients Say</h2>
                        <p className="text-xl text-gray-600">Real stories from real beachfront homeowners</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {testimonials.map((testimonial, idx) => (
                            <div key={idx} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                                <div className="flex items-center mb-6">
                                    <Image
                                        src={testimonial.image || "/images/placeholder.jpg"}
                                        alt={testimonial.name}
                                        width={800}
                                        height={600}
                                        className="w-16 h-16 rounded-full object-cover mr-4"
                                    />
                                    <div>
                                        <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                                        <p className="text-gray-600 text-sm">{testimonial.location}</p>
                                        <p className="text-blue-600 text-sm font-medium">{testimonial.property}</p>
                                    </div>
                                </div>
                                <div className="flex mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                                    ))}
                                </div>
                                <p className="text-gray-700 italic leading-relaxed">{testimonial.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Enhanced Why Buy Section */}
            <div className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
                            Why Smart Investors Choose Rosarito
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Whether you&apos;re investing, buying a second home, or planning retirement, Rosarito offers unmatched value and lifestyle.
                        </p>
                    </div>

                    {/* Enhanced Tabs */}
                    <div className="flex justify-center mb-8">
                        <div className="bg-gray-100 rounded-2xl p-2 shadow-inner">
                            {Object.keys(buyingReasons).map((key) => {
                                const typedKey = key as keyof typeof buyingReasons;
                                return (
                                    <button
                                        key={typedKey}
                                        onClick={() => setActiveTab(typedKey)}
                                        className={`px-6 py-4 rounded-xl font-semibold transition-all duration-300 ${activeTab === typedKey
                                            ? 'bg-white text-blue-600 shadow-lg transform scale-105'
                                            : 'text-gray-600 hover:text-blue-600 hover:bg-white/50'
                                        }`}
                                    >
                                        {buyingReasons[typedKey].title}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Enhanced Tab Content */}
                    <div className="bg-gradient-to-br from-blue-50 to-teal-50 rounded-2xl p-8 lg:p-12 shadow-xl">
                        <div className="flex justify-center mb-8">
                            <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-6 rounded-2xl text-blue-600 shadow-lg">
                                {buyingReasons[activeTab].icon}
                            </div>
                        </div>
                        <h3 className="text-3xl font-bold text-center mb-10 text-gray-900">
                            {buyingReasons[activeTab].title}
                        </h3>
                        <div className="grid md:grid-cols-2 gap-6">
                            {buyingReasons[activeTab].benefits.map((benefit, i) => (
                                <div key={i} className="flex items-start group">
                                    <div className="bg-green-100 p-2 rounded-full mr-4 mt-1 group-hover:bg-green-200 transition-colors duration-300">
                                        <Star className="w-5 h-5 text-green-600" />
                                    </div>
                                    <p className="text-gray-700 leading-relaxed text-lg">{benefit}</p>
                                </div>
                            ))}
                        </div>

                        <div className="text-center mt-10">
                            <button
                                onClick={() => setShowContactForm(true)}
                                className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                            >
                                Get Personalized Investment Analysis
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Lifestyle Section - Enhanced */}
            <div className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6 text-gray-900">The Rosarito Lifestyle</h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            More than just property - it&apos;s a lifestyle transformation
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            {
                                icon: <Waves className="w-8 h-8" />,
                                title: "Beach Living",
                                description: "Direct access to pristine beaches with world-class surfing and swimming",
                                bgColor: "bg-blue-100",
                                hoverColor: "group-hover:bg-blue-200",
                                textColor: "text-blue-600"
                            },
                            {
                                icon: <Sun className="w-8 h-8" />,
                                title: "Perfect Climate",
                                description: "Year-round Mediterranean climate with 300+ days of sunshine",
                                bgColor: "bg-yellow-100",
                                hoverColor: "group-hover:bg-yellow-200",
                                textColor: "text-yellow-600"
                            },
                            {
                                icon: <DollarSign className="w-8 h-8" />,
                                title: "Affordable Luxury",
                                description: "Premium beachfront living at a fraction of California prices",
                                bgColor: "bg-green-100",
                                hoverColor: "group-hover:bg-green-200",
                                textColor: "text-green-600"
                            },
                            {
                                icon: <Users className="w-8 h-8" />,
                                title: "Community",
                                description: "Vibrant expat community with rich local culture and traditions",
                                bgColor: "bg-purple-100",
                                hoverColor: "group-hover:bg-purple-200",
                                textColor: "text-purple-600"
                            }
                        ].map((item, idx) => (
                            <div key={idx} className="text-center group hover:transform hover:scale-105 transition-all duration-300">
                                <div className={`${item.bgColor} w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 ${item.hoverColor} transition-colors duration-300 shadow-lg`}>
                                    <div className={item.textColor}>
                                        {item.icon}
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold mb-4 text-gray-900">{item.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Enhanced Final CTA */}
            <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-teal-600 text-white py-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-black opacity-20"></div>
                <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-teal-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>

                <div className="relative max-w-4xl mx-auto text-center px-4">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6">
                        Your Beachfront Paradise Awaits
                    </h2>
                    <p className="text-xl md:text-2xl mb-10 opacity-90 leading-relaxed">
                        Join hundreds of smart investors who&apos;ve already secured their piece of Rosarito&apos;s coastline.
                        Limited beachfront inventory - don&apos;t wait.
                    </p>

                    <div className="flex flex-col sm:flex-row justify-center gap-6 mb-10">
                        <button
                            onClick={() => setShowContactForm(true)}
                            className="bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-300 hover:to-orange-300 text-black px-10 py-5 rounded-full font-bold text-xl transition-all duration-300 transform hover:scale-105 shadow-2xl flex items-center justify-center"
                        >
                            <Calendar className="mr-3 w-6 h-6" />
                            Schedule Private Showing
                        </button>

                        <button
                            onClick={() => setShowContactForm(true)}
                            className="border-2 border-white hover:bg-white hover:text-blue-600 px-10 py-5 rounded-full font-bold text-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
                        >
                            <Mail className="mr-3 w-6 h-6" />
                            Get Exclusive Listings
                        </button>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 text-center">
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                            <Phone className="w-8 h-8 mx-auto mb-3 text-yellow-400" />
                            <h4 className="font-semibold mb-2">Call Direct</h4>
                            <p className="text-sm opacity-75">Speak with a Rosarito specialist</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                            <MessageCircle className="w-8 h-8 mx-auto mb-3 text-yellow-400" />
                            <h4 className="font-semibold mb-2">WhatsApp Ready</h4>
                            <p className="text-sm opacity-75">Instant property updates</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                            <Star className="w-8 h-8 mx-auto mb-3 text-yellow-400" />
                            <h4 className="font-semibold mb-2">5-Star Service</h4>
                            <p className="text-sm opacity-75">End-to-end buying support</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contact Form Modal */}
            {showContactForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-bold text-gray-900">Get Your Property List</h3>
                                <button
                                    onClick={() => setShowContactForm(false)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Success Message */}
                            {submitted && (
                                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
                                    Thank you! We&apos;ll send you exclusive property listings within 24 hours.
                                </div>
                            )}

                            {/* Error Message */}
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Full Name *"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                    disabled={isSubmitting}
                                />
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Email Address *"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                    disabled={isSubmitting}
                                />
                                <input
                                    type="tel"
                                    name="phone"
                                    placeholder="Phone Number"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    disabled={isSubmitting}
                                />
                                <select
                                    name="interest"
                                    value={formData.interest}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    disabled={isSubmitting}
                                >
                                    <option value="investment">Investment Property</option>
                                    <option value="second-home">Second Home</option>
                                    <option value="retirement">Retirement Home</option>
                                    <option value="relocation">Full Relocation</option>
                                </select>
                                <select
                                    name="budget"
                                    value={formData.budget}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    disabled={isSubmitting}
                                >
                                    <option value="">Budget Range</option>
                                    <option value="under-200k">Under $200K</option>
                                    <option value="200k-400k">$200K - $400K</option>
                                    <option value="400k-600k">$400K - $600K</option>
                                    <option value="over-600k">Over $600K</option>
                                </select>
                                <textarea
                                    name="message"
                                    placeholder="Tell me about your ideal beachfront property..."
                                    value={formData.message}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                    disabled={isSubmitting}
                                />

                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <div className="flex items-center text-sm text-blue-800">
                                        <Star className="w-4 h-4 mr-2 text-blue-600" />
                                        <span className="font-semibold">What you&apos;ll receive:</span>
                                    </div>
                                    <ul className="text-sm text-blue-700 mt-2 space-y-1">
                                        <li>• Curated list of available beachfront properties</li>
                                        <li>• Market analysis and investment projections</li>
                                        <li>• Virtual tour links and detailed photos</li>
                                        <li>• Financing options and legal guidance</li>
                                    </ul>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`w-full px-6 py-4 rounded-lg font-bold text-lg transition-all duration-300 ${
                                        isSubmitting 
                                            ? 'bg-gray-400 cursor-not-allowed' 
                                            : 'bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 transform hover:scale-105'
                                    } text-white`}
                                >
                                    {isSubmitting ? 'Sending...' : 'Send Me Properties Now'}
                                </button>

                                <p className="text-xs text-gray-500 text-center">
                                    By submitting, you agree to receive property information via email and phone.
                                    We respect your privacy and never share your information.
                                </p>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Video Modal */}
            {showVideoModal && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                        <div className="flex justify-between items-center p-6 border-b">
                            <h3 className="text-xl font-bold">Rosarito Beachfront Virtual Tour</h3>
                            <button
                                onClick={() => setShowVideoModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="aspect-video bg-gray-200 flex items-center justify-center">
                            <div className="text-center">
                                <Play className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-600">Video tour would be embedded here</p>
                                <p className="text-sm text-gray-500 mt-2">
                                    Integration with YouTube, Vimeo, or custom video player
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RosaritoBuyPage;