import React from "react";
import {
  FaTimes,
  FaMapMarkerAlt,
  FaBriefcase,
  FaClock,
  FaCheckCircle,
  FaLaptopCode,
  FaShareAlt,
} from "react-icons/fa";

const JobDetailsModal = ({ job, onClose, onApply }) => {
  if (!job) return null;

  const handleShare = (e) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/consultancy#job-${job._id}`;
    if (navigator.share) {
      navigator.share({
        title: `${job.title} at Tekisky Pvt Ltd`,
        text: `Check out this opening for ${job.title} (${job.experience}) at Tekisky Pvt Ltd:`,
        url: shareUrl,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert("Job link copied to clipboard!");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"
          aria-label="Close modal"
        >
          <FaTimes className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="border-b border-gray-100 pb-5 pr-8">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#0092d5]">
              {job.category}
            </span>
            <span className="inline-block rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              {job.workMode}
            </span>
            <span className="inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
              {job.employmentType || "Full-time"}
            </span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            {job.title}
          </h2>

          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1.5">
              <FaMapMarkerAlt className="text-[#0092d5]" />
              {job.location}
            </span>
            <span className="flex items-center gap-1.5">
              <FaBriefcase className="text-[#0092d5]" />
              {job.experience} experience
            </span>
            {job.postedDate && (
              <span className="flex items-center gap-1.5 text-gray-500">
                <FaClock className="text-gray-400" />
                Posted {new Date(job.postedDate).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="space-y-6 py-5 text-gray-700">
          {/* Key Skill Highlights */}
          {job.relevantExperience && (
            <div className="rounded-xl bg-blue-50/60 p-3.5 border border-blue-100/80 text-sm">
              <span className="font-semibold text-gray-900">Relevant Experience:</span>{" "}
              {job.relevantExperience}
            </div>
          )}

          {/* Description */}
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-2">
              Role Overview
            </h3>
            <p className="leading-relaxed text-sm text-gray-600">
              {job.description}
            </p>
          </div>

          {/* Required Skills */}
          {job.skills && job.skills.length > 0 && (
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <FaLaptopCode className="text-[#0092d5]" /> Technical Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="rounded-lg bg-gray-100 px-3 py-1 text-xs font-medium text-gray-800"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Responsibilities */}
          {job.responsibilities && job.responsibilities.length > 0 && (
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">
                Key Responsibilities
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                {job.responsibilities.map((resp, index) => (
                  <li key={index} className="flex items-start gap-2.5">
                    <FaCheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#0092d5]" />
                    <span>{resp}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Requirements */}
          {job.requirements && job.requirements.length > 0 && (
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">
                Requirements & Qualifications
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                {job.requirements.map((req, index) => (
                  <li key={index} className="flex items-start gap-2.5">
                    <FaCheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Modal Footer / CTAs */}
        <div className="border-t border-gray-100 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={handleShare}
            type="button"
            className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition w-full sm:w-auto"
          >
            <FaShareAlt className="text-gray-500" /> Share Vacancy
          </button>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              type="button"
              className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition w-full sm:w-auto"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onApply(job);
              }}
              type="button"
              className="rounded-lg bg-[#0092d5] px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#007bb5] transition w-full sm:w-auto text-center"
            >
              Apply Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailsModal;
