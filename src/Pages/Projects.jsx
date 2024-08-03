
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
      database: "MongoDB, AWS",
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
  return (
    <section className="projects-area w-full py-20" id="our-products">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12  mt-10">
          <h2 className="mb-5 text-3xl font-bold leading-tight text-black dark:text-white sm:text-4xl sm:leading-tight md:text-5xl md:leading-tight">Our Product</h2>
        </div>
        <div className="flex justify-center">
          <div className="project-card bg-white p-4 rounded-lg shadow-md w-full max-w-6xl">
            <h4 className="mb-5 text-3xl font-bold leading-tight text-black dark:text-white sm:text-4xl sm:leading-tight md:text-5xl md:leading-tight">{project.name}</h4>
           
            <p className="mt-5 text-justify text-base !leading-relaxed text-body-color dark:text-body-color-dark sm:text-lg md:text-xl">{project.overview}</p>
            <h5 className="text-xl font-bold mb-2 mt-5">Project Overview</h5>
            <p className="mt-5 text-justify text-base !leading-relaxed text-body-color dark:text-body-color-dark sm:text-lg md:text-xl">{project.details.summary}</p>
            <h5 className="text-xl font-bold mb-2 mt-5">Technologies Used</h5>
            <ul className="list-disc pl-5 mt-5 text-justify text-base !leading-relaxed text-body-color dark:text-body-color-dark sm:text-lg md:text-xl">
              <li>Frontend: {project.details.technologies.frontend}</li>
              <li>Backend: {project.details.technologies.backend}</li>
              <li>Database: {project.details.technologies.database}</li>
              <li>Version Control: {project.details.technologies.versionControl}</li>
            </ul>
            <h5 className="text-xl font-bold mb-2 mt-5">Features</h5>
            <ul className="list-disc pl-5 mt-5 text-justify text-base !leading-relaxed text-body-color dark:text-body-color-dark sm:text-lg md:text-xl mb-6">
              {project.details.features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
            <p className="mb-6 underline text-blue-600">
              <a href={project.url} target="_blank" rel="noopener noreferrer">Preview Website</a>
            </p>
            <div className="w-full h-64 md:h-96 overflow-hidden rounded-md mb-6">
              <iframe
                src={project.url}
                className="w-full h-full"
                title={project.name}
                style={{ border: "none", transform: "scale(1.0)", transformOrigin: "top left" }}
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Projects;
