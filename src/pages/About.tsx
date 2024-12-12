import { Navigation } from "@/components/Navigation";

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 pt-48">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-[#253557] mb-8">About Us</h1>
          <p className="text-xl leading-relaxed text-gray-700">
            Real Organization of:
            <br />
            Versatile specialists, but most important we are guys willing to support, protect, respect, appreciate, commit
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;