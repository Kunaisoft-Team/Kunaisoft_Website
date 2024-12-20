import { Code, Layout, Database, MessageSquare } from "lucide-react";
import { Card } from "@/components/ui/card";

const services = [
  {
    icon: <Code className="h-12 w-12 mb-4 text-secondary" />,
    title: "Full-Stack Development",
    description: "End-to-end solutions with modern technologies and scalable architecture.",
  },
  {
    icon: <Layout className="h-12 w-12 mb-4 text-secondary" />,
    title: "UX/UI Design",
    description: "User-centered design that delivers intuitive and engaging experiences.",
  },
  {
    icon: <Database className="h-12 w-12 mb-4 text-secondary" />,
    title: "Low-Code Solutions",
    description: "Rapid development with powerful low-code platforms for faster deployment.",
  },
  {
    icon: <MessageSquare className="h-12 w-12 mb-4 text-secondary" />,
    title: "24/7 Support",
    description: "Dedicated support team to ensure your project's continuous success.",
  },
];

export const Services = () => {
  return (
    <section id="services" className="py-20 bg-secondary/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-secondary">Our Services</h2>
          <p className="text-lg text-secondary/70 max-w-2xl mx-auto">
            Comprehensive digital solutions to help your business thrive in the modern world.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <Card 
              key={index}
              className="p-6 text-center hover:shadow-lg transition-shadow duration-300 animate-fade-up bg-white border-secondary/10 hover:border-secondary/30"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex justify-center">{service.icon}</div>
              <h3 className="text-xl font-semibold mb-3 text-secondary">{service.title}</h3>
              <p className="text-secondary/70">{service.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};