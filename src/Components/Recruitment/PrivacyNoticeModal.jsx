import React from "react";
import { FaTimes, FaShieldAlt, FaEnvelope, FaPhoneAlt } from "react-icons/fa";

const PrivacyNoticeModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"
          aria-label="Close modal"
        >
          <FaTimes className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#0092d5]">
            <FaShieldAlt className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Candidate Privacy Notice
            </h2>
            <p className="text-xs text-gray-500">
              Tekisky Pvt. Ltd. · Recruitment Data Policy
            </p>
          </div>
        </div>

        <div className="space-y-4 py-5 text-sm text-gray-600 leading-relaxed">
          <section>
            <h3 className="font-semibold text-gray-900 mb-1">
              1. Information We Collect
            </h3>
            <p>
              When you submit your application through our career portal, Tekisky Pvt. Ltd. collects information including your full name, email address, mobile phone number, current and preferred locations, work history, skill proficiencies, compensation expectations, notice period, and your uploaded resume file.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-gray-900 mb-1">
              2. Purpose of Collection
            </h3>
            <p>
              Your personal information is collected solely to evaluate your qualifications against active client recruitment requirements, conduct preliminary technical assessments, communicate potential interview schedules, and facilitate employment opportunities matching your expertise.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-gray-900 mb-1">
              3. Data Usage & Confidentiality
            </h3>
            <p>
              We treat candidate data with strict confidentiality. Your details and resume are reviewed by our internal technical recruitment specialists. We do not sell or rent candidate information to third-party commercial marketing entities.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-gray-900 mb-1">
              4. Data Retention
            </h3>
            <p>
              Candidate profiles and resumes are retained in our active talent pool for up to 12 months from the date of submission. This allows our talent acquisition team to consider your profile for newly opened positions that align with your background.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-gray-900 mb-1">
              5. Candidate Rights (Access, Correction, & Deletion)
            </h3>
            <p>
              You maintain full rights to request an update to your contact details, inspect the information stored on file, or request immediate deletion of your candidate record and uploaded resume at any time.
            </p>
          </section>

          <section className="rounded-xl bg-gray-50 p-4 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-1">
              6. Contact Our Recruitment Privacy Officer
            </h3>
            <p className="mb-2">
              To exercise your data privacy rights or inquire about our recruitment data policy:
            </p>
            <div className="flex flex-col sm:flex-row gap-3 text-xs text-gray-700">
              <span className="flex items-center gap-1.5">
                <FaEnvelope className="text-[#0092d5]" /> hr@tekisky.com
              </span>
              <span className="flex items-center gap-1.5">
                <FaPhoneAlt className="text-[#0092d5]" /> +91 8625817334
              </span>
            </div>
          </section>
        </div>

        <div className="border-t border-gray-100 pt-4 text-right">
          <button
            onClick={onClose}
            className="rounded-lg bg-[#0092d5] px-6 py-2 text-sm font-semibold text-white hover:bg-[#007bb5] transition"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrivacyNoticeModal;
