import softcadia from "../images/projects/softcadia.png";
import affiliatemarketing from "../images/projects/affiliatemarketing.avif";
import crecent from "../images/projects/crecent.png";
import asmak from "../images/projects/asmak.png";
import mmh from "../images/projects/mmh.png";
import mart from "../images/projects/mart.png";
import shama from "../images/projects/shama.webp";
import selectskillset from "../images/projects/selectskillset.png"

const DeliveredProjects = () => {
  const projects = [
    {
      title: "Softcadia",
      description: "Consultancy job portal",
      imageUrl: softcadia,
      link: "https://softcadia.tekisky.com/",
    },
    {
      title: "Affiliate Marketing",
      description: "Code generation software",
      imageUrl: affiliatemarketing,
      link: "",
    },
    {
      title: "Crescent Foundation",
      description: "Blood bank website",
      imageUrl: crecent,
      link: "http://www.thecrescentfoundation.in/",
    },
    {
      title: "Asmak Muscat Int'l.",
      description: "Oman-Based Seafood Industry Website",
      imageUrl: asmak,
      link: "https://asmakmct.com/",
    },
    {
      title: "Shama NGO",
      description: "Patient registration software",
      imageUrl: shama,
      link: "",
    },
    {
      title: "MMH NGO",
      description: "Muslim Medical Help",
      imageUrl: mmh,
      link: "https://mmh.tekisky.com/",
    },
    {
      title: "Tekisky Mart",
      description: "E-commerce platform",
      imageUrl: mart,
      link: "https://tekiskymart.com/",
    },
    {
      title: "SelectSkillSet",
      description: " Job Portal Website",
      imageUrl: selectskillset,
      link: "https://select-skill-set-testing.vercel.app/",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center p-8" id="delivered">
      <h1 className="text-4xl font-bold text-center mb-12 mt-20">
        Projects Delivered
      </h1>
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {projects.map((project, index) => (
          <a
            key={index}
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden cursor-pointer hover:bg-gray-100 transition-transform duration-300 ease-in-out transform hover:scale-105"
          >
            <div className="relative w-full h-48">
              <img
                src={project.imageUrl}
                alt={project.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
              <p className="text-sm text-gray-600">{project.description}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default DeliveredProjects;
