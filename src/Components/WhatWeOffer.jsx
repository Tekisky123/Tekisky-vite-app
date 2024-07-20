import { FaPenFancy, FaCode, FaTasks, FaCogs, FaSyncAlt, FaHeadset } from "react-icons/fa";

const WhatWeOffer = () => {
  return (
    <section className="we-offer-area text-center bg-gray-100 py-20">
      <div className="container">
        <div className="w-full mx-auto text-center mb-24">
          <h2 className="text-3xl font-bold leading-tight text-black sm:text-4xl md:text-5xl">
            What We Offer
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="item text-center bg-white p-6 rounded-lg shadow-md">
            <FaPenFancy className="text-6xl text-blue-500 mb-4 icon" />
            <h4 className="text-xl font-bold mb-2">Project Creation</h4>
            <p className="text-gray-600">
              We specialize in creating innovative and tailored projects to meet your business needs.
            </p>
          </div>
          <div className="item text-center bg-white p-6 rounded-lg shadow-md">
            <FaCode className="text-6xl text-blue-500 mb-4 icon" />
            <h4 className="text-xl font-bold mb-2">Software Development</h4>
            <p className="text-gray-600">
              From custom software solutions to scalable applications, we excel in software development.
            </p>
          </div>
          <div className="item text-center bg-white p-6 rounded-lg shadow-md">
            <FaTasks className="text-6xl text-blue-500 mb-4 icon" />
            <h4 className="text-xl font-bold mb-2">Project Management</h4>
            <p className="text-gray-600">
              Our expert project managers ensure seamless execution and timely delivery of your projects.
            </p>
          </div>
          <div className="item text-center bg-white p-6 rounded-lg shadow-md">
            <FaCogs className="text-6xl text-blue-500 mb-4 icon" />
            <h4 className="text-xl font-bold mb-2">Project Implementation</h4>
            <p className="text-gray-600">
              Implementing projects with precision and efficiency to achieve your business goals.
            </p>
          </div>
          <div className="item text-center bg-white p-6 rounded-lg shadow-md">
            <FaSyncAlt className="text-6xl text-blue-500 mb-4 icon" />
            <h4 className="text-xl font-bold mb-2">Software Update</h4>
            <p className="text-gray-600">
              Keeping your software updated with the latest features and improvements.
            </p>
          </div>
          <div className="item text-center bg-white p-6 rounded-lg shadow-md">
            <FaHeadset className="text-6xl text-blue-500 mb-4 icon" />
            <h4 className="text-xl font-bold mb-2">24/7 Support</h4>
            <p className="text-gray-600">
              Providing round-the-clock support to ensure smooth operations of your systems.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhatWeOffer;
