import { Card } from "@/components/ui/card";

const projects = [
  {
    title: "E-Commerce Platform",
    category: "Full-Stack Development",
    image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d",
    stats: {
      improvement: "+45%",
      metric: "Sales Conversion"
    }
  },
  {
    title: "Financial Dashboard",
    category: "UX/UI Design",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
    stats: {
      improvement: "+60%",
      metric: "User Engagement"
    }
  },
  {
    title: "Healthcare App",
    category: "Low-Code Development",
    image: "https://images.unsplash.com/photo-1483058712412-4245e9b90334",
    stats: {
      improvement: "+30%",
      metric: "Development Speed"
    }
  },
];

export const Portfolio = () => {
  return (
    <section id="portfolio" className="py-20 bg-gradient-to-b from-transparent to-[#253557]/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#253557]">Our Work</h2>
          <p className="text-lg text-[#253557]/70 max-w-2xl mx-auto">
            Explore our latest projects and see how we've helped businesses grow.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <Card 
              key={index}
              className="overflow-hidden group animate-fade-up hover:shadow-xl transition-all duration-300 border-[#253557]/10 hover:border-[#0BD255] hover:shadow-[#0BD255]/20"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="relative overflow-hidden">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#253557]/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="text-white text-center p-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
                    <p className="text-sm mb-4">{project.category}</p>
                    <div className="bg-[#0BD255]/20 backdrop-blur-sm rounded-lg p-3">
                      <p className="text-2xl font-bold text-[#0BD255]">{project.stats.improvement}</p>
                      <p className="text-sm text-white/80">{project.stats.metric}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};