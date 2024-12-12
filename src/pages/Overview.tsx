import { Navigation } from "@/components/Navigation";

const Overview = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 pt-48">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-[#253557] text-center mb-12">Overview</h1>
          <ul className="space-y-6 text-lg text-gray-700">
            <li className="flex items-start">
              <span className="text-[#0BD255] mr-2">•</span>
              Good architecture is possible.
            </li>
            <li className="flex items-start">
              <span className="text-[#0BD255] mr-2">•</span>
              FullStack development as versatile as a Kunai.
            </li>
            <li className="flex items-start">
              <span className="text-[#0BD255] mr-2">•</span>
              Database design as expected.
            </li>
            <li className="flex items-start">
              <span className="text-[#0BD255] mr-2">•</span>
              Bringing value in planning, following up, and prototyping.
            </li>
            <li className="flex items-start">
              <span className="text-[#0BD255] mr-2">•</span>
              Deadlines approaching is not necessarily a bad sense.
            </li>
            <li className="flex items-start">
              <span className="text-[#0BD255] mr-2">•</span>
              Our Kunai goes beyond CORNER cases.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Overview;