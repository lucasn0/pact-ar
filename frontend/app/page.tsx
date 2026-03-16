import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Pricing from "@/components/Pricing";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="overflow-x-hidden">
      <Navbar />
      <Hero />
      <hr className="max-w-5xl mx-auto border-border px-12" />
      <HowItWorks />
      <hr className="max-w-5xl mx-auto border-border px-12" />
      <Pricing />
      <Footer />
    </main>
  );
}
