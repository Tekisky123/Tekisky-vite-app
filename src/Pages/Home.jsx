import img1 from "../images/hero/Coding workshop-amico.svg";
import { Link } from "react-router-dom";
// import Slider from "../Components/Slider";
import Section2 from "../Components/Section2";
import Contact from "../Components/Contact";
import ServicesCards from "../Components/ServicesCards";
import AnimatedSlider from "../Components/ITCompanySections";
// import WhatWeOffer from "../Components/WhatWeOffer";

const Home = () => {
  return (
    <>
      <section
        id="home"
        className="hero-section relative z-10 overflow-hidden bg-white  pt-[150px] dark:bg-gray-dark md:pb-[20px] md:pt-[150px]  xl:pt-[180px]  2xl:pt-[210px]"
      >
        <div className="container main-home-bg">
          <div className="-mx-4 flex flex-wrap">
            <div className="order-2 w-full px-4 md:order-1 md:w-1/2">
              <div className="mx-auto mt-[60px] max-w-[800px] text-left  md:text-start">
                <h1 className="mb-5 text-3xl font-bold leading-tight text-black dark:text-white sm:text-4xl sm:leading-tight md:text-5xl md:leading-tight">
                  Tekisky Private Limited
                </h1>
                <p className="mt-5 text-justify text-base !leading-relaxed text-body-color dark:text-body-color-dark sm:text-lg md:text-xl">
                  Elevate your business with Tekisky Pvt Ltd&apos;s bespoke
                  software solutions. Experience the transformative power of our
                  innovative technology and dedicated support. Partner with us
                  to unlock new heights of success and thrive in the dynamic
                  digital landscape.
                </p>
                <p className="mb-10 mt-5 text-justify text-base !leading-relaxed text-body-color dark:text-body-color-dark sm:text-lg md:text-xl">
                  Explore our range of services designed to meet your specific
                  needs, including custom software development, web and mobile
                  app solutions, cloud services, and expert IT consulting.
                </p>

                <div className="flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0 md:items-start">
                  <Link
                    to="/contact"
                    className=" rounded-lg bg-primary px-8 py-4 text-base font-semibold text-white duration-300 ease-in-out hover:bg-primary/80"
                  >
                    Contact Us
                  </Link>
                </div>
              </div>
            </div>
            <div className="order-1 mb-0 mt-5 flex w-full justify-center px-4 md:order-2 md:w-1/2 md:justify-end">
              <div className="md:block">
                <div className="flex justify-end">
                  <img
                    src={img1}
                    alt=""
                    width={600}
                    height={500}
                    className="hero-section-img"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* <Slider /> */}
      <ServicesCards />
      <AnimatedSlider />
      {/* <WhatWeOffer/> */}
      <Section2 />

      <Contact />
    </>
  );
};

export default Home;
