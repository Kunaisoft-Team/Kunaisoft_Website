import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const Navigation = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-[#253557] text-white z-50 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/">
              <img src="/lovable-uploads/3d8a4356-31e4-45d6-b3f4-db94cc44c5e5.png" alt="Company Logo" className="h-12 w-12" />
            </Link>
            <p className="text-sm italic">
              Real Ninja Professionals: Safeguarding your goals with expertise and integrity.
            </p>
            <div className="hidden md:flex space-x-4">
              <button onClick={() => scrollToSection('services')} className="hover:text-[#0BD255] transition-colors">
                Services
              </button>
              <button onClick={() => scrollToSection('portfolio')} className="hover:text-[#0BD255] transition-colors">
                Portfolio
              </button>
              <button onClick={() => scrollToSection('contact')} className="hover:text-[#0BD255] transition-colors">
                Contact
              </button>
              <Link to="/about" className="hover:text-[#0BD255] transition-colors">
                About
              </Link>
              <Link to="/overview" className="hover:text-[#0BD255] transition-colors">
                Overview
              </Link>
            </div>
          </div>
          <Link to="/contact">
            <Button className="bg-[#0BD255] hover:bg-[#0BD255]/90">
              Meet Us
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};