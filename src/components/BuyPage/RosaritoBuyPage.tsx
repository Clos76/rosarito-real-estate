"use client";
import { useState } from 'react';
import { Home, TrendingUp, Waves, Sun, DollarSign, Users, Star, ArrowRight, Phone, Mail, Calendar, MessageCircle, Play, X, HelpCircle, MapPin } from 'lucide-react';
import Image from 'next/image';

import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import Head from 'next/head';
import Link from 'next/link';


const RosaritoBuyPage = () => {
    const [activeTab, setActiveTab] = useState<'investor' | 'secondhome' | 'retirement'>('investor');
    const [showVideoModal, setShowVideoModal] = useState(false);
    const [showContactForm, setShowContactForm] = useState(false);
    const [activeFAQ, setActiveFAQ] = useState<number | null>(null);

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
            description: "Prime beachfront location with luxury condos and direct beach access in downtown Rosarito",
            features: ["Direct Beach Access", "Ocean Views", "Gated Community", "Pool & Spa"],
            priceRange: "$180K - $489K",
            availability: "12 units available",
            location: "Rosarito Beach Boulevard"
        },
        {
            name: "La Jolla Residences",
            image: "/lasJollas.jpg", 
            description: "Modern beachfront developments with stunning Pacific Ocean views and luxury amenities",
            features: ["Beachfront Location", "Modern Amenities", "Security 24/7", "Gym & Restaurant"],
            priceRange: "$325K - $490K",
            availability: "16 units available",
            location: "La Jolla de Rosarito"
        },
        {
            name: "Club Marena",
            image: "/clubMarena.jpg",
            description: "Exclusive beachfront communities with wine country proximity and marina access",
            features: ["Beach Access", "Wine Tours", "Golf Course", "Marina Access"],
            priceRange: "$369K - $498K", 
            availability: "3 units available",
            location: "Puerto Nuevo Area"
        }
    ];

    const buyingReasons = {
        investor: {
            title: "Investment Opportunity",
            icon: <TrendingUp className="w-8 h-8" />,
            benefits: [
                "High rental yield potential with vacation rental market averaging 12-18% annually",
                "Growing tourism industry in Baja California with 8-10% yearly increase. ✅ (based on recent 2025 figures)",
                "Appreciation in beachfront property values averaging 7.2% per year",
                "Tax advantages for foreign investors in Mexican real estate",
                "Strong rental demand year-round from San Diego proximity",
                "Proximity to San Diego market creates constant demand (45 minutes drive)"
            ]
        },
        secondhome: {
            title: "Second Home Paradise",
            icon: <Home className="w-8 h-8" />,
            benefits: [
                "Weekend getaway just 45 minutes from San Diego via Tijuana border",
                "Year-round perfect Mediterranean climate with 300+ sunny days",
                "Rich cultural experiences and authentic Mexican local cuisine",
                "World-class surfing and water sports including fishing and diving",
                "Affordable luxury beachfront living compared to California prices",
                "Strong English-speaking expat community for easy integration"
            ]
        },
        retirement: {
            title: "Retirement Haven",
            icon: <Sun className="w-8 h-8" />,
            benefits: [
                "Significantly lower cost of living - up to 70% less than California",
                "Excellent healthcare facilities nearby including Hospital General",
                "Safe, welcoming expat retirement communities established since 1990s",
                "Beautiful pristine beaches for daily walks and exercise",
                "Rich cultural activities and traditional Mexican festivals year-round",
                "Easy access to US for family visits with improved border crossings"
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
            name: "Frank Martinez",
            location: "Los Angeles, CA",
            text: "We found our perfect beachfront house in Rosarito. The process was seamless and we're already seeing great rental returns of 15% annually!",
            image: "/K38.jpg",
            property: "K38 Beachfront Home",
            purchaseDate: "2023",
            roi: "15% annual return"
        },
        {
            name: "Hana and Jorge Rodriguez",
            location: "Los Angeles, CA", 
            text: "Best investment decision I've made. Beautiful property, great community, and incredible value. Carlos was very informative and helpful, definitely recommend him!",
            image: "/tecate.jpg",
            property: "Plaza del Mar Beach",
            purchaseDate: "2022",
            roi: "18% rental yield"
        }
    ];

    const faqs = [
        {
            question: "Can foreigners buy property in Rosarito, Mexico?",
            answer: "Yes, foreigners can legally purchase property in Mexico through a bank trust (fideicomiso) for beachfront properties, or direct ownership for properties outside the restricted zone. Our legal team handles all documentation and ensures full compliance with Mexican property laws."
        },
        {
            question: "What are the total costs when buying beachfront property in Rosarito?",
            answer: "Total closing costs typically range from 6-8% of purchase price, including notary fees (1-2%), acquisition tax (2%), trust setup fees (0.5%), and legal fees. We provide detailed cost breakdowns for every property to ensure transparency."
        },
        {
            question: "How close is Rosarito to San Diego and the US border?",
            answer: "Rosarito is approximately 45 minutes from downtown San Diego via the Tijuana border crossing. The new SENTRI lanes and improved infrastructure have significantly reduced crossing times for residents."
        },
        {
            question: "What financing options are available for US buyers?",
            answer: "We work with specialized lenders offering financing for Mexican properties, including developer financing (often 30-50% down), US-based portfolio lenders, and Mexican bank financing for qualified buyers. Interest rates typically range from 8-12%."
        },
        {
            question: "Is Rosarito safe for American retirees and investors?",
            answer: "Yes, Rosarito has a large, established expat community and is considered one of the safer areas in Baja California. The beachfront communities have 24/7 security, and the local government actively supports tourism and foreign investment."
        },
        {
            question: "What is the rental income potential for investment properties?",
            answer: "Beachfront properties in Rosarito typically generate 12-18% annual rental yields through vacation rentals and long-term tenants. Peak season (summer/holidays) rates can reach $200-400 per night for beachfront units."
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

            const cleanedData = {
                name: sanitizeInput(formData.name),
                email: sanitizeInput(formData.email),
                phone: sanitizeInput(formData.phone),
                interest: sanitizeInput(formData.interest),
                message: sanitizeInput(formData.message),
                budget: sanitizeInput(formData.budget),
                createdAt: serverTimestamp(),
                source: "buy-page-form"
            };

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

    const structuredData = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "RealEstateAgent",
                "name": "Rosarito Resorts",
                "url": "https://rosaritoresorts.com",
                "logo": "https://rosaritoresorts.com/logo.png",
                "image": "https://rosaritoresorts.com/hero-beachfront.jpg",
                "description": "Specializing in beachfront investment properties, second homes, and retirement homes in Rosarito, Baja California, Mexico.",
                "areaServed": {
                    "@type": "Place",
                    "name": "Rosarito, Baja California, Mexico",
                    "geo": {
                        "@type": "GeoCoordinates",
                        "latitude": "32.33534",
                        "longitude": "-117.05532"
                    }
                },
                "priceRange": "$180000-$498000",
                "telephone": "+1-555-0123",
                "sameAs": [
                    "https://www.facebook.com/rosaritoresorts",
                    "https://www.instagram.com/rosaritoresorts"
                ]
            },
            {
                "@type": "FAQPage",
                "mainEntity": faqs.map(faq => ({
                    "@type": "Question",
                    "name": faq.question,
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": faq.answer
                    }
                }))
            }
        ]
    };

    return (
        <div className="min-h-screen bg-white">
            <Head>
                <title>Beachfront Homes in Rosarito Mexico | Investment & Second Homes from $180K</title>
                <meta name="description" content="Discover exclusive beachfront properties in Rosarito, Mexico starting at $180K. Investment opportunities, second homes, and retirement living just 45 minutes from San Diego. 12-18% rental yields." />
                <meta name="keywords" content="rosarito real estate, beachfront properties mexico, investment properties baja california, mexico second homes, rosarito condos for sale, beachfront investment mexico, retirement homes rosarito" />
                <meta name="robots" content="index, follow" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <meta name="author" content="Rosarito Resorts" />
                <meta name="geo.region" content="MX-BCN" />
                <meta name="geo.placename" content="Rosarito, Baja California" />
                <meta name="geo.position" content="32.3668;-117.0448" />
                <meta name="ICBM" content="32.3668, -117.0448" />
                
                {/* Open Graph */}
                <meta property="og:title" content="Beachfront Homes in Rosarito Mexico | Investment & Second Homes from $180K" />
                <meta property="og:description" content="Discover exclusive beachfront properties in Rosarito, Mexico starting at $180K. Investment opportunities, second homes, and retirement living just 45 minutes from San Diego." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://rosaritoresorts.com/buy" />
                <meta property="og:image" content="https://rosaritoresorts.com/images/hero-beachfront-rosarito.jpg" />
                <meta property="og:image:width" content="1200" />
                <meta property="og:image:height" content="630" />
                <meta property="og:image:alt" content="Beachfront properties in Rosarito, Mexico with ocean views" />
                <meta property="og:site_name" content="Rosarito Resorts" />
                <meta property="og:locale" content="en_US" />
                
                {/* Twitter */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:site" content="@rosaritoresorts" />
                <meta name="twitter:title" content="Beachfront Homes in Rosarito Mexico | Investment & Second Homes from $180K" />
                <meta name="twitter:description" content="Discover exclusive beachfront properties in Rosarito, Mexico starting at $180K. 12-18% rental yields, 45 min from San Diego." />
                <meta name="twitter:image" content="https://rosaritoresorts.com/images/hero-beachfront-rosarito.jpg" />
                <meta name="twitter:image:alt" content="Beachfront properties in Rosarito, Mexico" />
                
                <link rel="canonical" href="https://rosaritoresorts.com/buy" />
                <link rel="alternate" hrefLang="es" href="https://rosaritoresorts.com/es/comprar" />
                
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(structuredData)
                    }}
                />
            </Head>

            {/* Breadcrumb Navigation */}
            <nav className="bg-gray-50 py-3 border-b" aria-label="Breadcrumb">
                <div className="max-w-7xl mx-auto px-4">
                    <ol className="flex items-center space-x-2 text-sm">
                        <li><Link href={"/"} className="text-blue-600 hover:text-blue-800">Home</Link></li>
                        <li className="text-gray-400">/</li>
                        <li><Link href={"#"} className="text-blue-600 hover:text-blue-800">Properties</Link></li>
                        <li className="text-gray-400">/</li>
                        <li className="text-gray-600" aria-current="page">Buy Beachfront Homes</li>
                    </ol>
                </div>
            </nav>

            {/* Floating Contact Button - Mobile */}
            <div className="fixed bottom-4 right-4 z-50 lg:hidden">
                <button
                    onClick={() => setShowContactForm(true)}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    aria-label="Contact us about beachfront properties"
                >
                    <MessageCircle className="w-6 h-6" />
                </button>
            </div>

            {/* Enhanced Hero Section */}
            <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-teal-600 text-white overflow-hidden">
                <div className="absolute inset-0 bg-black opacity-30"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-blue-900 opacity-50"></div>

                <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
                <div className="absolute top-40 right-20 w-96 h-96 bg-teal-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>

                <div className="relative max-w-7xl mx-auto px-4 py-16 sm:py-24 lg:py-32">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="text-left">
                            <div className="inline-flex items-center bg-yellow-400 text-black px-4 py-2 rounded-full text-sm font-semibold mb-6">
                                <Star className="w-4 h-4 mr-2" />
                                Rosarito&apos;s #1 Beachfront Specialist
                            </div>

                            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                                Your Dream
                                <span className="block bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
                                    Beachfront Home
                                </span>
                                Awaits in Rosarito
                            </h1>

                            <p className="text-xl md:text-2xl mb-8 opacity-90 leading-relaxed">
                                Exclusive beachfront condos and homes from $180K. Just 45 minutes from San Diego with guaranteed ocean views, luxury amenities, and 12-18% rental yields.
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
                                <p>✓ Exclusive off-market beachfront properties</p>
                                <p>✓ Complete legal and buying assistance</p>
                            </div>
                        </div>

                        {/* Right side - Quick Contact Form */}
                        <div className="hidden lg:block">
                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                                <h2 className="text-2xl font-bold mb-6 text-center">Get Your Free Property Report</h2>

                                {submitted && (
                                    <div className="bg-green-100 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
                                        Thank you! We&apos;ll send you exclusive property listings within 24 hours.
                                    </div>
                                )}

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
                                        aria-label="Full Name"
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
                                        aria-label="Email Address"
                                    />
                                    <input
                                        type="tel"
                                        name="phone"
                                        placeholder="Phone Number"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 placeholder-white/70 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                        disabled={isSubmitting}
                                        aria-label="Phone Number"
                                    />
                                    <select
                                        name="budget"
                                        value={formData.budget}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                        disabled={isSubmitting}
                                        aria-label="Budget Range"
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
            </section>

            {/* Enhanced Stats with Social Proof */}
            <section className="bg-gray-50 py-12 border-b">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-8">
                        <p className="text-gray-600 mb-2">Our Team has been Trusted by hundreds of satisfied clients since 2019</p>
                        <div className="flex justify-center items-center space-x-1 mb-6">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                            ))}
                            <span className="ml-2 text-gray-700 font-semibold">Invest With Ease Of Mind</span>
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
            </section>

            {/* Enhanced Communities Section */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
                            Exclusive Beachfront Communities in Rosarito
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Hand-picked beachfront properties with guaranteed Pacific Ocean views, direct beach access, and luxury amenities. Updated daily with new listings from trusted developers.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {communities.map((c, idx) => (
                            <article key={idx} className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                                <div className="h-64 relative overflow-hidden">
                                    <Image
                                        src={c.image || "/images/placeholder.jpg"}
                                        alt={`${c.name} beachfront properties in ${c.location}, Rosarito`}
                                        width={800}
                                        height={600}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        loading={idx === 0 ? "eager" : "lazy"}
                                        priority={idx === 0}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                    <div className="absolute top-4 right-4">
                                        <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                                            {c.availability}
                                        </span>
                                    </div>
                                    <div className="absolute bottom-4 left-4 text-white">
                                        <h3 className="text-2xl font-bold mb-1">{c.name}</h3>
                                        <p className="text-sm opacity-90 flex items-center">
                                            <MapPin className="w-4 h-4 mr-1" />
                                            {c.location}
                                        </p>
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
                                            <div className="text-sm text-gray-500">Starting prices USD</div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowContactForm(true)}
                                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
                                    >
                                        View Available Units <ArrowRight className="ml-2 w-4 h-4" />
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            {/* Social Proof Section */}
            <section className="bg-gray-50 py-16">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">What Our Beachfront Property Clients Say</h2>
                        <p className="text-xl text-gray-600">Real success stories from satisfied beachfront homeowners in Rosarito</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {testimonials.map((testimonial, idx) => (
                            <article key={idx} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                                <div className="flex items-center mb-6">
                                    <Image
                                        src={testimonial.image || "/images/placeholder.jpg"}
                                        alt={`${testimonial.name} testimonial photo`}
                                        width={800}
                                        height={600}
                                        className="w-16 h-16 rounded-full object-cover mr-4"
                                        loading="lazy"
                                    />
                                    <div>
                                        <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                                        <p className="text-gray-600 text-sm">{testimonial.location}</p>
                                        <p className="text-blue-600 text-sm font-medium">{testimonial.property}</p>
                                        <p className="text-green-600 text-xs font-semibold">Purchased {testimonial.purchaseDate} • {testimonial.roi}</p>
                                    </div>
                                </div>
                                <div className="flex mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                                    ))}
                                </div>
                                <blockquote className="text-gray-700 italic leading-relaxed">&apos;{testimonial.text}&apos;</blockquote>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            {/* Enhanced Why Buy Section */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
                            Why Smart Investors Choose Rosarito Beachfront Properties
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Whether you&apos;re investing for rental income, buying a second home, or planning retirement, Rosarito offers unmatched value, lifestyle, and financial returns.
                        </p>
                    </div>

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
            </section>

            {/* Lifestyle Section */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6 text-gray-900">The Rosarito Beachfront Lifestyle</h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            More than just real estate investment - it&apos;s a complete lifestyle transformation with year-round beach living
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            {
                                icon: <Waves className="w-8 h-8" />,
                                title: "Direct Beach Access",
                                description: "Step onto pristine Pacific beaches with world-class surfing, swimming, and water sports right from your front door",
                                bgColor: "bg-blue-100",
                                hoverColor: "group-hover:bg-blue-200",
                                textColor: "text-blue-600"
                            },
                            {
                                icon: <Sun className="w-8 h-8" />,
                                title: "Perfect Climate",
                                description: "Year-round Mediterranean climate with 300+ days of sunshine and comfortable 65-80°F temperatures",
                                bgColor: "bg-yellow-100",
                                hoverColor: "group-hover:bg-yellow-200",
                                textColor: "text-yellow-600"
                            },
                            {
                                icon: <DollarSign className="w-8 h-8" />,
                                title: "Affordable Luxury",
                                description: "Premium beachfront living at 60-70% less than comparable California oceanfront properties",
                                bgColor: "bg-green-100",
                                hoverColor: "group-hover:bg-green-200",
                                textColor: "text-green-600"
                            },
                            {
                                icon: <Users className="w-8 h-8" />,
                                title: "Expat Community",
                                description: "Vibrant English-speaking community with rich local Mexican culture, festivals, and authentic cuisine",
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
            </section>

            {/* FAQ Section */}
            <section className="py-16 bg-white">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Frequently Asked Questions About Buying Beachfront Property in Rosarito
                        </h2>
                        <p className="text-xl text-gray-600">Get answers to common questions about purchasing beachfront real estate in Mexico</p>
                    </div>

                    <div className="space-y-4">
                        {faqs.map((faq, idx) => (
                            <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                <button
                                    onClick={() => setActiveFAQ(activeFAQ === idx ? null : idx)}
                                    className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
                                    aria-expanded={activeFAQ === idx}
                                >
                                    <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
                                    <HelpCircle className={`w-5 h-5 text-blue-600 flex-shrink-0 transform transition-transform ${activeFAQ === idx ? 'rotate-180' : ''}`} />
                                </button>
                                {activeFAQ === idx && (
                                    <div className="px-6 pb-4">
                                        <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Enhanced Final CTA */}
            <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-teal-600 text-white py-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-black opacity-20"></div>
                <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-teal-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>

                <div className="relative max-w-4xl mx-auto text-center px-4">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6">
                        Your Rosarito Beachfront Paradise Awaits
                    </h2>
                    <p className="text-xl md:text-2xl mb-10 opacity-90 leading-relaxed">
                        Join hundreds of smart investors who&apos;ve already secured their piece of Rosarito&apos;s premium coastline.
                        Limited beachfront inventory available.
                    </p>

                    <div className="flex flex-col sm:flex-row justify-center gap-6 mb-10">
                        <button
                            onClick={() => setShowContactForm(true)}
                            className="bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-300 hover:to-orange-300 text-black px-10 py-5 rounded-full font-bold text-xl transition-all duration-300 transform hover:scale-105 shadow-2xl flex items-center justify-center"
                        >
                            <Calendar className="mr-3 w-6 h-6" />
                            Schedule Private Property Tour
                        </button>

                        <button
                            onClick={() => setShowContactForm(true)}
                            className="border-2 border-white hover:bg-white hover:text-blue-600 px-10 py-5 rounded-full font-bold text-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
                        >
                            <Mail className="mr-3 w-6 h-6" />
                            Get Exclusive Beachfront Listings
                        </button>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 text-center">
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                            <Phone className="w-8 h-8 mx-auto mb-3 text-yellow-400" />
                            <h4 className="font-semibold mb-2">Direct Line</h4>
                            <p className="text-sm opacity-75">Speak with a Rosarito beachfront specialist</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                            <MessageCircle className="w-8 h-8 mx-auto mb-3 text-yellow-400" />
                            <h4 className="font-semibold mb-2">WhatsApp Ready</h4>
                            <p className="text-sm opacity-75">Instant property updates and photos</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                            <Star className="w-8 h-8 mx-auto mb-3 text-yellow-400" />
                            <h4 className="font-semibold mb-2">5-Star Service</h4>
                            <p className="text-sm opacity-75">Complete legal and buying support</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Form Modal */}
            {showContactForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="contact-form-title">
                    <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 id="contact-form-title" className="text-2xl font-bold text-gray-900">Get Your Beachfront Property List</h3>
                                <button
                                    onClick={() => setShowContactForm(false)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                    aria-label="Close form"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {submitted && (
                                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
                                    Thank you! We&apos;ll send you exclusive beachfront property listings within 24 hours.
                                </div>
                            )}

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
                                    aria-label="Full Name"
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
                                    aria-label="Email Address"
                                />
                                <input
                                    type="tel"
                                    name="phone"
                                    placeholder="Phone Number"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    disabled={isSubmitting}
                                    aria-label="Phone Number"
                                />
                                <select
                                    name="interest"
                                    value={formData.interest}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    disabled={isSubmitting}
                                    aria-label="Property Interest Type"
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
                                    aria-label="Budget Range"
                                >
                                    <option value="">Budget Range</option>
                                    <option value="under-200k">Under $200K</option>
                                    <option value="200k-400k">$200K - $400K</option>
                                    <option value="400k-600k">$400K - $600K</option>
                                    <option value="over-600k">Over $600K</option>
                                </select>
                                <textarea
                                    name="message"
                                    placeholder="Tell me about your ideal beachfront property in Rosarito..."
                                    value={formData.message}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                    disabled={isSubmitting}
                                    aria-label="Additional Message"
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
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true">
                    <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                        <div className="flex justify-between items-center p-6 border-b">
                            <h3 className="text-xl font-bold">Rosarito Beachfront Virtual Tour</h3>
                            <button
                                onClick={() => setShowVideoModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                                aria-label="Close video"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="aspect-video bg-gray-200 flex items-center justify-center">
                            <div className="text-center">
                                <Play className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-600">Virtual tour video would be embedded here</p>
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