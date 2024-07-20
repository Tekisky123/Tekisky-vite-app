import { useState } from "react";

const project = {
  id: 1,
  name: "Tekisky Mart",
  url: "https://tekiskymart.com/",
  overview:
    "This project involves the development of an online shopping platform utilizing the MERN stack.",
  details: {
    summary:
      "The project successfully delivered a comprehensive full-stack web platform for online shopping. It involved developing engaging user interfaces using React.js for the frontend and building robust server-side applications with Node.js and Express.js for the backend. The platform ensures a visually appealing and user-friendly shopping experience while maintaining efficient server-side processing and data management.",
    technologies: {
      frontend: "React.js",
      backend: "Node.js, Express.js",
      database: "MongoDB",
      versionControl: "GitHub",
    },
    features: [
      "Delivery Within 24 Hours",
      "Returns Without Questions",
      "Quality Product At Best Price",
      "Low Price Compare To Your Retail Outlet",
      "Cheaper Than Amazon And Flipkart",
    ],
  },
};

const Projects = () => {
  const [selectedProject, setSelectedProject] = useState(null);

  const openModal = () => {
    setSelectedProject(project);
  };

  const closeModal = () => {
    setSelectedProject(null);
  };

  const handleOverlayClick = (e) => {
    if (e.target.id === "modalOverlay") {
      closeModal();
    }
  };

  return (
    <section className="projects-area w-full py-20 mt-10">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold">Our Product</h2>
          
        </div>
        <div className="flex justify-center">
          <div className="project-card bg-white p-4 rounded-lg shadow-md w-full max-w-6xl">
            <div className="w-full h-64 md:h-96 overflow-hidden rounded-md mb-6 ">
              <iframe
                src={project.url}
                className="w-full  h-full "
                title={project.name}
                style={{ border: "none", transform: "scale(1.0)", transformOrigin: "top left"}}
              ></iframe>
            </div>
            <h4 className="text-2xl font-bold mb-4">{project.name}</h4>
            <p className=" mb-6 underline text-blue-600"><a href="https://tekiskymart.com" target="_blank">Preview Website</a></p>
            <p className="text-gray-600 mb-6">{project.overview}</p>
            <h5 className="text-xl font-bold mb-2">Features</h5>
            <ul className="list-disc pl-5 text-gray-600 mb-6">
              {project.details.features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
            <button
              className="bg-blue-500 text-white px-6 py-3 rounded-md"
              onClick={openModal}
            >
              View Details
            </button>
          </div>
        </div>
      </div>

      {selectedProject && (
        <div
          id="modalOverlay"
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[990]"
          onClick={handleOverlayClick}
        >
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-4xl w-full mx-auto overflow-y-auto max-h-full">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-2xl font-bold">{selectedProject.name}</h4>
              <button
                className="bg-blue-500 text-white px-6 py-3 rounded-md"
                onClick={closeModal}
              >
                Close
              </button>
            </div>

            <h5 className="text-xl font-bold mb-2">Project Overview</h5>
            <p className="text-gray-600 mb-6">{selectedProject.details.summary}</p>
            <h5 className="text-xl font-bold mb-2">Technologies Used</h5>
            <ul className="list-disc pl-5 text-gray-600 mb-6">
              <li>Frontend: {selectedProject.details.technologies.frontend}</li>
              <li>Backend: {selectedProject.details.technologies.backend}</li>
              <li>Database: {selectedProject.details.technologies.database}</li>
              <li>Version Control: {selectedProject.details.technologies.versionControl}</li>
            </ul>
            <h5 className="text-xl font-bold mb-2">Features</h5>
            <ul className="list-disc pl-5 text-gray-600 mb-6">
              {selectedProject.details.features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
};

export default Projects;
