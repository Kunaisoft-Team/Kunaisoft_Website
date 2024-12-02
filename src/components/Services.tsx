import { Code, Layout, Database, MessageSquare } from "lucide-react";
import { Card } from "@/components/ui/card";

const services = [
  {
    icon: <Code className="h-12 w-12 mb-4 text-primary" />,
    title: "Full-Stack Development",
    description: "End-to-end solutions with modern technologies and scalable architecture.",
  },
  {
    icon: <Layout className="h-12 w-12 mb-4 text-primary" />,
    title: "UX/UI Design",
    description: "User-centered design that delivers intuitive and engaging experiences.",
  },
  {
    icon: <Database className="h-12 w-12 mb-4 text-primary" />,
    title: "Low-Code Solutions",
    description: "Rapid development with powerful low-code platforms for faster deployment.",
  },
  {
    icon: <MessageSquare className="h-12 w-12 mb-4 text-primary" />,
    title: "24/7 Support",
    description: "Dedicated support team to ensure your project's continuous success.",
  },
];

export const Services = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Services</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Comprehensive digital solutions to help your business thrive in the modern world.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <Card 
              key={index}
              className="p-6 text-center hover:shadow-lg transition-shadow duration-300 animate-fade-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex justify-center">{service.icon}</div>
              <h3 className="text-xl font-semibold mb-3">{service.title}</h3>
              <p className="text-gray-600">{service.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};