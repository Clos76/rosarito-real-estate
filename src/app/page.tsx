// import RecommendedSection from "@/components/layout/RecommendedSection";
// import Hero from "../components/layout/Hero";
// import InfoCards from "@/components/layout/InfoCards";
// import Neighborhoods from "@/components/layout/Neighborhoods";
// import ContactForm from "@/components/layout/ContactForm";
import Head from "next/head";

export default function Home() {
  return (
     <>
      <Head>
        <title>Rosarito Real Estate - Coming Soon</title>
        <meta name="description" content="Our Rosarito Real Estate site is launching soon. Stay tuned!" />
      </Head>
      <main className="flex items-center justify-center min-h-screen font-[family-name:var(--font-geist-sans)]">
        <h1 className="text-4xl font-semibold">Coming Soon</h1>
      </main>
    </>
  );
}
