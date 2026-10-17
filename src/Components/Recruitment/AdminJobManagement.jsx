import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import baseURL from "../../Common/Api";
import {
  FaBriefcase,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaFilter,
  FaGlobe,
  FaEyeSlash,
  FaCheckCircle,
  FaTimes,
  FaSpinner,
  FaMapMarkerAlt,
  FaClock,
  FaCalendarAlt,
  FaBuilding,
  FaUsers,
  FaMoneyBillWave,
  FaSyncAlt,
} from "react-icons/fa";

const CATEGORIES = [
  "SAP & Oracle",
  "Integration & Cloud",
  "Software Development",
  "Data & Analytics",
];

const WORK_MODES = ["On-site", "Hybrid", "Remote"];
const EMPLOYMENT_TYPES = ["Full-time", "Contract", "Part-time", "Internship"];

const initialFormState = {
  title: "",
  companyName: "Tekisky Pvt. Ltd.",
  category: "Software Development",
  department: "",
  primarySkill: "",
  experience: "3–5 years",
  minExperience: 3,
  maxExperience: 5,
  relevantExperience: "",
  skills: "",
  qualifications: "",
  location: "Pune, India",
  workMode: "Hybrid",
  employmentType: "Full-time",
  openings: 1,
  salaryRange: "",
  deadline: "",
  description: "",
  responsibilities: "",
  requirements: "",
  status: "Published",
};

const AdminJobManagement = ({ onMetricsUpdate }) => {
  const API_BASE = baseURL.endsWith("/") ? baseURL : `${baseURL}/`;
  const token = localStorage.getItem("token") || "";

  const [jobs, setJobs] = useState([]);
  const [metrics, setMetrics] = useState({
    totalJobs: 0,
    publishedJobs: 0,
    draftJobs: 0,
    closedJobs: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterWorkMode, setFilterWorkMode] = useState("All");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJobId, setEditingJobId] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState({});

  // Auth headers
  const getAuthHeaders = () => ({
    headers: {
      Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}`,
    },
  });

  // Fetch all jobs for admin dashboard 
  const fetchAdminJobs = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterStatus !== "All") params.status = filterStatus;
      if (filterCategory !== "All") params.category = filterCategory;
      if (filterWorkMode !== "All") params.workMode = filterWorkMode;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await axios.get(`${API_BASE}consultancy/admin/jobs`, {
        ...getAuthHeaders(),
        params,
      });

      if (res.data) {
        setJobs(res.data.jobs || []);
        if (res.data.metrics) {
          setMetrics(res.data.metrics);
          if (typeof onMetricsUpdate === "function") {
            onMetricsUpdate(res.data.metrics);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching admin jobs:", error);
      Swal.fire({
        icon: "error",
        title: "Failed to Load Jobs",
        text:
          error.response?.data?.error ||
          "Could not retrieve recruitment vacancies. Please verify your session.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminJobs();
  }, [filterStatus, filterCategory, filterWorkMode]);

  // Handle Search on Submit or Enter
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchAdminJobs();
  };

  // Open modal for Create
  const handleOpenCreateModal = () => {
    setEditingJobId(null);
    setFormData(initialFormState);
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEditModal = (job) => {
    setEditingJobId(job._id);
    setFormData({
      title: job.title || "",
      companyName: job.companyName || "Tekisky Pvt. Ltd.",
      category: job.category || "Software Development",
      department: job.department || "",
      primarySkill: job.primarySkill || "",
      experience: job.experience || "",
      minExperience: job.minExperience || 0,
      maxExperience: job.maxExperience || 0,
      relevantExperience: job.relevantExperience || "",
      skills: Array.isArray(job.skills) ? job.skills.join(", ") : "",
      qualifications: Array.isArray(job.qualifications)
        ? job.qualifications.join(", ")
        : "",
      location: job.location || "Pune, India",
      workMode: job.workMode || "Hybrid",
      employmentType: job.employmentType || "Full-time",
      openings: job.openings || 1,
      salaryRange: job.salaryRange || "",
      deadline: job.deadline ? job.deadline.slice(0, 10) : "",
      description: job.description || "",
      responsibilities: Array.isArray(job.responsibilities)
        ? job.responsibilities.join("\n")
        : "",
      requirements: Array.isArray(job.requirements)
        ? job.requirements.join("\n")
        : "",
      status: job.status || "Published",
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Input change handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  // Form Validation
  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = "Job title is required.";
    if (!formData.primarySkill.trim())
      errors.primarySkill = "Primary technical skill is required.";
    if (!formData.experience.trim())
      errors.experience = "Experience range is required (e.g., 3–5 years).";
    if (!formData.skills.trim())
      errors.skills = "At least one skill is required (comma-separated).";
    if (!formData.location.trim()) errors.location = "Job location is required.";
    if (!formData.description.trim())
      errors.description = "Job description is required.";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Save (Create or Update)
  const handleSaveJob = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      Swal.fire({
        icon: "warning",
        title: "Required Fields Missing",
        text: "Please fill in all mandatory job details before saving.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        openings: Number(formData.openings) || 1,
        minExperience: Number(formData.minExperience) || 0,
        maxExperience: Number(formData.maxExperience) || 0,
      };

      if (editingJobId) {
        // Update Job
        await axios.put(
          `${API_BASE}consultancy/admin/jobs/${editingJobId}`,
          payload,
          getAuthHeaders()
        );
        Swal.fire({
          icon: "success",
          title: "Job Updated",
          text: "Job posting details updated successfully in database.",
          timer: 1800,
          showConfirmButton: false,
        });
      } else {
        // Create Job
        await axios.post(
          `${API_BASE}consultancy/admin/jobs`,
          payload,
          getAuthHeaders()
        );
        Swal.fire({
          icon: "success",
          title: "Job Created",
          text:
            formData.status === "Published"
              ? "New job posting has been published and is now live on the careers portal!"
              : "Job saved as draft successfully.",
          timer: 2000,
          showConfirmButton: false,
        });
      }

      setIsModalOpen(false);
      fetchAdminJobs();
    } catch (error) {
      console.error("Error saving job:", error);
      Swal.fire({
        icon: "error",
        title: "Failed to Save Job",
        text:
          error.response?.data?.error ||
          "An error occurred while saving to the database. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick Status Transition (Publish / Draft / Close)
  const handleStatusChange = async (jobId, newStatus) => {
    try {
      await axios.patch(
        `${API_BASE}consultancy/admin/jobs/${jobId}/status`,
        { status: newStatus },
        getAuthHeaders()
      );

      setJobs((prev) =>
        prev.map((j) => (j._id === jobId ? { ...j, status: newStatus } : j))
      );

      Swal.fire({
        icon: "success",
        title: "Status Updated",
        text: `Job posting is now marked as "${newStatus}".`,
        timer: 1500,
        showConfirmButton: false,
      });

      fetchAdminJobs();
    } catch (error) {
      console.error("Error changing status:", error);
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: error.response?.data?.error || "Could not change status.",
      });
    }
  };

  // Delete Job with Confirmation Dialog
  const handleDeleteJob = async (job) => {
    const result = await Swal.fire({
      title: "Delete Job Posting?",
      html: `Are you sure you want to delete <b>"${job.title}"</b>?<br/><span style="color:#ef4444;font-size:12px;">This action is permanent and cannot be undone.</span>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, Delete Job",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(
          `${API_BASE}consultancy/admin/jobs/${job._id}`,
          getAuthHeaders()
        );

        Swal.fire({
          icon: "success",
          title: "Job Deleted",
          text: `"${job.title}" was removed from the database.`,
          timer: 1800,
          showConfirmButton: false,
        });

        fetchAdminJobs();
      } catch (error) {
        console.error("Error deleting job:", error);
        Swal.fire({
          icon: "error",
          title: "Delete Failed",
          text: error.response?.data?.error || "Could not delete job opening.",
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* ========================================================
          1. STATS / METRICS BANNER
         ======================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Jobs */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Total Postings
              </p>
              <h3 className="text-2xl font-extrabold text-gray-900 mt-1">
                {metrics.totalJobs}
              </h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-[#0092d5]">
              <FaBriefcase className="h-6 w-6" />
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-400">All database job records</p>
        </div>

        {/* Published / Active Jobs */}
        <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/30 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                Live & Published
              </p>
              <h3 className="text-2xl font-extrabold text-emerald-900 mt-1">
                {metrics.publishedJobs}
              </h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <FaGlobe className="h-6 w-6" />
            </div>
          </div>
          <p className="mt-3 text-xs text-emerald-600/80">
            Visible to public candidates
          </p>
        </div>

        {/* Drafts */}
        <div className="rounded-2xl border border-amber-200/80 bg-amber-50/30 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">
                Drafts (Unpublished)
              </p>
              <h3 className="text-2xl font-extrabold text-amber-900 mt-1">
                {metrics.draftJobs}
              </h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <FaEyeSlash className="h-6 w-6" />
            </div>
          </div>
          <p className="mt-3 text-xs text-amber-600/80">Pending recruiter review</p>
        </div>

        {/* Closed */}
        <div className="rounded-2xl border border-gray-200 bg-gray-50/60 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-600">
                Closed Positions
              </p>
              <h3 className="text-2xl font-extrabold text-gray-800 mt-1">
                {metrics.closedJobs}
              </h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-200 text-gray-600">
              <FaCheckCircle className="h-6 w-6" />
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-400">Archived from public portal</p>
        </div>
      </div>

      {/* ========================================================
          2. ACTION TOOLBAR & FILTERS
         ======================================================== */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Search bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex-1 relative max-w-lg"
          >
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search postings by title, skill, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-gray-300 pl-10 pr-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-[#0092d5] focus:outline-none focus:ring-1 focus:ring-[#0092d5]"
            />
          </form>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <button
              onClick={fetchAdminJobs}
              title="Refresh Listings"
              className="rounded-xl border border-gray-300 p-2.5 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition"
            >
              <FaSyncAlt className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={handleOpenCreateModal}
              className="flex items-center gap-2 rounded-xl bg-[#0092d5] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#007bb5] transition"
            >
              <FaPlus className="h-3.5 w-3.5" /> Post New Job
            </button>
          </div>
        </div>

        {/* Filter dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-gray-100">
          {/* Status filter */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Status Filter
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 bg-white focus:border-[#0092d5] focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Published">Published Only</option>
              <option value="Draft">Drafts Only</option>
              <option value="Closed">Closed Only</option>
            </select>
          </div>

          {/* Category filter */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Category / Domain
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 bg-white focus:border-[#0092d5] focus:outline-none"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Work mode filter */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Work Mode
            </label>
            <select
              value={filterWorkMode}
              onChange={(e) => setFilterWorkMode(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 bg-white focus:border-[#0092d5] focus:outline-none"
            >
              <option value="All">All Work Modes</option>
              {WORK_MODES.map((mode) => (
                <option key={mode} value={mode}>
                  {mode}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ========================================================
          3. JOBS LIST / TABLE
         ======================================================== */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <FaSpinner className="mx-auto h-8 w-8 animate-spin text-[#0092d5]" />
            <p className="mt-3 text-sm text-gray-500">Loading job postings...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="py-16 text-center px-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-[#0092d5] mb-4">
              <FaBriefcase className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              No job postings found
            </h3>
            <p className="mt-1 text-sm text-gray-500 max-w-sm mx-auto">
              There are currently no job postings in this view. Click &quot;Post New
              Job&quot; to add a verified enterprise requirement.
            </p>
            <button
              onClick={handleOpenCreateModal}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#0092d5] px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#007bb5] transition"
            >
              <FaPlus className="h-3 w-3" /> Post First Job Vacancy
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-600">
                    Job Title & Role
                  </th>
                  <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-600">
                    Domain / Mode
                  </th>
                  <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-600">
                    Experience & Location
                  </th>
                  <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-600">
                    Status
                  </th>
                  <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-600">
                    Posting Date
                  </th>
                  <th className="px-6 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white text-sm">
                {jobs.map((job) => (
                  <tr
                    key={job._id}
                    className="hover:bg-blue-50/30 transition-colors"
                  >
                    {/* Title */}
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{job.title}</div>
                      <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
                        <span>{job.companyName || "Tekisky Pvt. Ltd."}</span>
                        <span>·</span>
                        <span className="font-mono text-[11px] text-[#0092d5]">
                          {job.primarySkill}
                        </span>
                      </div>
                    </td>

                    {/* Domain / Mode */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 items-start">
                        <span className="inline-block rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-[#0092d5]">
                          {job.category}
                        </span>
                        <span className="text-xs text-gray-500">
                          {job.workMode} · {job.employmentType || "Full-time"}
                        </span>
                      </div>
                    </td>

                    {/* Experience & Location */}
                    <td className="px-6 py-4">
                      <div className="text-gray-900 font-medium">
                        {job.experience}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <FaMapMarkerAlt className="h-3 w-3 text-gray-400" />
                        {job.location}
                      </div>
                    </td>

                    {/* Status Badge & Quick Toggle */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <select
                          value={job.status}
                          onChange={(e) =>
                            handleStatusChange(job._id, e.target.value)
                          }
                          className={`rounded-lg px-2.5 py-1 text-xs font-bold border focus:outline-none ${
                            job.status === "Published"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                              : job.status === "Draft"
                              ? "bg-amber-50 text-amber-700 border-amber-300"
                              : "bg-gray-100 text-gray-700 border-gray-300"
                          }`}
                        >
                          <option value="Published">Live / Published</option>
                          <option value="Draft">Draft (Unpublished)</option>
                          <option value="Closed">Closed / Filled</option>
                        </select>
                      </div>
                    </td>

                    {/* Dates */}
                    <td className="px-6 py-4 text-xs text-gray-500">
                      <div>
                        {job.postedDate
                          ? new Date(job.postedDate).toLocaleDateString()
                          : "Not Published"}
                      </div>
                      {job.deadline && (
                        <div className="text-red-500 text-[11px] mt-0.5">
                          Deadline: {new Date(job.deadline).toLocaleDateString()}
                        </div>
                      )}
                    </td>

                    {/* Action buttons */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(job)}
                          title="Edit Job Posting"
                          className="rounded-lg p-2 text-blue-600 hover:bg-blue-50 transition"
                        >
                          <FaEdit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteJob(job)}
                          title="Delete Job Posting"
                          className="rounded-lg p-2 text-red-500 hover:bg-red-50 transition"
                        >
                          <FaTrash className="h-4 w-4" />
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
          4. CREATE / EDIT JOB MODAL
         ======================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-3xl rounded-2xl bg-white shadow-2xl my-8 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 p-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#0092d5]">
                  {editingJobId ? "Update Vacancy" : "Create Vacancy"}
                </span>
                <h3 className="text-xl font-bold text-gray-900 mt-0.5">
                  {editingJobId
                    ? "Edit Job Posting"
                    : "Add New Recruitment Requirement"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"
              >
                <FaTimes className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form
              onSubmit={handleSaveJob}
              className="flex-1 overflow-y-auto p-6 space-y-6"
            >
              {/* Section 1: Core Identity */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                  1. Job Title & Categorization
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Job Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      placeholder="e.g. Senior SAP CPI / BTP Integration Consultant"
                      value={formData.title}
                      onChange={handleInputChange}
                      className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 ${
                        formErrors.title
                          ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:border-[#0092d5] focus:ring-[#0092d5]"
                      }`}
                    />
                    {formErrors.title && (
                      <p className="mt-1 text-xs text-red-500">
                        {formErrors.title}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Company Name
                    </label>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-gray-300 px-3.5 py-2 text-sm text-gray-900 focus:border-[#0092d5] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Department / Domain <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-gray-300 px-3.5 py-2 text-sm text-gray-900 bg-white focus:border-[#0092d5] focus:outline-none"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Primary Technical Skill / Role{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="primarySkill"
                      placeholder="e.g. SAP CPI / BTP, MERN Stack, React & Node.js"
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
                </div>
              </div>

              {/* Section 2: Experience & Work Arrangement */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                  2. Work Arrangement & Logistics
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Experience Range <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="experience"
                      placeholder="e.g. 5–10 years, 0–1 years"
                      value={formData.experience}
                      onChange={handleInputChange}
                      className={`w-full rounded-xl border px-3.5 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 ${
                        formErrors.experience
                          ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:border-[#0092d5] focus:ring-[#0092d5]"
                      }`}
                    />
                    {formErrors.experience && (
                      <p className="mt-1 text-xs text-red-500">
                        {formErrors.experience}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Work Mode <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="workMode"
                      value={formData.workMode}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-gray-300 px-3.5 py-2 text-sm text-gray-900 bg-white focus:border-[#0092d5] focus:outline-none"
                    >
                      {WORK_MODES.map((mode) => (
                        <option key={mode} value={mode}>
                          {mode}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Employment Type
                    </label>
                    <select
                      name="employmentType"
                      value={formData.employmentType}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-gray-300 px-3.5 py-2 text-sm text-gray-900 bg-white focus:border-[#0092d5] focus:outline-none"
                    >
                      {EMPLOYMENT_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Job Location <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="location"
                      placeholder="e.g. Pune, Hyderabad, Remote"
                      value={formData.location}
                      onChange={handleInputChange}
                      className={`w-full rounded-xl border px-3.5 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 ${
                        formErrors.location
                          ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:border-[#0092d5] focus:ring-[#0092d5]"
                      }`}
                    />
                    {formErrors.location && (
                      <p className="mt-1 text-xs text-red-500">
                        {formErrors.location}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Number of Openings
                    </label>
                    <input
                      type="number"
                      name="openings"
                      min="1"
                      value={formData.openings}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-gray-300 px-3.5 py-2 text-sm text-gray-900 focus:border-[#0092d5] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Salary / CTC Range (Optional)
                    </label>
                    <input
                      type="text"
                      name="salaryRange"
                      placeholder="e.g. 10–18 LPA / Best in Industry"
                      value={formData.salaryRange}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-gray-300 px-3.5 py-2 text-sm text-gray-900 focus:border-[#0092d5] focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Application Deadline (Optional)
                    </label>
                    <input
                      type="date"
                      name="deadline"
                      value={formData.deadline}
                      onChange={handleInputChange}
                      className="w-full sm:w-1/2 rounded-xl border border-gray-300 px-3.5 py-2 text-sm text-gray-900 focus:border-[#0092d5] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Skills & Criteria */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                  3. Skills & Qualifications
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Required Skills (Comma-separated){" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="skills"
                      placeholder="e.g. SAP CPI, Groovy Script, REST APIs, OData, Cloud Integration"
                      value={formData.skills}
                      onChange={handleInputChange}
                      className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 ${
                        formErrors.skills
                          ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:border-[#0092d5] focus:ring-[#0092d5]"
                      }`}
                    />
                    {formErrors.skills && (
                      <p className="mt-1 text-xs text-red-500">
                        {formErrors.skills}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Required Qualifications (Comma-separated)
                    </label>
                    <input
                      type="text"
                      name="qualifications"
                      placeholder="e.g. B.E. / B.Tech / MCA / M.Sc Computer Science"
                      value={formData.qualifications}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-gray-300 px-3.5 py-2 text-sm text-gray-900 focus:border-[#0092d5] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Descriptions & Responsibilities */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                  4. Job Description & Responsibilities
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Job Summary / Description{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="description"
                      rows={3}
                      placeholder="Provide an overview of the role, team, and key mandate objectives..."
                      value={formData.description}
                      onChange={handleInputChange}
                      className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 ${
                        formErrors.description
                          ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:border-[#0092d5] focus:ring-[#0092d5]"
                      }`}
                    />
                    {formErrors.description && (
                      <p className="mt-1 text-xs text-red-500">
                        {formErrors.description}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Key Responsibilities (One item per line)
                    </label>
                    <textarea
                      name="responsibilities"
                      rows={4}
                      placeholder="Architect and develop end-to-end integration flows&#10;Configure enterprise adapters and message security&#10;Troubleshoot interface errors and provide Level-3 technical support"
                      value={formData.responsibilities}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-gray-300 px-3.5 py-2 text-sm text-gray-900 focus:border-[#0092d5] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Key Requirements & Qualifications (One item per line)
                    </label>
                    <textarea
                      name="requirements"
                      rows={3}
                      placeholder="Minimum 4 years in production cloud integration&#10;Hands-on Groovy scripting and XSLT mapping&#10;Solid client communication skills"
                      value={formData.requirements}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-gray-300 px-3.5 py-2 text-sm text-gray-900 focus:border-[#0092d5] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 5: Publication Status */}
              <div className="rounded-xl bg-gray-50 p-4 border border-gray-200">
                <label className="block text-xs font-bold text-gray-800 mb-2">
                  Publication Status
                </label>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="Published"
                      checked={formData.status === "Published"}
                      onChange={handleInputChange}
                      className="text-[#0092d5] focus:ring-[#0092d5]"
                    />
                    <span className="text-xs font-semibold text-gray-800">
                      Publish Immediately (Live on Careers page)
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="Draft"
                      checked={formData.status === "Draft"}
                      onChange={handleInputChange}
                      className="text-[#0092d5] focus:ring-[#0092d5]"
                    />
                    <span className="text-xs font-semibold text-gray-800">
                      Save as Draft (Visible only to admin)
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="Closed"
                      checked={formData.status === "Closed"}
                      onChange={handleInputChange}
                      className="text-[#0092d5] focus:ring-[#0092d5]"
                    />
                    <span className="text-xs font-semibold text-gray-800">
                      Closed Position
                    </span>
                  </label>
                </div>
              </div>

              {/* Modal Footer / CTAs */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-gray-300 px-5 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 rounded-xl bg-[#0092d5] px-6 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#007bb5] transition disabled:opacity-50"
                >
                  {isSubmitting && <FaSpinner className="animate-spin h-3.5 w-3.5" />}
                  <span>
                    {editingJobId
                      ? "Save Changes"
                      : formData.status === "Published"
                      ? "Publish Job Opening"
                      : "Save as Draft"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminJobManagement;
