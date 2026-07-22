import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import InsightFlow from "@/components/InsightFlow";
import DashboardPreview from "@/components/DashboardPreview";
import SignatureInteraction from "@/components/SignatureInteraction";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="relative bg-background overflow-hidden">
      <Navbar />
      <Hero />
      <InsightFlow />
      <DashboardPreview />
      <SignatureInteraction />
      <Footer />
    </main>
  );
}