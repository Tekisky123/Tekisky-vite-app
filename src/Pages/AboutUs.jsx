import Breadcrumb from "../Common/Breadcrumb";
import DeliveredProjects from "../Components/DeliveredProjects";
import Verticals from "../Components/Verticals";
import Company from "../images/hero/Company-pana.svg";
import Helping from "../images/hero/Helping a partner-bro.svg";
import Team from "../images/hero/Team work-amico.svg";

const checkIcon = (
  <svg width="16" height="13" viewBox="0 0 16 13" className="fill-current">
    <path d="M5.8535 12.6631C5.65824 12.8584 5.34166 12.8584 5.1464 12.6631L0.678505 8.1952C0.483242 7.99994 0.483242 7.68336 0.678505 7.4881L2.32921 5.83739C2.52467 5.64193 2.84166 5.64216 3.03684 5.83791L5.14622 7.95354C5.34147 8.14936 5.65859 8.14952 5.85403 7.95388L13.3797 0.420561C13.575 0.22513 13.8917 0.225051 14.087 0.420383L15.7381 2.07143C15.9333 2.26669 15.9333 2.58327 15.7381 2.77854L5.8535 12.6631Z" />
  </svg>
);

const AboutUs = () => {
  const List = ({ text }) => (
    <p className="mb-5 flex items-center text-lg font-medium text-body-color">
      <span className="mr-4 flex h-[30px] w-[30px] items-center justify-center rounded-md bg-primary bg-opacity-10 text-primary">
        {checkIcon}
      </span>
      {text}
    </p>
  );

  return (
    <>
      {" "}
      <section id="about" className="container">
        <div className="container">
          <div className="border-b border-body-color/[.15]  dark:border-white/[.15] ">
            <div className="">
              <Breadcrumb pageName="About Us" description="" />
            </div>
            <div className="-mx-4 flex flex-wrap items-center">
              <div className="relative mx-auto  max-w-[700px] ">
                <img
                  src={Company}
                  alt="about-image"
                  width="650"
                  height="80"
                  className="mx-auto max-w-full drop-shadow-three dark:drop-shadow-none lg:mr-0"
                />
              </div>

              <div className="w-full px-4 lg:w-1/2">
                <div className={`w-full ${"mx-auto text-center"}`}>
                  <h2 className="mb-7 text-start text-3xl font-bold leading-tight text-black dark:text-white sm:text-4xl md:text-[45px] mt-8">
                    Who We Are
                  </h2>
                  <p className="text-start mb-10 leading-relaxed text-body-color md:text-lg">
                    Tekisky Private Limited is a dynamic technology company
                    incorporated on September 27, 2021. Based in India, Tekisky
                    is a powerhouse of dedicated developers and creative
                    designers committed to providing elegant business solutions
                    for brands worldwide. Our team thrives on innovation and
                    creativity, leveraging the latest technologies to craft
                    tailored solutions that meet the unique needs of each
                    client.
                  </p>
                </div>

                <div
                  className="mb-3 max-w-[570px] lg:mb-0"
                  data-wow-delay=".15s"
                >
                  <h3 className="mb-6 text-xl font-bold text-black dark:text-white sm:text-2xl lg:text-xl xl:text-2xl">
                    Our Mission
                  </h3>

                  <div className="mx-[-12px] flex flex-wrap">
                    <div className="w-full px-3 ">
                      <p className="text-base font-medium leading-relaxed text-body-color sm:text-lg sm:leading-relaxed">
                        Our mission is to provide the best fully tested products
                        and solutions for our customers And Quality Trained
                        Resources .
                      </p>
                    </div>
                  </div>
                </div>
                <div
                  className="mb-3 max-w-[570px]  mt-10 lg:mb-0"
                  data-wow-delay=".15s"
                >
                  <h3 className="mb-6 text-xl font-bold text-black dark:text-white sm:text-2xl lg:text-xl xl:text-2xl">
                    Our Vision
                  </h3>

                  <div className="mx-[-12px] flex flex-wrap">
                    <div className="w-full px-3 ">
                      <p className="text-base font-medium leading-relaxed text-body-color sm:text-lg sm:leading-relaxed">
                        To be the biggest technology enabler for building the
                        future of our customers .
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full px-4 lg:w-1/2"></div>
            </div>
          </div>
        </div>
      </section>
      <Verticals/>
      <DeliveredProjects/>
      <section className="py-10 md:py-20 lg:py-10 bg-gray-100">
        <div className="container">
          <div className="-mx-4 flex flex-wrap items-center">
            <div className="w-full px-4 lg:w-1/2">
              <div
                className="relative mx-auto mb-12 aspect-[25/24] max-w-[600px] text-center lg:m-0"
                data-wow-delay=".15s"
              >
                <img
                  src={Helping}
                  alt=""
                  className="drop-shadow-three dark:drop-shadow-none"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
            </div>
            <div className="w-full px-4 lg:w-1/2">
              <div className={`w-full ${"mx-auto text-center"} mb-10`}>
                <h2 className=" text-start text-3xl font-bold leading-tight text-black dark:text-white sm:text-4xl md:text-[45px] mt-8">
                  Our Values
                </h2>
                <p className="text-start mb-10 leading-relaxed text-body-color md:text-lg"></p>
              </div>
              <div className="max-w-[470px]">
                <div className="mb-9">
                  <h3 className="mb-4 text-xl font-bold text-black dark:text-white sm:text-2xl lg:text-xl xl:text-2xl">
                    Trust:
                  </h3>
                  <p className="text-base font-medium leading-relaxed text-body-color sm:text-lg sm:leading-relaxed">
                    We prioritize building and maintaining trust with our
                    clients, partners, and team members
                  </p>
                </div>
                <div className="mb-9">
                  <h3 className="mb-4 text-xl font-bold text-black dark:text-white sm:text-2xl lg:text-xl xl:text-2xl">
                    Integrity:
                  </h3>
                  <p className="text-base font-medium leading-relaxed text-body-color sm:text-lg sm:leading-relaxed">
                    We honor our commitments and take responsibility for our
                    actions, ensuring accountability at all levels.
                  </p>
                </div>
                <div className="mb-9">
                  <h3 className="mb-4 text-xl font-bold text-black dark:text-white sm:text-2xl lg:text-xl xl:text-2xl">
                    Quality:
                  </h3>
                  <p className="text-base font-medium leading-relaxed text-body-color sm:text-lg sm:leading-relaxed">
                    We are committed to delivering excellence in everything we
                    do, maintaining the highest standards of quality.
                  </p>
                </div>
                <div className="mb-9">
                  <h3 className="mb-4 text-xl font-bold text-black dark:text-white sm:text-2xl lg:text-xl xl:text-2xl">
                    Client Satisfaction:
                  </h3>
                  <p className="text-base font-medium leading-relaxed text-body-color sm:text-lg sm:leading-relaxed">
                    We listen attentively to client feedback and proactively
                    address any concerns to ensure a positive experience.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="container">
          <div className="-mx-4 flex flex-wrap items-center">
            <div className="w-full px-4 lg:w-1/2">
              <div className="max-w-[470px]">
                <div className="mb-9">
                  <h3 className="mb-4 text-xl font-bold text-black dark:text-white sm:text-2xl lg:text-xl xl:text-2xl">
                    Value Delivery:
                  </h3>
                  <p className="text-base font-medium leading-relaxed text-body-color sm:text-lg sm:leading-relaxed">
                    We focus on delivering solutions that provide the best value
                    for our clients, balancing quality and affordability.
                  </p>
                </div>
                <div className="mb-9">
                  <h3 className="mb-4 text-xl font-bold text-black dark:text-white sm:text-2xl lg:text-xl xl:text-2xl">
                    Communication:
                  </h3>
                  <p className="text-base font-medium leading-relaxed text-body-color sm:text-lg sm:leading-relaxed">
                    We emphasize clear and effective communication both
                    internally and with our clients, ensuring alignment and
                    understanding.
                  </p>
                </div>
                <div className="mb-9">
                  <h3 className="mb-4 text-xl font-bold text-black dark:text-white sm:text-2xl lg:text-xl xl:text-2xl">
                    Collaboration:
                  </h3>
                  <p className="text-base font-medium leading-relaxed text-body-color sm:text-lg sm:leading-relaxed">
                    We value collaboration as a key driver of success, working
                    closely with clients, partners, and team members to achieve
                    shared goals.
                  </p>
                </div>
                <div className="mb-1">
                  <h3 className="mb-4 text-xl font-bold text-black dark:text-white sm:text-2xl lg:text-xl xl:text-2xl">
                    Teamwork:
                  </h3>
                  <p className="text-base font-medium leading-relaxed text-body-color sm:text-lg sm:leading-relaxed">
                    We foster a supportive and inclusive work environment where
                    every team member&apos;s contribution is valued and
                    respected.
                  </p>
                </div>
              </div>
            </div>
            <div className="w-full px-4 lg:w-1/2">
              <div
                className="relative mx-auto mb-12 aspect-[25/24] max-w-[700px] text-center lg:m-0"
                data-wow-delay=".15s"
              >
                <img
                  src={Team}
                  alt="about"
                  className="drop-shadow-three dark:drop-shadow-none"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
            </div>
          </div>
        </div>

      <div id="story">
      <div className="container w-full overflow-hidden px-4   md:py-20 lg:w-8/12 lg:py-28">
          <h3 className="font-xl mb-10 font-bold leading-tight text-black dark:text-white sm:text-2xl sm:leading-tight lg:text-xl lg:leading-tight xl:text-2xl xl:leading-tight">
            Our Story
          </h3>
          <p className="mb-8 text-base font-medium leading-relaxed text-body-color sm:text-lg sm:leading-relaxed lg:text-base lg:leading-relaxed xl:text-lg xl:leading-relaxed">
            Founded in September 2021, Tekisky Private Limited emerged as a
            beacon of innovation in the technology industry. The journey began
            with a vision to revolutionize the digital landscape by providing
            elegant and affordable business solutions for brands worldwide.
          </p>

          <h3 className="font-xl mb-10 font-bold leading-tight text-black dark:text-white sm:text-2xl sm:leading-tight lg:text-xl lg:leading-tight xl:text-2xl xl:leading-tight">
            Why Tekisky Pvt Ltd?
          </h3>

          <ul className="mb-10 list-inside list-disc text-body-color">
            <li className="mb-6 text-base font-medium text-body-color sm:text-lg lg:text-base xl:text-lg">
              Expertise: Tekisky Pvt Ltd brings a wealth of expertise in a wide
              range of digital solutions including web development, mobile app
              development, UI/UX design, logo design, data mining, customized
              e-commerce solutions, and startup tech partnerships.
            </li>
            <li className="mb-6 text-base font-medium text-body-color sm:text-lg lg:text-base xl:text-lg">
              Quality Assurance: We prioritize the highest standards of quality
              assurance, ensuring that every solution we deliver is thoroughly
              tested and meets our stringent quality benchmarks.
            </li>
            <li className="mb-6 text-base font-medium text-body-color sm:text-lg lg:text-base xl:text-lg">
              Client-Centric Approach: At Tekisky Pvt Ltd, client satisfaction
              is paramount. We work closely with our clients to understand their
              unique needs and tailor solutions that exceed their expectations.
            </li>
            <li className="mb-6 text-base font-medium text-body-color sm:text-lg lg:text-base xl:text-lg">
              Innovation: We are committed to innovation and staying at the
              forefront of technological advancements. Our team leverages the
              latest tools and technologies to deliver cutting-edge solutions
              that drive business growth.
            </li>
            <li className="mb-6 text-base font-medium text-body-color sm:text-lg lg:text-base xl:text-lg">
              Transparency: Transparency is ingrained in our culture. We believe
              in open and honest communication with our clients, providing them
              with clear insights into our processes and progress.
            </li>
            <li className="mb-6 text-base font-medium text-body-color sm:text-lg lg:text-base xl:text-lg">
              Affordability: We understand the importance of cost-effectiveness.
              Our solutions are designed to provide the best value for our
              clients, without compromising on quality.
            </li>
            <li className="mb-6 text-base font-medium text-body-color sm:text-lg lg:text-base xl:text-lg">
              Global Reach: With a network of international partners, Tekisky
              Pvt Ltd has a global reach. We collaborate with distinguished
              partners to deliver tailored solutions to clients worldwide.
            </li>
            <li className="mb-6 text-base font-medium text-body-color sm:text-lg lg:text-base xl:text-lg">
              Customer Support: Our commitment to customer support extends
              beyond project delivery. We provide ongoing support and
              maintenance services to ensure our clients continued success.
            </li>
          </ul>
          <div className="relative z-10 mb-10 overflow-hidden rounded-md bg-primary bg-opacity-10 p-8 md:p-9 lg:p-8 xl:p-9">
            <p className="text-center text-base font-medium italic text-body-color">
              &quot;Empowering Businesses Worldwide with Innovative Solutions:
              Tekisky Pvt Ltd - Where Tomorrow&apos;s Technology Meets
              Today&apos;s Needs.&quot;
            </p>
          </div>
        </div>
      </div>
      </section>
    </>
  );
};

export default AboutUs;
