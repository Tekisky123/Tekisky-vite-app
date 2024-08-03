import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate from react-router-dom for navigation

const Verticals = () => {
  const navigate = useNavigate();

  const handleCardClick = (path) => {
    navigate(path); // Navigate to the specified path
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-8">
      <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-6">Tekisky Pvt Ltd</h1>
        <h2 className="text-2xl font-semibold text-center mb-8">Verticals</h2>
        <p className="text-center text-lg mb-6">
          Explore our key verticals where we excel in delivering top-notch services and solutions to cater to various needs.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <div
            className="bg-blue-300 text-black p-6 rounded-lg shadow-lg cursor-pointer hover:bg-blue-400 transition-transform duration-300 ease-in-out transform hover:scale-105"
            onClick={() => handleCardClick('/courses')}
          >
            <h3 className="text-xl font-semibold mb-2">Training Center</h3>
            <p className="text-sm">We offer a range of professional training programs to enhance your skills.</p>
          </div>
          <div
            className="bg-green-300 text-black p-6 rounded-lg shadow-lg cursor-pointer hover:bg-green-400 transition-transform duration-300 ease-in-out transform hover:scale-105"
            onClick={() => handleCardClick('/services')}
          >
            <h3 className="text-xl font-semibold mb-2">Software Development Center</h3>
            <p className="text-sm">Our team delivers cutting-edge software solutions tailored to your needs.</p>
          </div>
          <div
            className="bg-purple-300 text-black p-6 rounded-lg shadow-lg cursor-pointer hover:bg-purple-400 transition-transform duration-300 ease-in-out transform hover:scale-105"
            onClick={() => handleCardClick('/consultancy')}
          >
            <h3 className="text-xl font-semibold mb-2">Consultancy</h3>
            <p className="text-sm">We provide expert consultancy services to help you navigate complex challenges.</p>
          </div>
        </div>
        <div className="mt-12">
          <h2 className="text-2xl font-semibold text-start mb-4">More About Our Vertical Services</h2>
          <div className="text-start">
            <p className="text-lg mb-4">
              Our Training Center is designed to provide a comprehensive learning experience with hands-on training and industry-relevant skills. Whether you are looking to upgrade your current skills or start a new career path, our training programs are tailored to meet your goals.
            </p>
            <p className="text-lg mb-4">
              At the Software Development Center, we build customized software solutions that drive innovation and efficiency. From concept to deployment, our team works closely with you to ensure the highest quality and functionality in our software products.
            </p>
            <p className="text-lg">
              Our Consultancy services offer expert guidance to help businesses and individuals navigate through various challenges. With a focus on practical solutions and strategic planning, we aim to provide actionable insights and support to achieve your objectives.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Verticals;
