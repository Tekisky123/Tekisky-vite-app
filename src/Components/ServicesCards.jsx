import WebDevelopment from "../images/services/web-development_ozvid.png";
import gradient from "../images/services/mobile-app-development-methodologies.jpg";
import gradientui from "../images/services/ui.jpg";
import cloud from "../images/services/Cloud-Solutions.png";
import software from "../images/services/software-development-services-20.jpg";
import consulting from "../images/services/consulting.jpg";

const cards = [
  {
    title: "Web Development",
    description:
      "Building responsive and high-performance websites tailored to your business needs.",
    imageUrl: WebDevelopment,
  },
  {
    title: "Mobile App Development",
    description:
      "Creating user-friendly and feature-rich mobile applications for Android and iOS platforms.",
    imageUrl: gradient,
  },
  {
    title: "UI/UX Design",
    description:
      "Designing intuitive and engaging user interfaces and experiences.",
    imageUrl: gradientui,
  },
  {
    title: "Cloud Solutions",
    description:
      "Providing scalable and secure cloud services to enhance your business operations.",
    imageUrl: cloud,
  },
  {
    title: "Software Development",
    description:
      "Offering comprehensive software development solutions to meet your business needs.",
    imageUrl: software,
  },
  {
    title: "IT Consulting",
    description:
      "Delivering expert IT consulting services to drive your business growth and efficiency.",
    imageUrl: consulting,
  },
];

const ServicesCards = () => {
  return (
    <section className="container mx-auto p-4 ">
      <div className={`w-full ${"mx-auto text-center"} mt-8 mb-8`}>
        <h2 className=" text-3xl font-bold leading-tight text-black dark:text-white sm:text-4xl md:text-[45px] mt-8">
          Our Services
        </h2>
        <p className="text-base leading-relaxed text-body-color md:text-lg"></p>
      </div>
      <main className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, index) => (
          <div
            key={index}
            className="relative overflow-hidden rounded-lg shadow-lg group border"
          >
            <img
              src={card.imageUrl}
              alt={card.title}
              className="w-full h-60 object-contain transform transition-transform duration-700 ease-out group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 transition-all duration-700 ease-out group-hover:bg-opacity-50"></div>
            <div className="absolute inset-0 flex flex-col justify-end p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-out">
              <h2 className="text-white text-xl font-bold mb-2">
                {card.title}
              </h2>
              <p className="text-white">{card.description}</p>
            </div>
          </div>
        ))}
      </main>
    </section>
  );
};

export default ServicesCards;
