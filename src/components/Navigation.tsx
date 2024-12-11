import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth" });
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white text-[#253557] z-50 shadow-lg">
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-between h-24">
          <div className="flex items-center space-x-8">
            <Link to="/" onClick={() => setIsOpen(false)}>
              <img
                src="/lovable-uploads/3d8a4356-31e4-45d6-b3f4-db94cc44c5e5.png"
                alt="Company Logo"
                className="h-12 w-12 md:h-24 md:w-24"
              />
            </Link>
            <div className="hidden xl:flex space-x-4">
              <button
                onClick={() => scrollToSection("services")}
                className="hover:text-[#0BD255] transition-colors"
              >
                Services
              </button>
              <button
                onClick={() => scrollToSection("portfolio")}
                className="hover:text-[#0BD255] transition-colors"
              >
                Portfolio
              </button>
              <button
                onClick={() => scrollToSection("contact")}
                className="hover:text-[#0BD255] transition-colors"
              >
                Contact
              </button>
              <Link
                to="/about"
                className="hover:text-[#0BD255] transition-colors"
              >
                About
              </Link>
              <Link
                to="/overview"
                className="hover:text-[#0BD255] transition-colors"
              >
                Overview
              </Link>
              <Link
                to="/blog"
                className="hover:text-[#0BD255] transition-colors"
              >
                Blog
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <p className="hidden md:block text-sm italic text-[#253557] p-4">
              <strong>Real Ninja Professionals:</strong> Safeguarding your goals
              with expertise and integrity.
            </p>
            <Link to="/contact" className="hidden lg:flex">
              <Button className="bg-[#0BD255] hover:bg-[#0BD255]/90">
                Meet Us
              </Button>
            </Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="xl:hidden"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="xl:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <button
                onClick={() => scrollToSection("services")}
                className="block px-3 py-2 rounded-md text-base font-medium hover:text-[#0BD255] transition-colors w-full text-left"
              >
                Services
              </button>
              <button
                onClick={() => scrollToSection("portfolio")}
                className="block px-3 py-2 rounded-md text-base font-medium hover:text-[#0BD255] transition-colors w-full text-left"
              >
                Portfolio
              </button>
              <button
                onClick={() => scrollToSection("contact")}
                className="block px-3 py-2 rounded-md text-base font-medium hover:text-[#0BD255] transition-colors w-full text-left"
              >
                Contact
              </button>
              <Link
                to="/about"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium hover:text-[#0BD255] transition-colors"
              >
                About
              </Link>
              <Link
                to="/overview"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium hover:text-[#0BD255] transition-colors"
              >
                Overview
              </Link>
              <Link
                to="/blog"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium hover:text-[#0BD255] transition-colors"
              >
                Blog
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};