import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const Hero = () => {
  return (
    <section className="min-h-[80vh] flex items-center justify-center bg-secondary text-white relative overflow-hidden">
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-up">
            We Build Digital Products That Drive Growth
          </h1>
          <p className="text-lg md:text-xl mb-8 text-gray-300 animate-fade-up" style={{ animationDelay: "0.2s" }}>
            Full-stack development, UX/UI expertise, and low-code solutions to transform your ideas into reality.
          </p>
          <Button 
            className="bg-primary hover:bg-primary/90 text-white px-8 py-6 rounded-full text-lg animate-fade-up"
            style={{ animationDelay: "0.4s" }}
          >
            Start Your Project
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-secondary via-secondary/95 to-secondary/90">
        <img 
          src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b"
          alt="Technology Background"
          className="w-full h-full object-cover opacity-20 mix-blend-overlay"
        />
      </div>
    </section>
  );
};