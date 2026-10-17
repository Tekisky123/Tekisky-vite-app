import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import baseURL from "../Common/Api";
import {
  FaSearch,
  FaFilter,
  FaMapMarkerAlt,
  FaBriefcase,
  FaClock,
  FaCheckCircle,
  FaFileUpload,
  FaTimes,
  FaArrowRight,
  FaShieldAlt,
  FaEnvelope,
  FaPhoneAlt,
  FaDatabase,
  FaCloud,
  FaCode,
  FaChartBar,
  FaUserTie,
  FaGraduationCap,
  FaSpinner,
  FaBuilding,
} from "react-icons/fa";
import JobDetailsModal from "../Components/Recruitment/JobDetailsModal";
import PrivacyNoticeModal from "../Components/Recruitment/PrivacyNoticeModal";
import ApplicationSuccessModal from "../Components/Recruitment/ApplicationSuccessModal";
import OriginalFresherForm from "../Components/Recruitment/OriginalFresherForm";

const ConsultancyForm = () => {
  // Ensure baseURL is cleanly formatted
  const API_BASE = baseURL.endsWith("/") ? baseURL : `${baseURL}/`;

  // State: Job vacancies & filtering
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedExperience, setSelectedExperience] = useState("All");
  const [selectedWorkMode, setSelectedWorkMode] = useState("All");

  // State: Modals & Selected Job for Application
  const [activeJobDetails, setActiveJobDetails] = useState(null);
  const [applyingJob, setApplyingJob] = useState(null);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);

  // State: Candidate Category Path ("Experienced" vs "Fresher")
  const [candidateCategory, setCandidateCategory] = useState("Experienced");

  // State: Form Inputs (Standard React controlled inputs for fluid typing & editing)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobileNumber: "",
    employeeNumber: "",
    // Experienced specific
    primarySkill: "",
    totalExperience: "",
    relevantExperience: "",
    currentLocation: "",
    preferredLocation: "",
    preferredWorkMode: "Hybrid",
    noticePeriod: "30 Days",
    linkedIn: "",
    currentCTC: "",
    expectedCTC: "",
    // Fresher specific
    highestQualification: "B.E / B.Tech",
    graduationYear: "2025",
    skills: "",
    internshipDetails: "",
    // Shared
    privacyConsent: true,
  });

  const [resumeFile, setResumeFile] = useState(null);
  const [resumeError, setResumeError] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // References for smooth scrolling
  const jobsSectionRef = useRef(null);
  const applySectionRef = useRef(null);
  const fileInputRef = useRef(null);

  // SEO & Schema Initialization
  useEffect(() => {
    // 1. Title tag
    const previousTitle = document.title;
    document.title = "IT Recruitment Consultancy & Job Opportunities | Tekisky";

    // 2. Meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    const prevDescContent = metaDescription ? metaDescription.getAttribute("content") : null;
    if (!metaDescription) {
      metaDescription = document.createElement("meta");
      metaDescription.name = "description";
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute(
      "content",
      "Explore IT job opportunities with Tekisky Pvt. Ltd. Submit your resume for SAP, Oracle, software development, cloud, integration and data analytics roles."
    );

    // 3. Open Graph tags
    const ogTitle = document.createElement("meta");
    ogTitle.setAttribute("property", "og:title");
    ogTitle.content = "IT Recruitment Consultancy & Career Opportunities | Tekisky";
    document.head.appendChild(ogTitle);

    return () => {
      document.title = previousTitle;
      if (prevDescContent && metaDescription) {
        metaDescription.setAttribute("content", prevDescContent);
      }
      if (ogTitle.parentNode) {
        ogTitle.parentNode.removeChild(ogTitle);
      }
    };
  }, []);

  // Fetch active job listings
  const fetchJobs = async () => {
    try {
      setLoadingJobs(true);
      const res = await axios.get(`${API_BASE}consultancy/jobs`);
      if (Array.isArray(res.data)) {
        setJobs(res.data);
      }
    } catch (err) {
      console.error("Error loading job vacancies:", err);
    } finally {
      setLoadingJobs(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // Inject dynamic JSON-LD JobPosting schema for active vacancies
  useEffect(() => {
    if (!jobs || jobs.length === 0) return;

    const schemaId = "tekisky-jobs-ld-json";
    let scriptTag = document.getElementById(schemaId);
    if (!scriptTag) {
      scriptTag = document.createElement("script");
      scriptTag.id = schemaId;
      scriptTag.type = "application/ld+json";
      document.head.appendChild(scriptTag);
    }

    const structuredData = {
      "@context": "https://schema.org",
      "@graph": jobs.map((j) => ({
        "@type": "JobPosting",
        title: j.title,
        description: j.description,
        datePosted: j.postedDate || new Date().toISOString(),
        employmentType:
          j.employmentType === "Full-time" ? "FULL_TIME" : "CONTRACTOR",
        hiringOrganization: {
          "@type": "Organization",
          name: "Tekisky Pvt Ltd",
          sameAs: "https://tekisky.com",
          logo: "https://tekisky.com/images/logo/tekisky-logo.png",
        },
        jobLocation: {
          "@type": "Place",
          address: {
            "@type": "PostalAddress",
            addressLocality: j.location || "Pune",
            addressRegion: "Maharashtra",
            addressCountry: "IN",
          },
        },
      })),
    };

    scriptTag.textContent = JSON.stringify(structuredData);

    return () => {
      const tag = document.getElementById(schemaId);
      if (tag && tag.parentNode) {
        tag.parentNode.removeChild(tag);
      }
    };
  }, [jobs]);

  // Handle skill category click (explore opportunities)
  const handleCategoryCardClick = (catName) => {
    setSelectedCategory(catName);
    if (jobsSectionRef.current) {
      jobsSectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Filter jobs based on search query, category, experience, workMode
  const filteredJobs = jobs.filter((job) => {
    // Category filter
    if (selectedCategory !== "All" && job.category !== selectedCategory) {
      return false;
    }
    // Work mode filter
    if (selectedWorkMode !== "All" && job.workMode !== selectedWorkMode) {
      return false;
    }
    // Experience filter
    if (selectedExperience !== "All") {
      if (selectedExperience === "0-2" && !job.experience.includes("0–1") && !job.experience.includes("0-2") && !job.experience.includes("1")) {
        return false;
      }
      if (selectedExperience === "3-5" && !job.experience.includes("3") && !job.experience.includes("4")) {
        return false;
      }
      if (selectedExperience === "5+" && !job.experience.includes("5") && !job.experience.includes("6") && !job.experience.includes("10")) {
        return false;
      }
    }
    // Search query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      const matchTitle = job.title?.toLowerCase().includes(query);
      const matchSkill = job.primarySkill?.toLowerCase().includes(query);
      const matchTags = job.skills?.some((s) => s.toLowerCase().includes(query));
      const matchLoc = job.location?.toLowerCase().includes(query);
      return matchTitle || matchSkill || matchTags || matchLoc;
    }
    return true;
  });

  // Handle Apply Now click from a job card
  const handleApplyJob = (job) => {
    setApplyingJob(job);
    // If the job experience is 0-1 or fresher, switch candidate category
    if (job.experience?.includes("0–1") || job.experience?.includes("0-1")) {
      setCandidateCategory("Fresher");
      setFormData((prev) => ({
        ...prev,
        skills: job.primarySkill || prev.skills,
      }));
    } else {
      setCandidateCategory("Experienced");
      setFormData((prev) => ({
        ...prev,
        primarySkill: job.primarySkill || job.title,
      }));
    }

    // Smooth scroll down to registration form
    if (applySectionRef.current) {
      applySectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Clear specific job and apply generally
  const handleClearSelectedJob = () => {
    setApplyingJob(null);
  };

  // Scroll to open jobs section
  const scrollToJobs = () => {
    if (jobsSectionRef.current) {
      jobsSectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Scroll to candidate form section
  const scrollToApply = (category = "Experienced") => {
    setCandidateCategory(category);
    if (applySectionRef.current) {
      applySectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Handle standard input typing (no lag, no event prevention)
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear field error on typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  // Handle resume file selection with rigorous validation
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    validateAndSetFile(file);
  };

  const validateAndSetFile = (file) => {
    setResumeError("");
    if (!file) {
      setResumeFile(null);
      return;
    }

    // Supported formats: PDF, DOC, DOCX
    const validExtensions = [".pdf", ".doc", ".docx"];
    const fileExt = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();

    if (!validExtensions.includes(fileExt)) {
      setResumeError("Please upload a PDF, DOC, or DOCX document.");
      setResumeFile(null);
      return;
    }

    // 5MB limit
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setResumeError("File size exceeds 5MB limit. Please upload a smaller file.");
      setResumeFile(null);
      return;
    }

    setResumeFile(file);
  };

  // Form Validation
  const validateForm = () => {
    const errors = {};

    if (!formData.fullName.trim()) {
      errors.fullName = "Full name is required.";
    }

    if (!formData.email.trim()) {
      errors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = "Please enter a valid email address.";
    }

    if (!formData.mobileNumber.trim()) {
      errors.mobileNumber = "Mobile number is required.";
    } else if (!/^\d{10}$/.test(formData.mobileNumber.trim())) {
      errors.mobileNumber = "Please enter a valid 10-digit mobile number.";
    }

    if (candidateCategory === "Experienced") {
      if (!formData.primarySkill.trim()) {
        errors.primarySkill = "Primary technical skill / role is required.";
      }
      if (!formData.totalExperience.trim()) {
        errors.totalExperience = "Total years of experience is required.";
      }
      if (!formData.relevantExperience.trim()) {
        errors.relevantExperience = "Relevant experience is required.";
      }
      if (!formData.currentLocation.trim()) {
        errors.currentLocation = "Current location is required.";
      }
      if (!formData.preferredLocation.trim()) {
        errors.preferredLocation = "Preferred location is required.";
      }
    } else {
      // Fresher fields
      if (!formData.highestQualification.trim()) {
        errors.highestQualification = "Highest qualification is required.";
      }
      if (!formData.graduationYear.trim()) {
        errors.graduationYear = "Graduation year is required.";
      }
      if (!formData.skills.trim()) {
        errors.skills = "Please list your primary skills (e.g. Java, Python, React).";
      }
      if (!formData.preferredLocation.trim()) {
        errors.preferredLocation = "Preferred location is required.";
      }
    }

    if (!resumeFile) {
      errors.resume = "Please upload your resume file (PDF, DOC, DOCX).";
    }

    if (!formData.privacyConsent) {
      errors.privacyConsent = "You must acknowledge the candidate privacy notice.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      Swal.fire({
        icon: "warning",
        title: "Incomplete Details",
        text: "Please fill in all required fields marked with an asterisk (*).",
        confirmButtonColor: "#0092d5",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const submissionData = new FormData();
      submissionData.append("candidateCategory", candidateCategory);
      submissionData.append(
        "applicationType",
        applyingJob ? "job_specific" : "general"
      );
      if (applyingJob) {
        submissionData.append("jobId", applyingJob._id);
        submissionData.append("jobTitle", applyingJob.title);
      }

      submissionData.append("fullName", formData.fullName.trim());
      submissionData.append("email", formData.email.trim());
      submissionData.append("mobileNumber", formData.mobileNumber.trim());
      if (formData.employeeNumber) {
        submissionData.append("employeeNumber", formData.employeeNumber.trim());
      }

      if (candidateCategory === "Experienced") {
        submissionData.append("primarySkill", formData.primarySkill.trim());
        submissionData.append("yearsOfExperience", formData.totalExperience.trim());
        submissionData.append("relevantExperience", formData.relevantExperience.trim());
        submissionData.append("currentLocation", formData.currentLocation.trim());
        submissionData.append("preferredLocation", formData.preferredLocation.trim());
        submissionData.append("preferredWorkMode", formData.preferredWorkMode);
        submissionData.append("noticePeriod", formData.noticePeriod);
        if (formData.linkedIn) submissionData.append("linkedIn", formData.linkedIn.trim());
        if (formData.currentCTC) submissionData.append("currentCTC", formData.currentCTC.trim());
        if (formData.expectedCTC) submissionData.append("expectedCTC", formData.expectedCTC.trim());
        submissionData.append("skills", formData.primarySkill.trim());
      } else {
        submissionData.append("highestQualification", formData.highestQualification);
        submissionData.append("graduationYear", formData.graduationYear);
        submissionData.append("skills", formData.skills.trim());
        submissionData.append("preferredLocation", formData.preferredLocation.trim());
        submissionData.append("preferredWorkMode", formData.preferredWorkMode);
        if (formData.internshipDetails) {
          submissionData.append("internshipDetails", formData.internshipDetails.trim());
        }
      }

      submissionData.append("privacyConsent", formData.privacyConsent);
      if (resumeFile) {
        submissionData.append("resume", resumeFile);
      }

      const response = await axios.post(
        `${API_BASE}consultancy/uploadResume`,
        submissionData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Successfully submitted
      setSubmissionResult({
        applicationId: response.data.applicationId || "TK-" + Date.now().toString().slice(-6),
        jobTitle: applyingJob ? applyingJob.title : "",
        applicationType: applyingJob ? "job_specific" : "general",
        candidateCategory,
      });

      // Reset form
      setFormData({
        fullName: "",
        email: "",
        mobileNumber: "",
        employeeNumber: "",
        primarySkill: "",
        totalExperience: "",
        relevantExperience: "",
        currentLocation: "",
        preferredLocation: "",
        preferredWorkMode: "Hybrid",
        noticePeriod: "30 Days",
        linkedIn: "",
        currentCTC: "",
        expectedCTC: "",
        highestQualification: "B.E / B.Tech",
        graduationYear: "2025",
        skills: "",
        internshipDetails: "",
        privacyConsent: true,
      });
      setResumeFile(null);
      setApplyingJob(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Submission error:", error);
      Swal.fire({
        icon: "error",
        title: "Submission Error",
        text:
          error.response?.data?.error ||
          "We could not process your submission. Please check your network and retry.",
        confirmButtonColor: "#0092d5",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Skill category cards definition
  const skillCategories = [
    {
      id: "sap-oracle",
      categoryName: "SAP & Oracle",
      title: "SAP & Oracle Consulting",
      desc: "Functional & technical roles across SAP S/4 HANA, FICO, MM, SD, ABAP, and Oracle ERP cloud implementations.",
      icon: <FaDatabase className="h-6 w-6 text-[#0092d5]" />,
      bgHover: "hover:border-[#0092d5]/60 hover:shadow-lg",
    },
    {
      id: "integration-cloud",
      categoryName: "Integration & Cloud",
      title: "Integration & Cloud Architecture",
      desc: "Enterprise cloud integration including SAP CPI, SAP BTP, MuleSoft, REST/SOAP APIs, and AWS/Azure architectures.",
      icon: <FaCloud className="h-6 w-6 text-sky-600" />,
      bgHover: "hover:border-sky-500/60 hover:shadow-lg",
    },
    {
      id: "software-dev",
      categoryName: "Software Development",
      title: "Full Stack & Software Engineering",
      desc: "Modern web, enterprise and microservices development in React, Node.js, MERN stack, Java, Spring Boot, and Python.",
      icon: <FaCode className="h-6 w-6 text-indigo-600" />,
      bgHover: "hover:border-indigo-500/60 hover:shadow-lg",
    },
    {
      id: "data-analytics",
      categoryName: "Data & Analytics",
      title: "Data & Business Analytics",
      desc: "Actionable business intelligence, data warehousing, ETL engineering, advanced SQL, Power BI, and Python analytics.",
      icon: <FaChartBar className="h-6 w-6 text-teal-600" />,
      bgHover: "hover:border-teal-500/60 hover:shadow-lg",
    },
  ];

  return (
    <div className="min-h-screen bg-[#fafbfc] text-[#121723] pt-36 sm:pt-44 pb-16">
      {/* ========================================================
          1. HERO SECTION
         ======================================================== */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/70 via-white to-transparent py-16 lg:py-24 border-b border-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="text-center max-w-3xl mx-auto">
            {/* Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-100/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#0092d5] mb-5">
              <FaBuilding className="h-3 w-3" />
              <span>Tekisky Pvt. Ltd. · Career Opportunities</span>
            </div>

            {/* H1 Heading */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 leading-tight">
              Your Next Career Move{" "}
              <span className="text-[#0092d5]">Starts Here</span>
            </h1>

            {/* Subtitle */}
            <p className="mt-5 text-lg sm:text-xl font-medium text-gray-700 leading-relaxed">
              Connect with relevant IT opportunities through Tekisky&apos;s
              recruitment network.
            </p>

            {/* Supporting Text */}
            <p className="mt-3 text-sm sm:text-base text-gray-500 leading-relaxed max-w-2xl mx-auto">
              Explore career opportunities across SAP, Oracle, software
              development, cloud technologies, integration, and data analytics.
              Submit your professional profile to be considered for relevant
              openings.
            </p>

            {/* Hero CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={scrollToJobs}
                className="w-full sm:w-auto rounded-xl bg-[#0092d5] px-8 py-3.5 text-base font-semibold text-white shadow-md hover:bg-[#007bb5] transition duration-200 flex items-center justify-center gap-2"
              >
                <FaBriefcase className="h-4 w-4" /> Browse Open Jobs
              </button>
              <button
                onClick={() => scrollToApply("Experienced")}
                className="w-full sm:w-auto rounded-xl border border-gray-300 bg-white px-8 py-3.5 text-base font-semibold text-gray-700 shadow-sm hover:bg-gray-50 hover:border-gray-400 transition duration-200 flex items-center justify-center gap-2"
              >
                <FaFileUpload className="h-4 w-4 text-[#0092d5]" /> Submit Your Resume
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          2. EXPLORE OPPORTUNITIES BY SKILL
         ======================================================== */}
      <section className="py-14 bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#0092d5]">
                Specialized Domains
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
                Explore Opportunities by Skill
              </h2>
            </div>
            <p className="text-sm text-gray-500 max-w-md mt-2 md:mt-0">
              Select a domain below to filter active mandates matching your core
              competency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {skillCategories.map((cat) => {
              const isSelected = selectedCategory === cat.categoryName;
              return (
                <div
                  key={cat.id}
                  onClick={() => handleCategoryCardClick(cat.categoryName)}
                  className={`group cursor-pointer rounded-2xl border p-5 transition-all duration-200 bg-white shadow-sm ${cat.bgHover} ${
                    isSelected
                      ? "border-[#0092d5] ring-2 ring-[#0092d5]/20 bg-blue-50/20"
                      : "border-gray-200/90"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="rounded-xl bg-gray-50 p-2.5 group-hover:bg-blue-50 transition">
                      {cat.icon}
                    </div>
                    {isSelected && (
                      <span className="rounded-full bg-[#0092d5] px-2 py-0.5 text-[10px] font-bold text-white">
                        Active Filter
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-gray-900 group-hover:text-[#0092d5] transition">
                    {cat.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-gray-500">
                    {cat.desc}
                  </p>
                  <div className="mt-4 flex items-center text-xs font-semibold text-[#0092d5]">
                    <span>Filter vacancies</span>
                    <FaArrowRight className="ml-1.5 h-2.5 w-2.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================
          3. ACTIVE JOB LISTINGS SECTION
         ======================================================== */}
      <section ref={jobsSectionRef} id="jobs-section" className="py-14">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          {/* Header & Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#0092d5]">
                Verified Mandates
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
                Active Job Openings
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                {jobs.length === 0
                  ? "No active job openings available at the moment · Submit your profile below for upcoming roles"
                  : `Showing ${filteredJobs.length} of ${jobs.length} recruiter-approved recruitment openings`}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              {selectedCategory !== "All" && (
                <button
                  onClick={() => setSelectedCategory("All")}
                  className="rounded-lg bg-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-300 transition flex items-center gap-1"
                >
                  <FaTimes className="h-3 w-3" /> Clear Category: {selectedCategory}
                </button>
              )}
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm mb-8 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              {/* Search input */}
              <div className="md:col-span-5 relative">
                <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search by role, skill, or keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 pl-10 pr-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#0092d5] focus:outline-none focus:ring-1 focus:ring-[#0092d5]"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <FaTimes className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Category Dropdown */}
              <div className="md:col-span-3">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm text-gray-800 bg-white focus:border-[#0092d5] focus:outline-none focus:ring-1 focus:ring-[#0092d5]"
                >
                  <option value="All">All Categories</option>
                  <option value="SAP & Oracle">SAP & Oracle</option>
                  <option value="Integration & Cloud">Integration & Cloud</option>
                  <option value="Software Development">Software Development</option>
                  <option value="Data & Analytics">Data & Analytics</option>
                </select>
              </div>

              {/* Experience Dropdown */}
              <div className="md:col-span-2">
                <select
                  value={selectedExperience}
                  onChange={(e) => setSelectedExperience(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm text-gray-800 bg-white focus:border-[#0092d5] focus:outline-none focus:ring-1 focus:ring-[#0092d5]"
                >
                  <option value="All">Experience: All</option>
                  <option value="0-2">0 – 2 Years (Entry/Fresher)</option>
                  <option value="3-5">3 – 5 Years (Mid)</option>
                  <option value="5+">5+ Years (Senior)</option>
                </select>
              </div>

              {/* Work Mode Dropdown */}
              <div className="md:col-span-2">
                <select
                  value={selectedWorkMode}
                  onChange={(e) => setSelectedWorkMode(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm text-gray-800 bg-white focus:border-[#0092d5] focus:outline-none focus:ring-1 focus:ring-[#0092d5]"
                >
                  <option value="All">Mode: All</option>
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="On-site">On-site</option>
                </select>
              </div>
            </div>
          </div>

          {/* Job Listings Grid / Cards */}
          {loadingJobs ? (
            <div className="py-20 text-center">
              <FaSpinner className="mx-auto h-8 w-8 animate-spin text-[#0092d5]" />
              <p className="mt-3 text-sm text-gray-500">Loading verified openings...</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            /* Professional Empty State */
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-[#0092d5] mb-4">
                <FaBriefcase className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                {jobs.length === 0
                  ? "No Active Job Openings Available"
                  : "No Matching Vacancies Found"}
              </h3>
              <p className="mt-1 text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
                {jobs.length === 0
                  ? "There are currently no active job openings published by our recruitment team. Please check back soon or submit your candidate profile below to be considered as soon as matching enterprise requirements open."
                  : "We currently don't have an opening matching this exact filter combination. You can reset your filters or submit a general profile for future roles."}
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                {jobs.length > 0 && (
                  <button
                    onClick={() => {
                      setSelectedCategory("All");
                      setSelectedExperience("All");
                      setSelectedWorkMode("All");
                      setSearchQuery("");
                    }}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
                  >
                    Reset All Filters
                  </button>
                )}
                <button
                  onClick={() => scrollToApply("Experienced")}
                  className="rounded-lg bg-[#0092d5] px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#007bb5] transition"
                >
                  Submit General Profile
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredJobs.map((job) => (
                <div
                  key={job._id}
                  className="rounded-2xl border border-gray-200/90 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    {/* Badges */}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-[#0092d5]">
                        {job.category}
                      </span>
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                        {job.workMode}
                      </span>
                      <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                        {job.employmentType || "Full-time"}
                      </span>
                    </div>

                    {/* Job Title */}
                    <h3 className="text-xl font-bold text-gray-900">
                      {job.title}
                    </h3>

                    {/* Quick Specs */}
                    <div className="mt-2.5 flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1.5 font-medium text-gray-700">
                        <FaBriefcase className="text-[#0092d5]" />
                        {job.experience}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <FaMapMarkerAlt className="text-gray-400" />
                        {job.location}
                      </span>
                      {job.postedDate && (
                        <span className="flex items-center gap-1.5 text-gray-400">
                          <FaClock />
                          {new Date(job.postedDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    {/* Relevant exp note if provided */}
                    {job.relevantExperience && (
                      <div className="mt-2 text-xs text-gray-600 italic">
                        Key Requirement: {job.relevantExperience}
                      </div>
                    )}

                    {/* Short Description */}
                    <p className="mt-3 text-xs sm:text-sm text-gray-600 line-clamp-2 leading-relaxed">
                      {job.description}
                    </p>

                    {/* Skill tags */}
                    {job.skills && job.skills.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {job.skills.slice(0, 5).map((skill, idx) => (
                          <span
                            key={idx}
                            className="rounded-md bg-gray-50 border border-gray-200/60 px-2 py-0.5 text-[11px] font-medium text-gray-700"
                          >
                            {skill}
                          </span>
                        ))}
                        {job.skills.length > 5 && (
                          <span className="rounded-md bg-gray-50 px-1.5 py-0.5 text-[11px] text-gray-400">
                            +{job.skills.length - 5}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
                    <button
                      onClick={() => setActiveJobDetails(job)}
                      className="text-xs font-semibold text-gray-600 hover:text-gray-900 transition"
                    >
                      View Role Details
                    </button>
                    <button
                      onClick={() => handleApplyJob(job)}
                      className="rounded-xl bg-[#0092d5] px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#007bb5] transition flex items-center gap-1.5"
                    >
                      Apply Now <FaArrowRight className="h-2.5 w-2.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ========================================================
          4. HOW IT WORKS SECTION
         ======================================================== */}
      <section className="py-16 bg-white border-y border-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0092d5]">
              Transparent Recruitment
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
              How It Works
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              A straightforward process to connect your IT skill set with direct
              client opportunities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="relative rounded-2xl border border-gray-200/80 bg-[#fafbfc] p-6 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-[#0092d5] font-bold text-lg mb-4">
                01
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Submit Your Profile
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-gray-600 leading-relaxed">
                Upload your latest resume and share your professional technical details,
                experience, and preferences.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative rounded-2xl border border-gray-200/80 bg-[#fafbfc] p-6 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100 text-sky-700 font-bold text-lg mb-4">
                02
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Profile Review
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-gray-600 leading-relaxed">
                Our technical recruitment team reviews your skills and experience
                against relevant client requirements.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative rounded-2xl border border-gray-200/80 bg-[#fafbfc] p-6 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 font-bold text-lg mb-4">
                03
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Relevant Opportunities
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-gray-600 leading-relaxed">
                If a suitable match is available, our team contacts you regarding the
                next steps and interview schedule.
              </p>
            </div>
          </div>

          {/* Advisory Notice */}
          <div className="mt-10 rounded-xl bg-blue-50/70 p-4 border border-blue-100 text-center max-w-2xl mx-auto">
            <p className="text-xs text-gray-600">
              <strong className="text-gray-800">Please Note:</strong> Registration
              does not guarantee an interview or job placement. Candidates will be
              contacted when a suitable opportunity matching their background becomes
              available.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================
          5. GENERAL RESUME SUBMISSION CALLOUT
         ======================================================== */}
      <section className="py-12 bg-gradient-to-r from-blue-900 via-[#004f77] to-[#0092d5] text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Don&apos;t See a Matching Vacancy?
            </h2>
            <p className="mt-2 text-sm text-blue-100 leading-relaxed">
              Submit your professional profile for consideration for future relevant
              opportunities. Our recruitment team reviews our candidate database
              whenever new client mandates open.
            </p>
          </div>
          <button
            onClick={() => {
              handleClearSelectedJob();
              scrollToApply("Experienced");
            }}
            className="rounded-xl bg-white px-7 py-3 text-sm font-bold text-[#004f77] shadow-lg hover:bg-blue-50 transition shrink-0"
          >
            Submit General Profile
          </button>
        </div>
      </section>

      {/* ========================================================
          6. CANDIDATE REGISTRATION SECTION
         ======================================================== */}
      <section ref={applySectionRef} id="apply-section" className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          {/* Section Header */}
          <div className="text-center mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0092d5]">
              Registration Form
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
              Submit Your Candidate Profile
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Provide accurate information to help our recruitment team evaluate your
              candidacy.
            </p>
          </div>

          {/* Job Specific Banner if user clicked "Apply Now" */}
          {applyingJob && (
            <div className="mb-6 rounded-2xl bg-blue-50 border border-blue-200 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold uppercase text-[#0092d5] tracking-wide">
                  Applying for Vacancy:
                </span>
                <h3 className="text-base font-bold text-gray-900">
                  {applyingJob.title}
                </h3>
                <p className="text-xs text-gray-600">
                  {applyingJob.category} · {applyingJob.experience} · {applyingJob.location}
                </p>
              </div>
              <button
                type="button"
                onClick={handleClearSelectedJob}
                className="rounded-lg border border-blue-300 bg-white px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-50 transition"
              >
                Clear & Apply Generally
              </button>
            </div>
          )}

          {/* Path Selector Tabs */}
          <div className="mb-8 grid grid-cols-2 gap-3 p-1.5 bg-gray-100/90 rounded-2xl max-w-lg mx-auto">
            <button
              type="button"
              onClick={() => setCandidateCategory("Experienced")}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                candidateCategory === "Experienced"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <FaUserTie className="h-4 w-4 text-[#0092d5]" />
              <span>Experienced IT Professional</span>
            </button>
            <button
              type="button"
              onClick={() => setCandidateCategory("Fresher")}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                candidateCategory === "Fresher"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <FaGraduationCap className="h-4 w-4 text-emerald-600" />
              <span>Fresher & Career Starter</span>
            </button>
          </div>

          {/* Form Card: Conditional rendering between Experienced IT Professional & Original Fresher Form */}
          {candidateCategory === "Experienced" ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-10 shadow-lg">
              <form onSubmit={handleSubmit} noValidate className="space-y-6">
              {/* Common Section: Personal Info */}
              <div>
                <h3 className="text-base font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-[#0092d5]">
                    1
                  </span>
                  Contact Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="fullName"
                      className="block text-xs font-semibold text-gray-700 mb-1"
                    >
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      placeholder="e.g. Rahul Sharma"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 ${
                        formErrors.fullName
                          ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:border-[#0092d5] focus:ring-[#0092d5]"
                      }`}
                    />
                    {formErrors.fullName && (
                      <p className="mt-1 text-xs text-red-500">
                        {formErrors.fullName}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-xs font-semibold text-gray-700 mb-1"
                    >
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 ${
                        formErrors.email
                          ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:border-[#0092d5] focus:ring-[#0092d5]"
                      }`}
                    />
                    {formErrors.email && (
                      <p className="mt-1 text-xs text-red-500">
                        {formErrors.email}
                      </p>
                    )}
                  </div>

                  {/* Mobile Number */}
                  <div>
                    <label
                      htmlFor="mobileNumber"
                      className="block text-xs font-semibold text-gray-700 mb-1"
                    >
                      Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      id="mobileNumber"
                      name="mobileNumber"
                      placeholder="10-digit mobile number"
                      maxLength={10}
                      value={formData.mobileNumber}
                      onChange={handleInputChange}
                      className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 ${
                        formErrors.mobileNumber
                          ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:border-[#0092d5] focus:ring-[#0092d5]"
                      }`}
                    />
                    {formErrors.mobileNumber && (
                      <p className="mt-1 text-xs text-red-500">
                        {formErrors.mobileNumber}
                      </p>
                    )}
                  </div>

                  {/* Employee Number (Optional) */}
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="employeeNumber"
                      className="block text-xs font-semibold text-gray-700 mb-1"
                    >
                      Tekisky Employee ID{" "}
                      <span className="text-xs font-normal text-gray-400">
                        (Optional — leave blank if not an existing employee)
                      </span>
                    </label>
                    <input
                      type="text"
                      id="employeeNumber"
                      name="employeeNumber"
                      placeholder="e.g. 1042"
                      value={formData.employeeNumber}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-gray-300 px-3.5 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#0092d5] focus:outline-none focus:ring-1 focus:ring-[#0092d5]"
                    />
                  </div>
                </div>
              </div>

              {/* Conditional Path 1: EXPERIENCED PROFESSIONAL FIELDS */}
              {candidateCategory === "Experienced" && (
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-[#0092d5]">
                      2
                    </span>
                    Professional Expertise & Experience
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Primary Skill / Role */}
                    <div className="sm:col-span-2">
                      <label
                        htmlFor="primarySkill"
                        className="block text-xs font-semibold text-gray-700 mb-1"
                      >
                        Primary Technical Skill / Role{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="primarySkill"
                        name="primarySkill"
                        placeholder="e.g. SAP CPI / BTP, SAP FICO, React & Node.js, Power BI"
                        value={formData.primarySkill}
                        onChange={handleInputChange}
                        className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 ${
                          formErrors.primarySkill
                            ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                            : "border-gray-300 focus:border-[#0092d5] focus:ring-[#0092d5]"
                        }`}
                      />
                      {formErrors.primarySkill && (
                        <p className="mt-1 text-xs text-red-500">
                          {formErrors.primarySkill}
                        </p>
                      )}
                    </div>

                    {/* Total Experience */}
                    <div>
                      <label
                        htmlFor="totalExperience"
                        className="block text-xs font-semibold text-gray-700 mb-1"
                      >
                        Total IT Experience (Years){" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="totalExperience"
                        name="totalExperience"
                        placeholder="e.g. 6.5"
                        value={formData.totalExperience}
                        onChange={handleInputChange}
                        className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 ${
                          formErrors.totalExperience
                            ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                            : "border-gray-300 focus:border-[#0092d5] focus:ring-[#0092d5]"
                        }`}
                      />
                      {formErrors.totalExperience && (
                        <p className="mt-1 text-xs text-red-500">
                          {formErrors.totalExperience}
                        </p>
                      )}
                    </div>

                    {/* Relevant Experience */}
                    <div>
                      <label
                        htmlFor="relevantExperience"
                        className="block text-xs font-semibold text-gray-700 mb-1"
                      >
                        Relevant Experience in Primary Skill{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="relevantExperience"
                        name="relevantExperience"
                        placeholder="e.g. 4.5"
                        value={formData.relevantExperience}
                        onChange={handleInputChange}
                        className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 ${
                          formErrors.relevantExperience
                            ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                            : "border-gray-300 focus:border-[#0092d5] focus:ring-[#0092d5]"
                        }`}
                      />
                      {formErrors.relevantExperience && (
                        <p className="mt-1 text-xs text-red-500">
                          {formErrors.relevantExperience}
                        </p>
                      )}
                    </div>

                    {/* Current Location */}
                    <div>
                      <label
                        htmlFor="currentLocation"
                        className="block text-xs font-semibold text-gray-700 mb-1"
                      >
                        Current Location <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="currentLocation"
                        name="currentLocation"
                        placeholder="e.g. Pune, Hyderabad, Bangalore"
                        value={formData.currentLocation}
                        onChange={handleInputChange}
                        className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 ${
                          formErrors.currentLocation
                            ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                            : "border-gray-300 focus:border-[#0092d5] focus:ring-[#0092d5]"
                        }`}
                      />
                      {formErrors.currentLocation && (
                        <p className="mt-1 text-xs text-red-500">
                          {formErrors.currentLocation}
                        </p>
                      )}
                    </div>

                    {/* Preferred Location */}
                    <div>
                      <label
                        htmlFor="preferredLocation"
                        className="block text-xs font-semibold text-gray-700 mb-1"
                      >
                        Preferred Location <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="preferredLocation"
                        name="preferredLocation"
                        placeholder="e.g. Pune, Remote, Pan-India"
                        value={formData.preferredLocation}
                        onChange={handleInputChange}
                        className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 ${
                          formErrors.preferredLocation
                            ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                            : "border-gray-300 focus:border-[#0092d5] focus:ring-[#0092d5]"
                        }`}
                      />
                      {formErrors.preferredLocation && (
                        <p className="mt-1 text-xs text-red-500">
                          {formErrors.preferredLocation}
                        </p>
                      )}
                    </div>

                    {/* Preferred Work Mode */}
                    <div>
                      <label
                        htmlFor="preferredWorkMode"
                        className="block text-xs font-semibold text-gray-700 mb-1"
                      >
                        Preferred Work Mode <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="preferredWorkMode"
                        name="preferredWorkMode"
                        value={formData.preferredWorkMode}
                        onChange={handleInputChange}
                        className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm text-gray-900 bg-white focus:border-[#0092d5] focus:outline-none focus:ring-1 focus:ring-[#0092d5]"
                      >
                        <option value="Hybrid">Hybrid</option>
                        <option value="Remote">Remote</option>
                        <option value="On-site">On-site</option>
                      </select>
                    </div>

                    {/* Notice Period */}
                    <div>
                      <label
                        htmlFor="noticePeriod"
                        className="block text-xs font-semibold text-gray-700 mb-1"
                      >
                        Notice Period <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="noticePeriod"
                        name="noticePeriod"
                        value={formData.noticePeriod}
                        onChange={handleInputChange}
                        className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm text-gray-900 bg-white focus:border-[#0092d5] focus:outline-none focus:ring-1 focus:ring-[#0092d5]"
                      >
                        <option value="Immediate / Serving Notice">
                          Immediate / Serving Notice
                        </option>
                        <option value="15 Days">15 Days</option>
                        <option value="30 Days">30 Days</option>
                        <option value="60 Days">60 Days</option>
                        <option value="90 Days">90 Days</option>
                      </select>
                    </div>

                    {/* Optional: Current CTC */}
                    <div>
                      <label
                        htmlFor="currentCTC"
                        className="block text-xs font-semibold text-gray-700 mb-1"
                      >
                        Current CTC (LPA){" "}
                        <span className="text-xs font-normal text-gray-400">
                          (Optional)
                        </span>
                      </label>
                      <input
                        type="text"
                        id="currentCTC"
                        name="currentCTC"
                        placeholder="e.g. 12 LPA"
                        value={formData.currentCTC}
                        onChange={handleInputChange}
                        className="w-full rounded-xl border border-gray-300 px-3.5 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#0092d5] focus:outline-none focus:ring-1 focus:ring-[#0092d5]"
                      />
                    </div>

                    {/* Optional: Expected CTC */}
                    <div>
                      <label
                        htmlFor="expectedCTC"
                        className="block text-xs font-semibold text-gray-700 mb-1"
                      >
                        Expected CTC (LPA){" "}
                        <span className="text-xs font-normal text-gray-400">
                          (Optional)
                        </span>
                      </label>
                      <input
                        type="text"
                        id="expectedCTC"
                        name="expectedCTC"
                        placeholder="e.g. 16 LPA"
                        value={formData.expectedCTC}
                        onChange={handleInputChange}
                        className="w-full rounded-xl border border-gray-300 px-3.5 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#0092d5] focus:outline-none focus:ring-1 focus:ring-[#0092d5]"
                      />
                    </div>

                    {/* Optional: LinkedIn */}
                    <div className="sm:col-span-2">
                      <label
                        htmlFor="linkedIn"
                        className="block text-xs font-semibold text-gray-700 mb-1"
                      >
                        LinkedIn Profile URL{" "}
                        <span className="text-xs font-normal text-gray-400">
                          (Optional)
                        </span>
                      </label>
                      <input
                        type="url"
                        id="linkedIn"
                        name="linkedIn"
                        placeholder="https://linkedin.com/in/yourprofile"
                        value={formData.linkedIn}
                        onChange={handleInputChange}
                        className="w-full rounded-xl border border-gray-300 px-3.5 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#0092d5] focus:outline-none focus:ring-1 focus:ring-[#0092d5]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Section 3: RESUME UPLOAD */}
              <div>
                <h3 className="text-base font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-[#0092d5]">
                    3
                  </span>
                  Upload Your Resume
                </h3>

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`cursor-pointer rounded-2xl border-2 border-dashed p-6 sm:p-8 text-center transition-all ${
                    resumeError || formErrors.resume
                      ? "border-red-400 bg-red-50/20"
                      : resumeFile
                      ? "border-emerald-400 bg-emerald-50/20"
                      : "border-gray-300 hover:border-[#0092d5] hover:bg-blue-50/30"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {resumeFile ? (
                    <div className="flex flex-col items-center">
                      <FaCheckCircle className="h-10 w-10 text-emerald-500 mb-2" />
                      <p className="text-sm font-bold text-gray-900">
                        {resumeFile.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {(resumeFile.size / (1024 * 1024)).toFixed(2)} MB · Ready for
                        submission
                      </p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setResumeFile(null);
                          if (fileInputRef.current) fileInputRef.current.value = "";
                        }}
                        className="mt-3 text-xs font-semibold text-red-500 hover:text-red-700"
                      >
                        Remove and choose another file
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <FaFileUpload className="h-10 w-10 text-gray-400 mb-2" />
                      <p className="text-sm font-semibold text-gray-800">
                        Click or drag your resume file here
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Accepted formats: PDF, DOC, DOCX (Maximum file size: 5MB)
                      </p>
                    </div>
                  )}
                </div>

                {(resumeError || formErrors.resume) && (
                  <p className="mt-2 text-xs text-red-500 font-medium">
                    {resumeError || formErrors.resume}
                  </p>
                )}
              </div>

              {/* Privacy Notice & Consent Checkbox */}
              <div className="rounded-xl bg-gray-50 p-4 border border-gray-200/80">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="privacyConsent"
                    checked={formData.privacyConsent}
                    onChange={handleInputChange}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-[#0092d5] focus:ring-[#0092d5]"
                  />
                  <span className="text-xs text-gray-600 leading-relaxed">
                    I acknowledge that my personal information and resume will be
                    processed by Tekisky Pvt. Ltd. solely for the purpose of
                    recruitment and talent matching in accordance with the{" "}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setIsPrivacyModalOpen(true);
                      }}
                      className="font-semibold text-[#0092d5] underline hover:text-[#007bb5]"
                    >
                      Candidate Privacy Notice
                    </button>
                    .
                  </span>
                </label>
                {formErrors.privacyConsent && (
                  <p className="mt-1.5 text-xs text-red-500 font-medium">
                    {formErrors.privacyConsent}
                  </p>
                )}
              </div>

              {/* Submit CTA */}
              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full rounded-xl py-3.5 px-6 text-sm sm:text-base font-bold text-white shadow-md transition-all duration-200 flex items-center justify-center gap-2 ${
                    isSubmitting
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-[#0092d5] hover:bg-[#007bb5] active:scale-[0.99]"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <FaSpinner className="h-5 w-5 animate-spin" />
                      <span>Submitting Application...</span>
                    </>
                  ) : (
                    <>
                      <span>
                        {applyingJob
                          ? `Submit Application for ${applyingJob.title}`
                          : "Submit Candidate Profile"}
                      </span>
                      <FaArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
                <p className="mt-2 text-center text-[11px] text-gray-400">
                  Secure submission · Your resume is protected and kept confidential.
                </p>
              </div>
            </form>
          </div>
          ) : (
            <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-8 shadow-lg">
              <OriginalFresherForm />
            </div>
          )}
        </div>
      </section>

      {/* ========================================================
          7. TRUST & RECRUITMENT CREDIBILITY
         ======================================================== */}
      <section className="py-14 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0092d5]">
              Why Choose Tekisky
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
              Recruitment Credibility & Direct Mandates
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              We connect top-tier IT talent with enterprise partners across India and
              globally.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="rounded-xl border border-gray-200/80 p-5 bg-[#fafbfc]">
              <div className="h-10 w-10 rounded-lg bg-blue-50 text-[#0092d5] flex items-center justify-center mb-3">
                <FaCheckCircle className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-gray-900">
                Technical Matching
              </h3>
              <p className="mt-1.5 text-xs text-gray-600 leading-relaxed">
                Evaluations conducted by actual IT engineers with deep understanding
                of SAP, Cloud, and Software stacks.
              </p>
            </div>

            <div className="rounded-xl border border-gray-200/80 p-5 bg-[#fafbfc]">
              <div className="h-10 w-10 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center mb-3">
                <FaBuilding className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-gray-900">
                Direct Client Mandates
              </h3>
              <p className="mt-1.5 text-xs text-gray-600 leading-relaxed">
                Direct partnerships with corporate enterprises eliminating multiple
                unnecessary intermediary layers.
              </p>
            </div>

            <div className="rounded-xl border border-gray-200/80 p-5 bg-[#fafbfc]">
              <div className="h-10 w-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                <FaShieldAlt className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-gray-900">
                Candidate Confidentiality
              </h3>
              <p className="mt-1.5 text-xs text-gray-600 leading-relaxed">
                Your personal contact details and current employer details are handled
                with complete professional discretion.
              </p>
            </div>

            <div className="rounded-xl border border-gray-200/80 p-5 bg-[#fafbfc]">
              <div className="h-10 w-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center mb-3">
                <FaPhoneAlt className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-gray-900">
                Verified Communication
              </h3>
              <p className="mt-1.5 text-xs text-gray-600 leading-relaxed">
                Prompt updates when a mandate matches your profile, without spam or
                unsolicited distributions.
              </p>
            </div>
          </div>

          {/* Verified Contact Card */}
          <div className="mt-10 rounded-2xl bg-gray-50 border border-gray-200 p-6 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
            <div>
              <h3 className="text-base font-bold text-gray-900">
                Tekisky Pvt. Ltd. · Recruitment & Talent Acquisition
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Have specific recruitment inquiries or questions about your application?
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-gray-700">
              <a
                href="mailto:hr@tekisky.com"
                className="flex items-center gap-1.5 rounded-lg bg-white border border-gray-300 px-3.5 py-2 hover:border-[#0092d5] hover:text-[#0092d5] transition"
              >
                <FaEnvelope className="text-[#0092d5]" /> hr@tekisky.com
              </a>
              <a
                href="tel:+918625817334"
                className="flex items-center gap-1.5 rounded-lg bg-white border border-gray-300 px-3.5 py-2 hover:border-[#0092d5] hover:text-[#0092d5] transition"
              >
                <FaPhoneAlt className="text-[#0092d5]" /> +91 8625817334
              </a>
              <button
                type="button"
                onClick={() => setIsPrivacyModalOpen(true)}
                className="flex items-center gap-1.5 rounded-lg bg-white border border-gray-300 px-3.5 py-2 hover:border-[#0092d5] hover:text-[#0092d5] transition"
              >
                <FaShieldAlt className="text-gray-500" /> Privacy Notice
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          MODALS
         ======================================================== */}
      {/* 1. Job Details Modal */}
      <JobDetailsModal
        job={activeJobDetails}
        onClose={() => setActiveJobDetails(null)}
        onApply={handleApplyJob}
      />

      {/* 2. Privacy Notice Modal */}
      <PrivacyNoticeModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />

      {/* 3. Application Success Modal */}
      <ApplicationSuccessModal
        result={submissionResult}
        onClose={() => setSubmissionResult(null)}
      />
    </div>
  );
};

export default ConsultancyForm;
