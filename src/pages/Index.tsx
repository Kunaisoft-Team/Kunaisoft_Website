import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { Services } from "@/components/Services";
import { Portfolio } from "@/components/Portfolio";
import { Contact } from "@/components/Contact";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { RSSFeedTester } from "@/components/RSSFeedTester";

const Index = () => {
  return (
    <main className="min-h-screen">
      <Navigation />
      <Hero />
      <Services />
      <Portfolio />
      <Contact />
      <WhatsAppButton />
      <RSSFeedTester />
    </main>
  );
};

export default Index;