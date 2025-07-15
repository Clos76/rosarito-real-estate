import RecommendedSection from "@/components/layout/RecommendedSection";
import Hero from "../components/layout/Hero";
import InfoCards from "@/components/layout/InfoCards";
import Neighborhoods from "@/components/layout/Neighborhoods";

export default function Home() {
  return (
    <div className="font-[family-name:var(--font-geist-sans)]">
      {/* Header should be outside of grid so it's full width */}
      <Hero/>

      <RecommendedSection/>

      <InfoCards/>

      <Neighborhoods/>


    

      {/* Hero should be full width too */}
      

      {/* Main Content */}
      <main className="max-w-screen-xl mx-auto px-4 sm:px-8 py-12">
        <h1 className="text-3xl font-semibold mt-9">Coming Soon</h1>
        {/* More content here */}
      </main>
    </div>
  );
}
