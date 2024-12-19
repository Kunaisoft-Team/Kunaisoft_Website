import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { Services } from "@/components/Services";
import { Portfolio } from "@/components/Portfolio";
import { Contact } from "@/components/Contact";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { PersonalizedContent } from "@/components/PersonalizedContent";

const Index = () => {
  return (
    <main className="min-h-screen">
      <Navigation />
      <Hero />
      <PersonalizedContent />
      <Services />
      <Portfolio />
      <Contact />
      <WhatsAppButton />
    </main>
  );
};

export default Index;