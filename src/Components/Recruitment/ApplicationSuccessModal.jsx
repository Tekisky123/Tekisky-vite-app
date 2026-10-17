import React from "react";
import { FaCheckCircle, FaClipboardList, FaArrowRight, FaTimes } from "react-icons/fa";

const ApplicationSuccessModal = ({ result, onClose }) => {
  if (!result) return null;

  const { applicationId, jobTitle, applicationType, candidateCategory } = result;
  const isJobSpecific = applicationType === "job_specific" || Boolean(jobTitle);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl sm:p-8 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"
          aria-label="Close"
        >
          <FaTimes className="h-5 w-5" />
        </button>

        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-4">
          <FaCheckCircle className="h-10 w-10" />
        </div>

        <h2 className="text-2xl font-bold text-gray-900">
          Application Submitted Successfully!
        </h2>

        <p className="mt-2 text-sm text-gray-600">
          {isJobSpecific ? (
            <>
              Your application has been received for the role of{" "}
              <strong className="text-gray-900">{jobTitle}</strong>.
            </>
          ) : (
            <>
              Your candidate profile has been registered in Tekisky's recruitment
              database as an{" "}
              <strong className="text-gray-900">
                {candidateCategory === "Fresher"
                  ? "Entry-Level / Fresher Profile"
                  : "Experienced IT Professional"}
              </strong>
              .
            </>
          )}
        </p>

        {applicationId && (
          <div className="my-5 rounded-xl bg-gray-50 border border-gray-200 p-3.5 text-xs text-gray-600">
            <span className="block text-gray-400 font-mono text-[11px] uppercase tracking-wider">
              Application Reference ID
            </span>
            <span className="mt-1 font-mono font-bold text-gray-900 text-sm select-all">
              {applicationId}
            </span>
          </div>
        )}

        <div className="rounded-xl bg-blue-50/70 p-4 border border-blue-100 text-left text-xs text-gray-600 space-y-2 mb-6">
          <div className="flex items-center gap-2 font-semibold text-[#0092d5]">
            <FaClipboardList className="h-4 w-4" /> What Happens Next?
          </div>
          <p>
            1. Our talent acquisition specialists will review your resume against
            current and upcoming requirements.
          </p>
          <p>
            2. If your technical profile matches an active mandate, a recruiter
            will contact you directly via phone or email.
          </p>
          <p className="text-[11px] text-gray-500 italic pt-1 border-t border-blue-200/50">
            Note: Registration does not guarantee an interview or placement.
            Candidates are contacted when a suitable opportunity becomes available.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl bg-[#0092d5] py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#007bb5] transition flex items-center justify-center gap-2"
          >
            Explore More Jobs <FaArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApplicationSuccessModal;
