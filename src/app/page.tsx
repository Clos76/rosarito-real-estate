import RecommendedSection from "@/components/layout/RecommendedSection";
import Hero from "../components/layout/Hero";
import InfoCards from "@/components/layout/InfoCards";
import Neighborhoods from "@/components/layout/Neighborhoods";
import ContactForm from "@/components/layout/MainContactForm"; 
import Head from "next/head";
import Footer from "@/components/layout/Footer";


export default function Home() {
  return (
    <>
      <Head>
        <title>Rosarito Real Estate | Beachfront Homes & Condos for Sale</title>
        <meta
          name="description"
          content="Find your dream beachfront property in Rosarito, Playas de Tijuana, and Ensenada, Baja California. Buy, sell, rent, or finance homes and condos with Rosarito Resorts Real Estate. Explore FSBO options and get free home value estimates."
        />
        <link rel="canonical" href="https://rosaritoresorts.com/" />

        {/* OpenGraph for social */}
        <meta property="og:title" content="Rosarito Real Estate | Rosarito Resorts" />
        <meta property="og:description" content="Explore beachfront homes, condos, and land in Rosarito, Playas de Tijuana, and Ensenada. Local real estate experts to help you invest in Baja California." />
        <meta property="og:url" content="https://rosaritoresorts.com/" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://rosaritoresorts.com/og-image.jpg" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Rosarito Real Estate | Rosarito Resorts" />
        <meta name="twitter:description" content="Browse beachfront condos, homes, and land in Rosarito, Playas de Tijuana, and Ensenada, Mexico." />
        <meta name="twitter:image" content="https://rosaritoresorts.com/og-image.jpg" />

        {/* Structured Data JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "RealEstateAgent",
              "name": "Rosarito Resorts Real Estate",
              "url": "https://rosaritoresorts.com",
              "logo": "https://rosaritoresorts.com/logo.png",
              "image": "https://rosaritoresorts.com/og-image.jpg",
              "description": "Helping buyers and investors find beachfront condos and homes in Rosarito, Playas de Tijuana, and Ensenada, Baja California.",
              "areaServed": [
                { "@type": "Place", "name": "Rosarito" },
                { "@type": "Place", "name": "Playas de Tijuana" },
                { "@type": "Place", "name": "Ensenada" }
              ],
              "sameAs": [
                "https://www.facebook.com/carlos.investinthebestbaja",
                "https://www.instagram.com/yourpage",
                "https://www.youtube.com/@investinbaja",
                "https://www.linkedin.com/in/carlos-castro-89a375172/"
              ],
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Rosarito",
                "addressRegion": "BC",
                "addressCountry": "MX"
              },
              "hasOfferCatalog": [
                {
                  "@type": "OfferCatalog",
                  "name": "Neighborhoods",
                  "itemListElement": [
                    { "@type": "Offer", "itemOffered": { "@type": "Place", "name": "La Jolla" } },
                    { "@type": "Offer", "itemOffered": { "@type": "Place", "name": "La Jolla Rosarito" } },
                    { "@type": "Offer", "itemOffered": { "@type": "Place", "name": "La Jolla Del Mar" } },
                    { "@type": "Offer", "itemOffered": { "@type": "Place", "name": "La Jolla Excellence" } },
                    { "@type": "Offer", "itemOffered": { "@type": "Place", "name": "La Jolla Real" } },
                    { "@type": "Offer", "itemOffered": { "@type": "Place", "name": "Club Marena" } },
                    { "@type": "Offer", "itemOffered": { "@type": "Place", "name": "Seahouse" } },
                    { "@type": "Offer", "itemOffered": { "@type": "Place", "name": "Las Olas Mar y Sol" } },
                    { "@type": "Offer", "itemOffered": { "@type": "Place", "name": "Las Olas Grand" } },
                    { "@type": "Offer", "itemOffered": { "@type": "Place", "name": "Las Olas" } },
                    { "@type": "Offer", "itemOffered": { "@type": "Place", "name": "Palacio del Mar" } },
                    { "@type": "Offer", "itemOffered": { "@type": "Place", "name": "Punta Piedra" } },
                    { "@type": "Offer", "itemOffered": { "@type": "Place", "name": "Real del Mar" } },
                    { "@type": "Offer", "itemOffered": { "@type": "Place", "name": "Baja Mar" } },
                    { "@type": "Offer", "itemOffered": { "@type": "Place", "name": "Plaza del Mar" } },
                    { "@type": "Offer", "itemOffered": { "@type": "Place", "name": "Quintas del Mar" } },
                    { "@type": "Offer", "itemOffered": { "@type": "Place", "name": "San Antonio del Mar" } },
                    { "@type": "Offer", "itemOffered": { "@type": "Place", "name": "Calafia" } },
                    { "@type": "Offer", "itemOffered": { "@type": "Place", "name": "Riviera" } },
                    { "@type": "Offer", "itemOffered": { "@type": "Place", "name": "Oceana" } },
                    { "@type": "Offer", "itemOffered": { "@type": "Place", "name": "Hotel Rosarito" } }
                  ]
                },
                {
                  "@type": "OfferCatalog",
                  "name": "Real Estate Services",
                  "itemListElement": [
                    { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Buy Property" } },
                    { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Sell Property" } },
                    { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Rent Property" } },
                    { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Finance a Home" } },
                    { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "FSBO Platform" } },
                    { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Free Home Value Estimate" } }
                  ]
                }
              ]
            }),
          }}
        />
      </Head>


      <main>
        {/* Hero Section */}
        <Hero />

        {/* Recommended Properties */}
        <section aria-labelledby="recommended-properties">
          <h2 id="recommended-properties" className="text-3xl font-bold mb-4 text-center pt-4">
            Recommended Properties
          </h2>
          <RecommendedSection />
        </section>

      
        {/* How Can We Help You */}
        <section aria-labelledby="how-we-help" className="mt-12">
          <h2 id="how-we-help" className="text-3xl font-bold mb-6 text-center">
            How Can We Help You?
          </h2>
          <p className="text-center text-gray-600 mb-8">
            We offer a full range of real estate services including buying, selling, renting, financing, FSBO options, and free home value estimates.
          </p>
          <InfoCards />
        </section>

        {/* Neighborhoods Section */}
        <section aria-labelledby="neighborhoods" className="mt-12">
          <h2 id="neighborhoods" className="text-3xl font-bold mb-4 text-center">
            Explore Neighborhoods
          </h2>
          <p className="text-center text-gray-600 ">
            Discover the most popular areas in Rosarito, Playas de Tijuana, and Ensenada.
          </p>
          <Neighborhoods />
        </section>

        {/* Contact Form */}
        <section aria-labelledby="contact" className="mt-12">
          <h2 id="contact" className="text-3xl font-bold mb-4 text-center">
            Get in Touch
          </h2>
          <p className="text-center text-gray-600 mb-6">
            Have questions or want to schedule a viewing? Contact us today!
          </p>
          <ContactForm />
        </section>

        {/* Footer */}
        <Footer />
      </main>

    </>
  );
}
