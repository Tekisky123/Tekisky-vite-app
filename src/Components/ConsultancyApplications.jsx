import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import ToastNotification from "../Loader/ToastNotification";
import {
  FaFileDownload,
  FaFolderOpen,
  FaShareAlt,
  FaTrash,
  FaTasks,
  FaFileAlt,
  FaSearch,
  FaTimes,
  FaSyncAlt,
  FaCheckCircle,
  FaInbox,
  FaClock,
  FaCalendarAlt,
  FaBriefcase,
} from "react-icons/fa";
import baseURL from "../Common/Api";

const ConsultancyApplications = ({ onCountsUpdate }) => {
  const [applicants, setApplicants] = useState([]);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Helper to extract timestamp from createdAt or MongoDB ObjectId (always reliable)
  const getSubmissionTime = (applicant) => {
    if (!applicant) return 0;
    if (applicant.createdAt) {
      const d = new Date(applicant.createdAt).getTime();
      if (!isNaN(d)) return d;
    }
    if (
      applicant._id &&
      typeof applicant._id === "string" &&
      applicant._id.length >= 8
    ) {
      try {
        const d = parseInt(applicant._id.substring(0, 8), 16) * 1000;
        if (!isNaN(d)) return d;
      } catch {
        return 0;
      }
    }
    return 0;
  };

  // Helper to format submission date and time cleanly
  const formatSubmissionDate = (applicant) => {
    const ts = getSubmissionTime(applicant);
    if (!ts) return "—";
    const date = new Date(ts);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Check if an application is considered "New"
  const isNewStatus = (status) => {
    if (!status) return true;
    const s = String(status).toLowerCase().trim();
    return s === "new" || s === "submitted";
  };

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        const response = await axios.get(
          `${baseURL}consultancy/getAllUploadResume`,
          {
            headers: {
              Authorization: storedToken,
            },
          }
        );
        // Strictly sort newest applications first by submission timestamp descending
        const data = Array.isArray(response.data)
          ? [...response.data].sort(
              (a, b) => getSubmissionTime(b) - getSubmissionTime(a)
            )
          : [];
        setApplicants(data);
        if (typeof onCountsUpdate === "function") {
          onCountsUpdate(data);
        }
      }
    } catch (error) {
      console.error("Error fetching applicants:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, []);

  const handleViewMore = async (applicant) => {
    try {
      const response = await axios.get(
        `${baseURL}consultancy/getoneuploadresume/${applicant._id}`
      );
      const data = response.data;
      setSelectedApplicant({ ...applicant, ...data });
    } catch (error) {
      console.error("Error fetching applicant details:", error);
    }
  };

  const handleCloseModal = () => {
    setSelectedApplicant(null);
  };

  const handleSaveChanges = async () => {
    if (!selectedApplicant) return;

    try {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        Swal.fire({
          title: "Saving changes...",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        await axios.post(
          `${baseURL}consultancy/getoneuploadresumeandupdate/${selectedApplicant._id}`,
          {
            rating: selectedApplicant.rating,
            status: selectedApplicant.status,
            comments: selectedApplicant.comments,
            mockInterviewFeedback: selectedApplicant.mockInterviewFeedback,
            communicationSkillRating:
              selectedApplicant.communicationSkillRating,
            technicalRoundComments: selectedApplicant.technicalRoundComments,
          },
          {
            headers: {
              Authorization: storedToken,
            },
          }
        );

        Swal.fire({
          title: "Saved!",
          text: "Applicant details have been updated.",
          icon: "success",
          confirmButtonText: "OK",
        });

        handleCloseModal();
        fetchApplicants();
      }
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "Failed to update applicant details",
        icon: "error",
        confirmButtonText: "OK",
      });
      console.error("Error updating applicant details:", error);
    }
  };

  const handleFieldChange = (field, value) => {
    setSelectedApplicant((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Filtered applicants for general archive/search
  const filteredApplicants = applicants.filter((applicant) => {
    const searchTermLower = searchTerm ? searchTerm.toLowerCase().trim() : "";

    const fullNameMatch =
      applicant.fullName &&
      applicant.fullName.toLowerCase().includes(searchTermLower);

    const emailMatch =
      applicant.email &&
      applicant.email.toLowerCase().includes(searchTermLower);

    const mobileMatch =
      applicant.mobileNumber &&
      applicant.mobileNumber.toLowerCase().includes(searchTermLower);

    const positionMatch =
      (applicant.jobTitle &&
        applicant.jobTitle.toLowerCase().includes(searchTermLower)) ||
      (applicant.primarySkill &&
        applicant.primarySkill.toLowerCase().includes(searchTermLower));

    const experienceMatch =
      applicant.yearsOfExperience &&
      applicant.yearsOfExperience.toString().includes(searchTermLower);

    const skillMatch =
      Array.isArray(applicant.skills) &&
      applicant.skills.some(
        (skill) =>
          typeof skill === "string" && skill.toLowerCase().includes(searchTermLower)
      );

    const textMatch =
      !searchTermLower ||
      fullNameMatch ||
      emailMatch ||
      mobileMatch ||
      positionMatch ||
      experienceMatch ||
      skillMatch;

    let statusMatch = true;
    if (statusFilter === "New") {
      statusMatch = isNewStatus(applicant.status);
    } else if (statusFilter) {
      statusMatch = applicant.status === statusFilter;
    }

    const categoryMatch =
      categoryFilter === "All"
        ? true
        : (applicant.candidateCategory || "Experienced").toLowerCase() ===
          categoryFilter.toLowerCase();

    return textMatch && statusMatch && categoryMatch;
  });

  // Extract all New/Submitted applications, sorted strictly latest first
  const newApplications = applicants
    .filter((app) => isNewStatus(app.status))
    .sort((a, b) => getSubmissionTime(b) - getSubmissionTime(a));

  const getStatusClassName = (status) => {
    switch (status) {
      case "Verified":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-semibold px-2.5 py-1 rounded-full text-xs inline-flex items-center justify-center";
      case "New":
        return "bg-amber-50 text-amber-700 border border-amber-300 font-bold px-2.5 py-1 rounded-full text-xs inline-flex items-center justify-center";
      case "Submitted":
        return "bg-sky-50 text-sky-700 border border-sky-300 font-bold px-2.5 py-1 rounded-full text-xs inline-flex items-center justify-center";
      case "Rejected":
        return "bg-rose-50 text-rose-700 border border-rose-200/80 font-semibold px-2.5 py-1 rounded-full text-xs inline-flex items-center justify-center";
      case "Mock Interview Done":
        return "bg-blue-50 text-blue-700 border border-blue-200/80 font-semibold px-2.5 py-1 rounded-full text-xs inline-flex items-center justify-center";
      case "Assessment Assigned":
        return "bg-purple-50 text-purple-700 border border-purple-200/80 font-semibold px-2.5 py-1 rounded-full text-xs inline-flex items-center justify-center";
      case "Assessment Submitted":
        return "bg-teal-50 text-teal-700 border border-teal-200/80 font-semibold px-2.5 py-1 rounded-full text-xs inline-flex items-center justify-center";
      default:
        return "bg-gray-100 text-gray-700 border border-gray-200 font-semibold px-2.5 py-1 rounded-full text-xs inline-flex items-center justify-center";
    }
  };

  const renderSkills = (skills) => {
    if (!skills) return <span className="text-gray-400 text-xs italic">None</span>;
    let skillList = [];
    if (Array.isArray(skills)) {
      skillList = skills.flatMap((s) => (typeof s === "string" ? s.split(",") : []));
    } else if (typeof skills === "string") {
      skillList = skills.split(",");
    }
    const cleanSkills = skillList.map((s) => s.trim()).filter(Boolean);
    if (cleanSkills.length === 0) {
      return <span className="text-gray-400 text-xs italic">None</span>;
    }
    return (
      <div className="flex flex-wrap gap-1 max-w-xs">
        {cleanSkills.slice(0, 3).map((skill, index) => (
          <span
            key={index}
            className="rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-[#0092d5] border border-blue-100"
          >
            {skill}
          </span>
        ))}
        {cleanSkills.length > 3 && (
          <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] font-bold text-gray-600">
            +{cleanSkills.length - 3}
          </span>
        )}
      </div>
    );
  };

  const handleDeleteApplicant = async (applicantId) => {
    try {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        const confirmResult = await Swal.fire({
          title: "Are you sure?",
          text: "Do you really want to delete this applicant and their uploaded resume?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Yes, delete it!",
          cancelButtonText: "No, cancel!",
        });

        if (confirmResult.isConfirmed) {
          Swal.fire({
            title: "Deleting...",
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading();
            },
          });

          await axios.delete(
            `${baseURL}consultancy/deleteoneuploadresume/${applicantId}`,
            {
              headers: {
                Authorization: storedToken,
              },
            }
          );

          Swal.fire({
            title: "Deleted!",
            text: "The applicant and resume file have been deleted.",
            icon: "success",
            confirmButtonText: "OK",
          });

          fetchApplicants();
        }
      }
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "Failed to delete the applicant",
        icon: "error",
        confirmButtonText: "OK",
      });
      console.error("Error deleting applicant:", error);
    }
  };

  const handleShare = async (applicantId) => {
    const applicationUrl = `${window.location.origin}/singleApplication/${applicantId}`;

    navigator.clipboard
      .writeText(applicationUrl)
      .then(() => {
        setToastMessage("Application link copied to clipboard!");
        setShowToast(true);
      })
      .catch((error) => {
        console.error("Failed to copy the link:", error);
      });

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Application Link",
          text: "Check out this application:",
          url: applicationUrl,
        });
      }
    } catch (error) {
      console.error("Error sharing the link:", error);
    }
  };

  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth <= 768);
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const applicantsPerPage = 8;
  const totalPages = Math.ceil(filteredApplicants.length / applicantsPerPage) || 1;
  const [currentPage, setCurrentPage] = useState(1);

  const startIndex = (currentPage - 1) * applicantsPerPage;
  const endIndex = startIndex + applicantsPerPage;
  const visibleApplicants = filteredApplicants.slice(startIndex, endIndex);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, categoryFilter]);

  const navigate = useNavigate();

  const handleNavigate = (applicantId) => {
    navigate(`/assign-Assisment/${applicantId}`);
  };

  // Status breakdown counts
  const assessmentAssignedCount = applicants.filter(
    (a) => a.status === "Assessment Assigned"
  ).length;
  const assessmentSubmittedCount = applicants.filter(
    (a) => a.status === "Assessment Submitted"
  ).length;
  const verifiedCount = applicants.filter((a) => a.status === "Verified").length;
  const rejectedCount = applicants.filter((a) => a.status === "Rejected").length;

  return (
    <div>
      {showToast && (
        <ToastNotification
          message={toastMessage}
          onClose={() => setShowToast(false)}
        />
      )}

      {/* ========================================================
          1. NEW APPLICATIONS SECTION (DISPLAYED AT THE VERY TOP)
         ======================================================== */}
      <div className="rounded-2xl border border-amber-200/90 bg-white p-5 sm:p-6 shadow-sm mb-6 relative overflow-hidden">
        {/* Accent top gradient stripe */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-sky-400 to-[#0092d5]" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-200/60 shadow-sm">
              <FaInbox className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-gray-900">
                  New Applications
                </h2>
                <span className="rounded-full bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold px-2.5 py-0.5">
                  {newApplications.length} New
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Newly submitted candidate profiles · Sorted by submission date & time (newest first)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchApplicants}
              className="rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition flex items-center gap-1.5"
              title="Refresh applications data"
            >
              <FaSyncAlt
                className={`h-3 w-3 ${loading ? "animate-spin text-[#0092d5]" : ""}`}
              />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Content: New Applications List or Empty Message */}
        {newApplications.length === 0 ? (
          <div className="py-8 px-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mb-3 border border-emerald-100">
              <FaCheckCircle className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-gray-800">
              No new applications found.
            </h3>
            <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
              All candidate applications have been reviewed or updated. Newly submitted applications will automatically appear here at the top.
            </p>
          </div>
        ) : isSmallScreen ? (
          /* Mobile Card View for New Applications */
          <div className="mt-4 space-y-3">
            {newApplications.map((applicant) => (
              <div
                key={applicant._id}
                className="rounded-xl border border-amber-200/80 bg-gradient-to-br from-amber-50/20 to-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">
                      {applicant.fullName || "Unnamed Candidate"}
                    </h4>
                    <div className="text-[11px] text-[#0092d5] font-semibold mt-0.5 flex items-center gap-1">
                      <FaBriefcase className="h-3 w-3" />
                      <span>
                        {applicant.jobTitle ||
                          applicant.primarySkill ||
                          "General Application"}
                      </span>
                    </div>
                  </div>
                  <span className={getStatusClassName(applicant.status)}>
                    {applicant.status || "New"}
                  </span>
                </div>

                <div className="text-xs text-gray-600 space-y-1 bg-white/80 rounded-lg p-2.5 border border-gray-100 mb-3">
                  <div>
                    <strong className="text-gray-700">Email:</strong>{" "}
                    {applicant.email || "—"}
                  </div>
                  <div>
                    <strong className="text-gray-700">Mobile:</strong>{" "}
                    {applicant.mobileNumber || "—"}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-gray-500 pt-1 border-t border-gray-100 mt-1">
                    <FaClock className="h-3 w-3 text-amber-500" />
                    <span>Submitted: {formatSubmissionDate(applicant)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100 gap-2">
                  {applicant.resumeUrl ? (
                    <a
                      href={applicant.resumeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition"
                      title="View / Download S3 Resume"
                    >
                      <FaFileDownload className="h-3 w-3 text-emerald-600" />
                      <span>Resume</span>
                    </a>
                  ) : (
                    <span className="text-xs text-gray-400 italic">No Resume</span>
                  )}

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleViewMore(applicant)}
                      className="rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 text-xs font-semibold transition flex items-center gap-1"
                    >
                      <FaFolderOpen className="h-3 w-3" /> Details
                    </button>
                    <button
                      onClick={() => handleNavigate(applicant._id)}
                      className="rounded-lg bg-blue-50 hover:bg-blue-100 text-[#0092d5] p-2 text-xs transition"
                      title="Assessment"
                    >
                      <FaTasks className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => handleShare(applicant._id)}
                      className="rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 p-2 text-xs transition"
                      title="Share"
                    >
                      <FaShareAlt className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => handleDeleteApplicant(applicant._id)}
                      className="rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 p-2 text-xs transition"
                      title="Delete"
                    >
                      <FaTrash className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Desktop Table View for New Applications */
          <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200/90 bg-white">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-amber-50/40 text-[11px] font-bold uppercase tracking-wider text-gray-600">
                  <th className="px-4 py-3">Candidate</th>
                  <th className="px-4 py-3">Contact Info</th>
                  <th className="px-4 py-3">Applied Position</th>
                  <th className="px-4 py-3">Submission Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Resume</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
                {newApplications.map((applicant) => (
                  <tr
                    key={applicant._id}
                    className="hover:bg-amber-50/20 transition-colors duration-150"
                  >
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-gray-900">
                        {applicant.fullName || "Unnamed Candidate"}
                      </div>
                      <div className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                        <span className="text-[#0092d5] font-medium">
                          {applicant.candidateCategory || "Experienced"}
                        </span>
                        {applicant.referredBy && (
                          <span>· Ref: {applicant.referredBy}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-gray-700">
                      <div>{applicant.email || "—"}</div>
                      <div className="text-gray-400 text-[11px]">
                        {applicant.mobileNumber || "—"}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-xs font-semibold text-gray-800">
                      <div className="flex items-center gap-1.5">
                        <FaBriefcase className="h-3 w-3 text-[#0092d5]" />
                        <span>
                          {applicant.jobTitle ||
                            applicant.primarySkill ||
                            "General Application"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-xs text-gray-700">
                      <div className="flex items-center gap-1.5 font-medium">
                        <FaClock className="h-3 w-3 text-amber-500" />
                        <span>{formatSubmissionDate(applicant)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className={getStatusClassName(applicant.status)}>
                        {applicant.status || "New"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {applicant.resumeUrl ? (
                        <a
                          href={applicant.resumeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition shadow-sm"
                          title="View / Download Resume (AWS S3)"
                        >
                          <FaFileDownload className="h-3 w-3 text-emerald-600" />
                          <span>Resume</span>
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400 italic">None</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleViewMore(applicant)}
                          className="rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 transition"
                          title="View Application Details"
                        >
                          <FaFolderOpen className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleNavigate(applicant._id)}
                          className="rounded-lg bg-blue-50 hover:bg-blue-100 text-[#0092d5] p-2 transition"
                          title="Assign Assessment"
                        >
                          <FaTasks className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleShare(applicant._id)}
                          className="rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 p-2 transition"
                          title="Share Link"
                        >
                          <FaShareAlt className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteApplicant(applicant._id)}
                          className="rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 p-2 transition"
                          title="Delete Applicant"
                        >
                          <FaTrash className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================
          2. GENERAL APPLICATIONS ARCHIVE & FILTER CONTROLS
         ======================================================== */}
      <div className="rounded-2xl border border-gray-200/90 bg-white p-5 sm:p-6 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
              <FaFileAlt className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                All Consultancy Applications
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {loading
                  ? "Loading candidate applications..."
                  : `Showing ${filteredApplicants.length} of ${applicants.length} total applications across all statuses`}
              </p>
            </div>
          </div>
        </div>

        {/* Status Quick Filter Tabs */}
        <div className="mt-4 flex flex-wrap gap-2 pb-3 border-b border-gray-100">
          <button
            onClick={() => setStatusFilter("")}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
              statusFilter === ""
                ? "bg-[#0092d5] text-white shadow-sm"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All Applications ({applicants.length})
          </button>
          <button
            onClick={() => setStatusFilter("New")}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition flex items-center gap-1.5 ${
              statusFilter === "New"
                ? "bg-amber-500 text-white shadow-sm"
                : "bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100"
            }`}
          >
            <span>New Applications</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                statusFilter === "New"
                  ? "bg-white text-amber-700"
                  : "bg-amber-200/80 text-amber-900"
              }`}
            >
              {newApplications.length}
            </span>
          </button>
          <button
            onClick={() => setStatusFilter("Assessment Assigned")}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
              statusFilter === "Assessment Assigned"
                ? "bg-purple-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Assessment Assigned ({assessmentAssignedCount})
          </button>
          <button
            onClick={() => setStatusFilter("Assessment Submitted")}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
              statusFilter === "Assessment Submitted"
                ? "bg-teal-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Assessment Submitted ({assessmentSubmittedCount})
          </button>
          <button
            onClick={() => setStatusFilter("Verified")}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
              statusFilter === "Verified"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Verified ({verifiedCount})
          </button>
          <button
            onClick={() => setStatusFilter("Rejected")}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
              statusFilter === "Rejected"
                ? "bg-rose-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Rejected ({rejectedCount})
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="mt-3 grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-6 relative">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search by name, position, skills, experience, mobile, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-gray-300 pl-10 pr-8 py-2.5 text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#0092d5] focus:outline-none focus:ring-1 focus:ring-[#0092d5]"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <FaTimes className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="md:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-xs sm:text-sm text-gray-800 bg-white focus:border-[#0092d5] focus:outline-none focus:ring-1 focus:ring-[#0092d5]"
            >
              <option value="">All Statuses</option>
              <option value="New">New / Submitted Applications</option>
              <option value="Verified">Verified</option>
              <option value="Mock Interview Done">Mock Interview Done</option>
              <option value="Assessment Assigned">Assessment Assigned</option>
              <option value="Assessment Submitted">Assessment Submitted</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div className="md:col-span-3">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-xs sm:text-sm text-gray-800 bg-white focus:border-[#0092d5] focus:outline-none focus:ring-1 focus:ring-[#0092d5]"
            >
              <option value="All">All Categories</option>
              <option value="Experienced">Experienced Candidates</option>
              <option value="Fresher">Freshers & Trainees</option>
            </select>
          </div>
        </div>
      </div>

      {filteredApplicants.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 mb-4">
            <FaFileAlt className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">
            {applicants.length === 0
              ? "No Consultancy Applications Yet"
              : "No Matching Applications Found"}
          </h3>
          <p className="mt-1 text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
            {applicants.length === 0
              ? "Candidate profile submissions and uploaded resumes will appear here once submitted from the consultancy portal."
              : "Try adjusting your search criteria or resetting filters to view matching candidates."}
          </p>
          {(searchTerm || statusFilter || categoryFilter !== "All") && (
            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("");
                setCategoryFilter("All");
              }}
              className="mt-5 rounded-xl border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : isSmallScreen ? (
        /* Mobile Cards View */
        <div className="space-y-4">
          {visibleApplicants.map((applicant) => (
            <div
              key={applicant._id}
              className="rounded-2xl border border-gray-200/90 bg-white p-5 shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    {applicant.fullName || "Unnamed Candidate"}
                  </h3>
                  <div className="text-xs text-[#0092d5] font-semibold mt-0.5 flex items-center gap-1">
                    <FaBriefcase className="h-3 w-3" />
                    <span>
                      {applicant.jobTitle ||
                        applicant.primarySkill ||
                        "General Application"}
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-500 mt-0.5">
                    {applicant.candidateCategory || "Experienced"} Candidate
                    {applicant.referredBy && ` · Ref: ${applicant.referredBy}`}
                  </div>
                </div>
                <span className={getStatusClassName(applicant.status)}>
                  {applicant.status || "New"}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-gray-600 bg-gray-50 rounded-xl p-3 mb-3">
                <div>
                  <strong className="text-gray-700">Email:</strong>{" "}
                  {applicant.email || "—"}
                </div>
                <div>
                  <strong className="text-gray-700">Mobile:</strong>{" "}
                  {applicant.mobileNumber || "—"}
                </div>
                <div>
                  <strong className="text-gray-700">Submission Date:</strong>{" "}
                  {formatSubmissionDate(applicant)}
                </div>
                <div>
                  <strong className="text-gray-700">Experience:</strong>{" "}
                  {applicant.yearsOfExperience
                    ? `${applicant.yearsOfExperience} years`
                    : applicant.workStatus || "Fresher"}
                </div>
                {applicant.skills && (
                  <div className="pt-1">
                    <strong className="text-gray-700 block mb-1">Skills:</strong>
                    {renderSkills(applicant.skills)}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100 gap-2">
                {applicant.resumeUrl ? (
                  <a
                    href={applicant.resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition"
                  >
                    <FaFileDownload className="h-3 w-3 text-emerald-600" />
                    <span>Resume</span>
                  </a>
                ) : (
                  <span className="text-xs text-gray-400 italic">No Resume</span>
                )}

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleViewMore(applicant)}
                    className="rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 text-xs font-semibold transition flex items-center gap-1"
                  >
                    <FaFolderOpen className="h-3 w-3" /> Details
                  </button>
                  <button
                    onClick={() => handleNavigate(applicant._id)}
                    className="rounded-lg bg-blue-50 hover:bg-blue-100 text-[#0092d5] p-2 text-xs transition"
                    title="Assessment"
                  >
                    <FaTasks className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => handleShare(applicant._id)}
                    className="rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 p-2 text-xs transition"
                    title="Share"
                  >
                    <FaShareAlt className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => handleDeleteApplicant(applicant._id)}
                    className="rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 p-2 text-xs transition"
                    title="Delete"
                  >
                    <FaTrash className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Mobile Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <button
                className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 transition shadow-sm"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span className="text-xs text-gray-500 font-medium">
                Page {currentPage} of {totalPages}
              </span>
              <button
                className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 transition shadow-sm"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Desktop Table View */
        <div className="rounded-2xl border border-gray-200/90 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/70 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  <th className="px-4 py-3.5">Candidate Details</th>
                  <th className="px-4 py-3.5">Contact Info</th>
                  <th className="px-4 py-3.5">Applied Position</th>
                  <th className="px-4 py-3.5">Submission Date</th>
                  <th className="px-4 py-3.5">Experience</th>
                  <th className="px-4 py-3.5">Skills</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Resume</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
                {visibleApplicants.map((applicant) => (
                  <tr
                    key={applicant._id}
                    className="hover:bg-blue-50/20 transition-colors duration-150"
                  >
                    <td className="px-4 py-4">
                      <div className="font-bold text-gray-900">
                        {applicant.fullName || "Unnamed Candidate"}
                      </div>
                      <div className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                        <span className="text-[#0092d5] font-medium">
                          {applicant.candidateCategory || "Experienced"}
                        </span>
                        {applicant.referredBy && (
                          <span>· Ref: {applicant.referredBy}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-xs text-gray-700">
                      <div>{applicant.email || "—"}</div>
                      <div className="text-gray-400 text-[11px]">
                        {applicant.mobileNumber || "—"}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-xs font-semibold text-gray-800">
                      <div className="flex items-center gap-1.5">
                        <FaBriefcase className="h-3 w-3 text-[#0092d5]" />
                        <span>
                          {applicant.jobTitle ||
                            applicant.primarySkill ||
                            "General Application"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-xs text-gray-600 font-medium">
                      <div className="flex items-center gap-1.5">
                        <FaCalendarAlt className="h-3 w-3 text-gray-400" />
                        <span>{formatSubmissionDate(applicant)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-xs text-gray-700 font-medium whitespace-nowrap">
                      {applicant.yearsOfExperience
                        ? `${applicant.yearsOfExperience} yrs`
                        : applicant.workStatus || "Fresher"}
                    </td>
                    <td className="px-4 py-4">
                      {renderSkills(applicant.skills)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={getStatusClassName(applicant.status)}>
                        {applicant.status || "New"}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {applicant.resumeUrl ? (
                        <a
                          href={applicant.resumeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition"
                          title="View / Download Resume (AWS S3)"
                        >
                          <FaFileDownload className="h-3 w-3 text-emerald-600" />
                          <span>Resume</span>
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400 italic">None</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleViewMore(applicant)}
                          className="rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 transition"
                          title="View Application Details"
                        >
                          <FaFolderOpen className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleNavigate(applicant._id)}
                          className="rounded-lg bg-blue-50 hover:bg-blue-100 text-[#0092d5] p-2 transition"
                          title="Assign Assessment"
                        >
                          <FaTasks className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleShare(applicant._id)}
                          className="rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 p-2 transition"
                          title="Share Link"
                        >
                          <FaShareAlt className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteApplicant(applicant._id)}
                          className="rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 p-2 transition"
                          title="Delete Applicant"
                        >
                          <FaTrash className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Desktop Pagination */}
          <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 bg-gray-50/50">
            <div className="text-xs text-gray-500">
              Showing{" "}
              <span className="font-semibold text-gray-900">
                {filteredApplicants.length === 0 ? 0 : startIndex + 1}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-gray-900">
                {Math.min(endIndex, filteredApplicants.length)}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-900">
                {filteredApplicants.length}
              </span>{" "}
              applications
            </div>
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  className="rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-40 transition shadow-sm"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Prev
                </button>
                {[...Array(totalPages)].map((_, idx) => (
                  <button
                    key={idx}
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                      currentPage === idx + 1
                        ? "bg-[#0092d5] text-white"
                        : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-100"
                    }`}
                    onClick={() => goToPage(idx + 1)}
                  >
                    {idx + 1}
                  </button>
                ))}
                <button
                  className="rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-40 transition shadow-sm"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Selected Applicant Details Modal */}
      {selectedApplicant && (
        <div className="fixed inset-0 overflow-y-auto mt-20 z-50">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity">
              <div
                className="absolute inset-0 bg-gray-500 opacity-75"
                onClick={handleCloseModal}
              ></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-xl sm:w-full">
              <div className="bg-white px-5 pt-6 pb-5 sm:p-6 sm:pb-4 max-h-[80vh] overflow-y-auto">
                <div className="sm:flex sm:items-start">
                  <div className="w-full text-left">
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          Application Evaluation Details
                        </h3>
                        <p className="text-xs text-gray-500">
                          Review candidate submission and set assessment ratings
                        </p>
                      </div>
                      <button
                        onClick={handleCloseModal}
                        className="rounded-lg p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
                      >
                        <FaTimes className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      <table className="min-w-full divide-y divide-gray-200">
                        <tbody className="bg-white divide-y text-start divide-gray-100 text-xs sm:text-sm">
                          <tr>
                            <td className="py-2.5 font-bold text-gray-800">Candidate Name:</td>
                            <td className="py-2.5 text-gray-600">{selectedApplicant.fullName}</td>
                          </tr>
                          <tr>
                            <td className="py-2.5 font-bold text-gray-800">Email Address:</td>
                            <td className="py-2.5 text-gray-600">{selectedApplicant.email}</td>
                          </tr>
                          <tr>
                            <td className="py-2.5 font-bold text-gray-800">Mobile Number:</td>
                            <td className="py-2.5 text-gray-600">{selectedApplicant.mobileNumber}</td>
                          </tr>
                          <tr>
                            <td className="py-2.5 font-bold text-gray-800">Candidate Category:</td>
                            <td className="py-2.5 font-semibold text-[#0092d5]">
                              {selectedApplicant.candidateCategory || "Experienced"}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-2.5 font-bold text-gray-800">Applied Position:</td>
                            <td className="py-2.5 font-semibold text-gray-900">
                              {selectedApplicant.jobTitle ||
                                selectedApplicant.primarySkill ||
                                "General Application"}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-2.5 font-bold text-gray-800">Submission Date:</td>
                            <td className="py-2.5 text-gray-600">
                              {formatSubmissionDate(selectedApplicant)}
                            </td>
                          </tr>
                          {selectedApplicant.primarySkill && (
                            <tr>
                              <td className="py-2.5 font-bold text-gray-800">Primary Skill:</td>
                              <td className="py-2.5 text-gray-600">{selectedApplicant.primarySkill}</td>
                            </tr>
                          )}
                          {selectedApplicant.relevantExperience && (
                            <tr>
                              <td className="py-2.5 font-bold text-gray-800">Relevant Experience:</td>
                              <td className="py-2.5 text-gray-600">{selectedApplicant.relevantExperience} years</td>
                            </tr>
                          )}
                          {selectedApplicant.currentLocation && (
                            <tr>
                              <td className="py-2.5 font-bold text-gray-800">Locations:</td>
                              <td className="py-2.5 text-gray-600">
                                {selectedApplicant.currentLocation} / {selectedApplicant.preferredLocation} ({selectedApplicant.preferredWorkMode})
                              </td>
                            </tr>
                          )}
                          {selectedApplicant.noticePeriod && (
                            <tr>
                              <td className="py-2.5 font-bold text-gray-800">Notice Period:</td>
                              <td className="py-2.5 text-gray-600">{selectedApplicant.noticePeriod}</td>
                            </tr>
                          )}
                          {selectedApplicant.highestQualification && (
                            <tr>
                              <td className="py-2.5 font-bold text-gray-800">Highest Qualification:</td>
                              <td className="py-2.5 text-gray-600">
                                {selectedApplicant.highestQualification} ({selectedApplicant.graduationYear})
                              </td>
                            </tr>
                          )}
                          <tr>
                            <td className="py-2.5 font-bold text-gray-800">Employee Id:</td>
                            <td className="py-2.5 text-gray-600">{selectedApplicant.employeeNumber || "N/A"}</td>
                          </tr>
                          <tr>
                            <td className="py-2.5 font-bold text-gray-800">Tenth %:</td>
                            <td className="py-2.5 text-gray-600">{selectedApplicant.tenthPercentage || "N/A"}</td>
                          </tr>
                          <tr>
                            <td className="py-2.5 font-bold text-gray-800">Twelfth %:</td>
                            <td className="py-2.5 text-gray-600">{selectedApplicant.twelthPercentage || "N/A"}</td>
                          </tr>
                          <tr>
                            <td className="py-2.5 font-bold text-gray-800">Twelfth College:</td>
                            <td className="py-2.5 text-gray-600">{selectedApplicant.twelthCollegeName || "N/A"}</td>
                          </tr>
                          <tr>
                            <td className="py-2.5 font-bold text-gray-800">Degree Name:</td>
                            <td className="py-2.5 text-gray-600">{selectedApplicant.degreeName || "N/A"}</td>
                          </tr>
                          <tr>
                            <td className="py-2.5 font-bold text-gray-800">Degree %:</td>
                            <td className="py-2.5 text-gray-600">{selectedApplicant.degreePercentage || "N/A"}</td>
                          </tr>
                          <tr>
                            <td className="py-2.5 font-bold text-gray-800">Degree College:</td>
                            <td className="py-2.5 text-gray-600">{selectedApplicant.degreeCollegeName || "N/A"}</td>
                          </tr>
                          <tr>
                            <td className="py-2.5 font-bold text-gray-800">Year Of Passing:</td>
                            <td className="py-2.5 text-gray-600">{selectedApplicant.yearOfPassing || "N/A"}</td>
                          </tr>
                          {selectedApplicant.mockInterviewDate && (
                            <tr>
                              <td className="py-2.5 font-bold text-gray-800">Mock Interview Date:</td>
                              <td className="py-2.5 text-gray-600">{selectedApplicant.mockInterviewDate}</td>
                            </tr>
                          )}
                          {selectedApplicant.mockInterviewTime && (
                            <tr>
                              <td className="py-2.5 font-bold text-gray-800">Mock Interview Time:</td>
                              <td className="py-2.5 text-gray-600">{selectedApplicant.mockInterviewTime}</td>
                            </tr>
                          )}
                          {selectedApplicant.resumeUrl && (
                            <tr>
                              <td className="py-2.5 font-bold text-gray-800">Resume Document:</td>
                              <td className="py-2.5">
                                <a
                                  href={selectedApplicant.resumeUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition shadow-sm"
                                >
                                  <FaFileDownload className="h-3 w-3 text-emerald-600" />
                                  <span>View / Download Resume (AWS S3)</span>
                                </a>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>

                      {/* Evaluation Form Fields */}
                      <div className="pt-4 border-t border-gray-100 space-y-4">
                        <div>
                          <label className="mb-1 block text-xs font-bold text-gray-700" htmlFor="rating">
                            Overall Assessment Rating:
                          </label>
                          <select
                            id="rating"
                            value={selectedApplicant.rating ?? ""}
                            onChange={(e) =>
                              handleFieldChange("rating", parseInt(e.target.value))
                            }
                            className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs sm:text-sm focus:border-[#0092d5] focus:outline-none"
                          >
                            <option value="" disabled>Select rating (1 to 5)</option>
                            {[1, 2, 3, 4, 5].map((val) => (
                              <option key={val} value={val}>{val} Star{val > 1 ? "s" : ""}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label
                            className="mb-1 block text-xs font-bold text-gray-700"
                            htmlFor="communicationSkillRating"
                          >
                            Communication Skills Rating:
                          </label>
                          <select
                            id="communicationSkillRating"
                            value={selectedApplicant.communicationSkillRating ?? ""}
                            onChange={(e) =>
                              handleFieldChange(
                                "communicationSkillRating",
                                parseInt(e.target.value)
                              )
                            }
                            className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs sm:text-sm focus:border-[#0092d5] focus:outline-none"
                          >
                            <option value="" disabled>Select rating (1 to 5)</option>
                            {[1, 2, 3, 4, 5].map((val) => (
                              <option key={val} value={val}>{val} Star{val > 1 ? "s" : ""}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label
                            className="mb-1 block text-xs font-bold text-gray-700"
                            htmlFor="technicalRoundComments"
                          >
                            Technical Round Comments:
                          </label>
                          <textarea
                            id="technicalRoundComments"
                            rows="2"
                            value={selectedApplicant.technicalRoundComments || ""}
                            onChange={(e) =>
                              handleFieldChange(
                                "technicalRoundComments",
                                e.target.value
                              )
                            }
                            className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs sm:text-sm focus:border-[#0092d5] focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-xs font-bold text-gray-700" htmlFor="comments">
                            General Review Comments:
                          </label>
                          <textarea
                            id="comments"
                            rows="2"
                            value={selectedApplicant.comments || ""}
                            onChange={(e) =>
                              handleFieldChange("comments", e.target.value)
                            }
                            className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs sm:text-sm focus:border-[#0092d5] focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-xs font-bold text-gray-700" htmlFor="status">
                            Application Status:
                          </label>
                          <select
                            id="status"
                            value={selectedApplicant.status ?? ""}
                            onChange={(e) =>
                              handleFieldChange("status", e.target.value)
                            }
                            className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs sm:text-sm focus:border-[#0092d5] focus:outline-none"
                          >
                            <option value="" disabled>Select status</option>
                            {[
                              "Submitted",
                              "New",
                              "Verified",
                              "Mock Interview Done",
                              "Assessment Assigned",
                              "Assessment Submitted",
                              "Rejected",
                            ].map((st) => (
                              <option key={st} value={st}>{st}</option>
                            ))}
                          </select>
                        </div>

                        {selectedApplicant.status === "Mock Interview Done" && (
                          <div>
                            <label
                              className="mb-1 block text-xs font-bold text-gray-700"
                              htmlFor="mockInterviewFeedback"
                            >
                              Mock Interview Feedback:
                            </label>
                            <textarea
                              id="mockInterviewFeedback"
                              rows="2"
                              value={selectedApplicant.mockInterviewFeedback || ""}
                              onChange={(e) =>
                                handleFieldChange(
                                  "mockInterviewFeedback",
                                  e.target.value
                                )
                              }
                              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs sm:text-sm focus:border-[#0092d5] focus:outline-none"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="bg-gray-50 px-5 py-3 sm:px-6 flex flex-row-reverse gap-2 border-t border-gray-100">
                <button
                  onClick={handleSaveChanges}
                  className="rounded-xl bg-[#0092d5] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#007bb5] transition"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsultancyApplications;
