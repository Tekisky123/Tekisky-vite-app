import "tailwindcss/tailwind.css";
import solution from "../images/slider/solution.svg";
import team from "../images/slider/team.svg";
import customer from "../images/slider/customer.svg";

const sectionsData = [
  {
    title: "Innovative Solutions",
    description:
      "We provide cutting-edge solutions to modernize your business processes. Our innovative approaches ensure that your business stays ahead of the curve. From AI-driven automation to scalable cloud solutions, we cater to diverse industry needs. Whether you require digital transformation, cybersecurity enhancements, or advanced analytics, our solutions are designed to optimize efficiency and drive growth.",
    imgSrc: solution,
  },
  {
    title: "Expert Team",
    description:
      "Our team of experts is dedicated to delivering top-quality services. With years of experience in the industry, we ensure that every project is executed to perfection. We specialize in software development, IT consulting, and project management. Our collaborative approach and deep technical expertise enable us to tackle complex challenges and deliver sustainable solutions.",
    imgSrc: team,
  },
  {
    title: "Customer Satisfaction",
    description:
      "We prioritize customer satisfaction with our tailored solutions. Our dedicated support team ensures that your needs are met promptly and efficiently. We offer 24/7 customer support, training, and ongoing maintenance to ensure smooth operations. Our proactive approach to customer service ensures that we anticipate and address your needs effectively, fostering long-term partnerships.",
    imgSrc: customer,
  },
];

const ITCompanySections = () => {
  return (
   <div id="ITCompanySections">
     <section className="container mx-auto p-4">
      <div className="w-full mx-auto text-center mt-24 mb-24">
        <h2 className="text-3xl font-bold leading-tight text-black sm:text-4xl md:text-[45px] mt-8">
          Offerings
        </h2>
      </div>
      <div className="flex flex-col ">
        {sectionsData.map((section, index) => (
          <div
            key={index}
            className={`flex flex-col md:flex-row ${
              index % 2 !== 0 ? "md:flex-row-reverse" : ""
            } items-center`}
          >
            <div className="w-full md:w-1/2 p-4 ">
              <img
                src={section.imgSrc}
                alt={section.title}
                className="w-full h-auto md:h-96 object-contain rounded-lg shadow-lg border bg-white"
              />
            </div>
            <div className="md:w-1/2 p-4 text-left">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                {section.title}
              </h2>
              <p className="mt-5 text-justify text-base !leading-relaxed text-body-color dark:text-body-color-dark sm:text-lg md:text-xl">{section.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
   </div>
  );
};

export default ITCompanySections;
