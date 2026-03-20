import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Features } from "@/components/landing/Features";
import { DemoPreview } from "@/components/landing/DemoPreview";
import { TechBadges } from "@/components/landing/TechBadges";
import { AboutContact } from "@/components/landing/AboutContact";

export default function HomePage(): React.ReactNode {
  return (
    <main className="relative">
      <Hero />
      <HowItWorks />
      <Features />
      <DemoPreview />
      <TechBadges />
      <AboutContact />
    </main>
  );
}
