import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import AddStudentModal from "../Components/AddStudentModal";
import AddUserModel from "../Components/AddUserModel";
import ConsultancyApplications from "../Components/ConsultancyApplications";
import baseURL from "../Common/Api";
import AdminJobManagement from "../Components/Recruitment/AdminJobManagement";
import {
  FaBriefcase,
  FaFileAlt,
  FaGraduationCap,
  FaUsers,
  FaPlus,
  FaEdit,
  FaTrash,
  FaCheck,
  FaTimes,
  FaSearch,
  FaSyncAlt,
  FaSpinner,
  FaShieldAlt,
  FaBuilding,
  FaUserTie,
  FaEnvelope,
  FaPhone,
  FaArrowRight,
  FaCheckCircle,
  FaBars,
  FaChevronRight,
} from "react-icons/fa";

const Dashboard = () => {
  const navigate = useNavigate();
  const API_BASE = baseURL.endsWith("/") ? baseURL : `${baseURL}/`;

  // Main Data States (All backed by live Database)
  const [students, setStudents] = useState([]);
  const [users, setUsers] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [jobMetrics, setJobMetrics] = useState({
    totalJobs: 0,
    publishedJobs: 0,
    draftJobs: 0,
    closedJobs: 0,
  });

  // Modals & Controls
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [token, setToken] = useState("");
  const [displayedStudents, setDisplayedStudents] = useState(8);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Search Filters for Alumni & Users
  const [searchStudent, setSearchStudent] = useState("");
  const [searchUser, setSearchUser] = useState("");

  // Tab State (defaults to 'jobs', syncs with query param ?tab=...)
  const [activeTab, setActiveTab] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("tab") || "jobs";
  });

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    const url = new URL(window.location);
    url.searchParams.set("tab", tab);
    window.history.replaceState({}, "", url);
  };

  // Auth Header Helper
  const getAuthHeader = () => {
    const stored = token || localStorage.getItem("token") || "";
    return stored.startsWith("Bearer ") ? stored : `Bearer ${stored}`;
  };

  // Verify Admin Authentication & Setup Session Timer
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUserType = localStorage.getItem("userType");

    if (!storedToken || storedUserType !== "admin") {
      Swal.fire({
        title: "Admin Access Required",
        text: "Please login with an authorized administrator account to view the dashboard.",
        icon: "warning",
        confirmButtonColor: "#0092d5",
        confirmButtonText: "Go to Login",
      }).then(() => {
        navigate("/login");
      });
      return;
    }

    setToken(storedToken);

    // Session auto-logout timeout (10 hours)
    const logoutTimeout = 10 * 60 * 60 * 1000;
    const timeoutId = setTimeout(() => {
      localStorage.removeItem("token");
      Swal.fire({
        title: "Session Expired",
        text: "Your administrator session has expired. Please login again.",
        icon: "info",
        confirmButtonColor: "#0092d5",
        confirmButtonText: "OK",
      }).then(() => {
        navigate("/login");
      });
    }, logoutTimeout);

    return () => clearTimeout(timeoutId);
  }, [navigate]);

  // Screen resize listener for responsive layout
  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch Recruitment Jobs Metrics
  const fetchJobsMetrics = async () => {
    try {
      const res = await axios.get(`${API_BASE}consultancy/admin/jobs`, {
        headers: { Authorization: getAuthHeader() },
      });
      if (res.data && res.data.metrics) {
        setJobMetrics(res.data.metrics);
      }
    } catch (error) {
      console.error("Error fetching job metrics:", error);
    }
  };

  // Fetch Consultancy Applications
  const fetchApplicants = async () => {
    try {
      const res = await axios.get(`${API_BASE}consultancy/getAllUploadResume`, {
        headers: { Authorization: getAuthHeader() },
      });
      if (Array.isArray(res.data)) {
        setApplicants(res.data);
      }
    } catch (error) {
      console.error("Error fetching applicants:", error);
    }
  };

  // Fetch Alumni (Selected Students)
  const fetchStudents = async () => {
    try {
      const res = await axios.get(
        `${API_BASE}selectedStudent/getSelectedStudent`,
        { headers: { Authorization: getAuthHeader() } }
      );
      if (Array.isArray(res.data)) {
        setStudents([...res.data].reverse());
      }
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  // Fetch Users
  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_BASE}user/getAllUsers`, {
        headers: { Authorization: getAuthHeader() },
      });
      const userList = res.data?.users?.users || [];
      setUsers(userList);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // Load All 4 Sections on Initial Mount
  useEffect(() => {
    if (token) {
      fetchJobsMetrics();
      fetchApplicants();
      fetchStudents();
      fetchUsers();
    }
  }, [token]);

  // Master Refresh Button
  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    await Promise.allSettled([
      fetchJobsMetrics(),
      fetchApplicants(),
      fetchStudents(),
      fetchUsers(),
    ]);
    setIsRefreshing(false);
    Swal.fire({
      icon: "success",
      title: "Data Refreshed",
      text: "All dashboard metrics and database collections are up to date.",
      timer: 1400,
      showConfirmButton: false,
    });
  };

  // ==========================================
  // Student Actions (Edit / Delete / Pagination)
  // ==========================================
  const [editIndex, setEditIndex] = useState(null);
  const [editedStudent, setEditedStudent] = useState({
    name: "",
    companyName: "",
    designation: "",
    education: "",
  });

  const handleEditStudent = (index, student) => {
    setEditIndex(index);
    setEditedStudent({
      name: student.name || "",
      companyName: student.companyName || "",
      designation: student.designation || "",
      education: student.education || "",
    });
  };

  const handleEditChange = (field, value) => {
    setEditedStudent((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveStudent = async (index, id) => {
    try {
      await axios.put(
        `${API_BASE}selectedStudent/update/${id}`,
        editedStudent,
        { headers: { Authorization: getAuthHeader() } }
      );
      const updatedStudents = [...students];
      updatedStudents[index] = { ...updatedStudents[index], ...editedStudent };
      setStudents(updatedStudents);
      setEditIndex(null);
      Swal.fire({
        icon: "success",
        title: "Student Updated",
        text: "Alumni record updated successfully in database.",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error updating student data:", error);
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: error.response?.data?.error || "Could not update student record.",
      });
    }
  };

  const handleCancelEdit = () => {
    setEditIndex(null);
    setEditedStudent({
      name: "",
      companyName: "",
      designation: "",
      education: "",
    });
  };

  const handleDeleteStudent = async (student) => {
    const result = await Swal.fire({
      title: "Delete Alumni Record?",
      html: `Are you sure you want to remove <b>${student.name}</b> from the placed alumni list?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, Delete Record",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_BASE}selectedStudent/delete/${student._id}`, {
          headers: { Authorization: getAuthHeader() },
        });
        setStudents((prev) => prev.filter((s) => s._id !== student._id));
        Swal.fire({
          icon: "success",
          title: "Record Deleted",
          text: `"${student.name}" has been removed from database.`,
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (error) {
        console.error("Error deleting student:", error);
        Swal.fire({
          icon: "error",
          title: "Delete Failed",
          text: error.response?.data?.error || "Could not delete student record.",
        });
      }
    }
  };

  // ==========================================
  // User Actions (Delete)
  // ==========================================
  const handleDeleteUser = async (user) => {
    const result = await Swal.fire({
      title: "Delete Platform User?",
      html: `Are you sure you want to remove user <b>${user.fullName || user.email}</b>?<br/><span style="color:#ef4444;font-size:12px;">This account will permanently lose access.</span>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, Delete User",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_BASE}user/delete/${user._id}`, {
          headers: { Authorization: getAuthHeader() },
        });
        setUsers((prev) => prev.filter((u) => u._id !== user._id));
        Swal.fire({
          icon: "success",
          title: "User Removed",
          text: `Account "${user.fullName || user.email}" was deleted from database.`,
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (error) {
        console.error("Error deleting user:", error);
        Swal.fire({
          icon: "error",
          title: "Delete Failed",
          text: error.response?.data?.error || "Could not delete user account.",
        });
      }
    }
  };

  // Filtered Lists for Alumni & Users
  const filteredStudents = students.filter((s) => {
    const q = searchStudent.toLowerCase().trim();
    if (!q) return true;
    return (
      (s.name && s.name.toLowerCase().includes(q)) ||
      (s.companyName && s.companyName.toLowerCase().includes(q)) ||
      (s.designation && s.designation.toLowerCase().includes(q)) ||
      (s.education && s.education.toLowerCase().includes(q))
    );
  });

  const filteredUsers = users.filter((u) => {
    const q = searchUser.toLowerCase().trim();
    if (!q) return true;
    return (
      (u.fullName && u.fullName.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.mobileNumber && u.mobileNumber.toLowerCase().includes(q)) ||
      (u.userType && u.userType.toLowerCase().includes(q))
    );
  });

  // Vertical Navigation Menu Items
  const menuItems = [
    {
      id: "jobs",
      label: "Recruitment Jobs",
      icon: FaBriefcase,
      count: jobMetrics.totalJobs,
      description: "Manage vacancies & job listings",
    },
    {
      id: "consultancy",
      label: "Consultancy Applications",
      icon: FaFileAlt,
      count: applicants.length,
      description: "Candidate resumes & reviews",
    },
    {
      id: "alumni",
      label: "Alumni",
      icon: FaGraduationCap,
      count: students.length,
      description: "Placed students & companies",
    },
    {
      id: "users",
      label: "Users",
      icon: FaUsers,
      count: users.length,
      description: "Platform accounts & roles",
    },
  ];

  const currentMenuItem =
    menuItems.find((item) => item.id === activeTab) || menuItems[0];

  return (
    <div className="min-h-screen bg-[#fafbfc] text-[#121723] pt-28 sm:pt-36 pb-20">
      <div className="w-full max-w-[1550px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* ========================================================
            1. TOP EXECUTIVE HEADER BANNER
           ======================================================== */}
        <div className="rounded-2xl border border-gray-200/90 bg-white p-5 sm:p-6 shadow-sm mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-[#0092d5] mb-2">
                <FaShieldAlt className="h-3 w-3" />
                <span>Tekisky Pvt. Ltd. · Admin Control Center</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
                Administrator Dashboard
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-gray-500">
                Centralized management for recruitment vacancies, candidate resumes, alumni placements, and platform accounts.
              </p>
            </div>

            {/* Profile & Refresh Action */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2.5 rounded-xl border border-gray-200 bg-gray-50/80 px-3.5 py-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0092d5] text-white font-bold text-xs">
                  SA
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                    <span>System Administrator</span>
                    <span className="rounded bg-blue-100 text-[#0092d5] text-[10px] font-extrabold px-1.5 py-0.2">
                      ADMIN
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-500">admin@tekisky.com</div>
                </div>
              </div>

              <button
                onClick={handleRefreshAll}
                className="rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 hover:border-gray-300 transition flex items-center gap-1.5"
                title="Refresh All Database Records"
              >
                <FaSyncAlt
                  className={`h-3.5 w-3.5 ${
                    isRefreshing ? "animate-spin text-[#0092d5]" : "text-gray-500"
                  }`}
                />
                <span className="hidden sm:inline">Refresh Data</span>
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================
            2. MOBILE NAVIGATION BAR & TOGGLE (< lg screens)
           ======================================================== */}
        <div className="lg:hidden mb-6 flex items-center justify-between rounded-2xl border border-gray-200/90 bg-white p-3.5 shadow-sm">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex items-center gap-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 px-3.5 py-2 text-xs font-bold text-gray-800 transition"
          >
            <FaBars className="h-4 w-4 text-[#0092d5]" />
            <span>Dashboard Menu</span>
            <span className="rounded-md bg-[#0092d5] text-white px-2 py-0.5 text-[11px] font-semibold">
              {currentMenuItem.label}
            </span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 hidden sm:inline">
              Active: <strong className="text-gray-800">{currentMenuItem.label}</strong>
            </span>
            <button
              onClick={handleRefreshAll}
              className="rounded-xl border border-gray-200 bg-white p-2.5 text-gray-600 hover:bg-gray-50 transition"
              title="Refresh Data"
            >
              <FaSyncAlt
                className={`h-3.5 w-3.5 ${
                  isRefreshing ? "animate-spin text-[#0092d5]" : "text-gray-500"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Mobile Slide-Out Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Drawer Content */}
            <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-white shadow-2xl z-50 p-5 flex flex-col justify-between overflow-y-auto">
              <div>
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-[#0092d5]">
                      <FaShieldAlt className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">
                        Admin Navigation
                      </h3>
                      <p className="text-[11px] text-gray-500">
                        Tekisky Control Center
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-lg p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
                  >
                    <FaTimes className="h-4 w-4" />
                  </button>
                </div>

                {/* Mobile Menu Items */}
                <nav className="space-y-1.5">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleTabClick(item.id)}
                        className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold transition duration-150 ${
                          isActive
                            ? "bg-[#0092d5] text-white shadow-sm"
                            : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Icon
                            className={`h-4 w-4 flex-shrink-0 ${
                              isActive ? "text-white" : "text-gray-500"
                            }`}
                          />
                          <span className="truncate">{item.label}</span>
                        </div>
                        <span
                          className={`ml-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                            isActive
                              ? "bg-white/20 text-white"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {item.count}
                        </span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Mobile Drawer Footer */}
              <div className="pt-4 border-t border-gray-100 mt-6">
                <div className="rounded-xl bg-gray-50 p-3 border border-gray-100">
                  <div className="text-xs font-bold text-gray-900">
                    System Administrator
                  </div>
                  <div className="text-[11px] text-gray-500">
                    admin@tekisky.com
                  </div>
                  <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-600 font-medium">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Authorized Admin Session
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            3. MAIN TWO-COLUMN LAYOUT (SIDEBAR + CONTENT)
           ======================================================== */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
          {/* ======================================================
              LEFT VERTICAL SIDEBAR (Desktop & Tablet)
             ====================================================== */}
          <aside className="hidden lg:block w-64 lg:w-72 flex-shrink-0 sticky top-28">
            <div className="rounded-2xl border border-gray-200/90 bg-white p-4 shadow-sm flex flex-col justify-between min-h-[500px]">
              <div>
                {/* Sidebar Header */}
                <div className="px-2 pb-3 mb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#0092d5] mb-1">
                    <FaShieldAlt className="h-3 w-3" />
                    <span>Navigation Menu</span>
                  </div>
                  <h2 className="text-base font-extrabold text-gray-900">
                    Admin Modules
                  </h2>
                </div>

                {/* Vertical Sidebar Navigation Items */}
                <nav className="space-y-1.5">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleTabClick(item.id)}
                        className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 text-left ${
                          isActive
                            ? "bg-[#0092d5] text-white shadow-sm ring-1 ring-[#0092d5]"
                            : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Icon
                            className={`h-4 w-4 flex-shrink-0 ${
                              isActive ? "text-white" : "text-gray-500"
                            }`}
                          />
                          <span className="truncate">{item.label}</span>
                        </div>
                        <span
                          className={`ml-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                            isActive
                              ? "bg-white/20 text-white"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {item.count}
                        </span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Sidebar Bottom Status & Admin Badge */}
              <div className="pt-4 border-t border-gray-100 mt-6">
                <div className="rounded-xl bg-gray-50/80 p-3 border border-gray-100">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0092d5] text-white font-bold text-xs">
                      SA
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-gray-900 truncate">
                        System Admin
                      </div>
                      <div className="text-[11px] text-gray-500 truncate">
                        admin@tekisky.com
                      </div>
                    </div>
                  </div>
                  <div className="mt-2.5 flex items-center justify-between text-[11px] text-gray-500 pt-2 border-t border-gray-200/60">
                    <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      Database Live
                    </span>
                    <button
                      onClick={handleRefreshAll}
                      className="text-[#0092d5] hover:underline font-semibold flex items-center gap-1"
                      title="Refresh All Database Records"
                    >
                      <FaSyncAlt
                        className={`h-2.5 w-2.5 ${isRefreshing ? "animate-spin" : ""}`}
                      />
                      Refresh
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* ======================================================
              RIGHT CONTENT AREA (Main Dashboard Views)
             ====================================================== */}
          <main className="flex-1 min-w-0 w-full">
            {/* MODULE 1: RECRUITMENT JOBS */}
            {activeTab === "jobs" && (
              <div>
                <AdminJobManagement
                  onMetricsUpdate={(newMetrics) => setJobMetrics(newMetrics)}
                />
              </div>
            )}

            {/* MODULE 2: CONSULTANCY APPLICATIONS */}
            {activeTab === "consultancy" && (
              <div>
                <ConsultancyApplications
                  onCountsUpdate={(appsList) => setApplicants(appsList)}
                />
              </div>
            )}

            {/* MODULE 3: ALUMNI (SELECTED STUDENTS) */}
            {activeTab === "alumni" && (
              <div>
                {/* Header & Controls Card */}
                <div className="rounded-2xl border border-gray-200/90 bg-white p-5 sm:p-6 shadow-sm mb-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                        <FaGraduationCap className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">
                          Alumni & Selected Students
                        </h2>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Showing {filteredStudents.length} of {students.length} placed
                          alumni records from database
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowStudentModal(true)}
                        className="rounded-xl bg-[#0092d5] px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#007bb5] transition flex items-center gap-1.5"
                      >
                        <FaPlus className="h-3 w-3" /> Add Student
                      </button>
                    </div>
                  </div>

                  {/* Search Toolbar */}
                  <div className="mt-4 relative max-w-md">
                    <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search alumni by student name, company, or designation..."
                      value={searchStudent}
                      onChange={(e) => setSearchStudent(e.target.value)}
                      className="w-full rounded-xl border border-gray-300 pl-10 pr-8 py-2.5 text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#0092d5] focus:outline-none focus:ring-1 focus:ring-[#0092d5]"
                    />
                    {searchStudent && (
                      <button
                        onClick={() => setSearchStudent("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <FaTimes className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Modal */}
                <AddStudentModal
                  showModal={showStudentModal}
                  onClose={() => setShowStudentModal(false)}
                  fetchStudents={fetchStudents}
                />

                {/* Content Table / Cards */}
                {filteredStudents.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center shadow-sm">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mb-4">
                      <FaGraduationCap className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {students.length === 0
                        ? "No Alumni Records in Database"
                        : "No Matching Alumni Found"}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
                      {students.length === 0
                        ? "Add your first placed student to showcase graduate outcomes on the platform."
                        : "Try adjusting your search criteria to find matching alumni."}
                    </p>
                    {searchStudent && (
                      <button
                        onClick={() => setSearchStudent("")}
                        className="mt-4 rounded-xl border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
                      >
                        Clear Search
                      </button>
                    )}
                  </div>
                ) : isSmallScreen ? (
                  /* Mobile Cards View */
                  <div className="space-y-4">
                    {filteredStudents.slice(0, displayedStudents).map((student, index) => (
                      <div
                        key={student._id}
                        className="rounded-2xl border border-gray-200/90 bg-white p-5 shadow-sm hover:shadow-md transition"
                      >
                        {editIndex === index ? (
                          <div className="space-y-3">
                            <div>
                              <label className="text-xs font-semibold text-gray-700">
                                Student Name
                              </label>
                              <input
                                type="text"
                                value={editedStudent.name}
                                onChange={(e) => handleEditChange("name", e.target.value)}
                                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-900 focus:border-[#0092d5] focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-semibold text-gray-700">
                                Company Name
                              </label>
                              <input
                                type="text"
                                value={editedStudent.companyName}
                                onChange={(e) =>
                                  handleEditChange("companyName", e.target.value)
                                }
                                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-900 focus:border-[#0092d5] focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-semibold text-gray-700">
                                Designation
                              </label>
                              <input
                                type="text"
                                value={editedStudent.designation}
                                onChange={(e) =>
                                  handleEditChange("designation", e.target.value)
                                }
                                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-900 focus:border-[#0092d5] focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-semibold text-gray-700">
                                Education / Degree
                              </label>
                              <input
                                type="text"
                                value={editedStudent.education}
                                onChange={(e) =>
                                  handleEditChange("education", e.target.value)
                                }
                                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-900 focus:border-[#0092d5] focus:outline-none"
                              />
                            </div>
                            <div className="flex items-center gap-2 pt-2">
                              <button
                                onClick={() => handleSaveStudent(index, student._id)}
                                className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs font-semibold transition flex items-center gap-1"
                              >
                                <FaCheck className="h-3 w-3" /> Save
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="rounded-lg border border-gray-300 hover:bg-gray-100 text-gray-700 px-3 py-1.5 text-xs font-semibold transition flex items-center gap-1"
                              >
                                <FaTimes className="h-3 w-3" /> Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <div className="flex items-center gap-2.5">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 font-bold text-xs uppercase">
                                  {(student.name || "S").slice(0, 2)}
                                </div>
                                <div>
                                  <h3 className="text-base font-bold text-gray-900">
                                    {student.name}
                                  </h3>
                                  <p className="text-xs text-gray-500">
                                    {student.education || "Graduate"}
                                  </p>
                                </div>
                              </div>
                              <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold px-2 py-0.5">
                                Placed
                              </span>
                            </div>

                            <div className="mt-3 space-y-1 text-xs text-gray-600 bg-gray-50 rounded-xl p-3">
                              <div className="flex items-center gap-1.5">
                                <FaBuilding className="text-gray-400" />
                                <span className="font-medium text-gray-800">
                                  {student.companyName || "Company not specified"}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <FaUserTie className="text-gray-400" />
                                <span>{student.designation || "IT Role"}</span>
                              </div>
                            </div>

                            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleEditStudent(index, student)}
                                className="rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 text-xs font-semibold transition flex items-center gap-1"
                                title="Edit Student"
                              >
                                <FaEdit className="h-3 w-3" /> Edit
                              </button>
                              <button
                                onClick={() => handleDeleteStudent(student)}
                                className="rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 px-3 py-1.5 text-xs font-semibold transition flex items-center gap-1"
                                title="Delete Student"
                              >
                                <FaTrash className="h-3 w-3" /> Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    <div className="flex items-center justify-center gap-2 pt-4">
                      {displayedStudents < filteredStudents.length && (
                        <button
                          onClick={() => setDisplayedStudents((prev) => prev + 8)}
                          className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition shadow-sm"
                        >
                          Load More ({filteredStudents.length - displayedStudents} remaining)
                        </button>
                      )}
                      {displayedStudents > 8 && (
                        <button
                          onClick={() => setDisplayedStudents(8)}
                          className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition shadow-sm"
                        >
                          View Less
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Desktop Table View */
                  <div className="rounded-2xl border border-gray-200/90 bg-white shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-gray-200 bg-gray-50/70 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                            <th className="px-5 py-3.5">Student Details</th>
                            <th className="px-5 py-3.5">Hired Company</th>
                            <th className="px-5 py-3.5">Designation</th>
                            <th className="px-5 py-3.5">Education</th>
                            <th className="px-5 py-3.5 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
                          {filteredStudents.slice(0, displayedStudents).map((student, index) => (
                            <tr
                              key={student._id}
                              className="hover:bg-blue-50/20 transition-colors duration-150"
                            >
                              <td className="px-5 py-4">
                                {editIndex === index ? (
                                  <input
                                    type="text"
                                    value={editedStudent.name}
                                    onChange={(e) =>
                                      handleEditChange("name", e.target.value)
                                    }
                                    className="rounded-lg border border-gray-300 px-2 py-1 text-xs text-gray-900 focus:border-[#0092d5] focus:outline-none"
                                  />
                                ) : (
                                  <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 font-bold text-xs uppercase">
                                      {(student.name || "S").slice(0, 2)}
                                    </div>
                                    <div>
                                      <div className="font-bold text-gray-900">
                                        {student.name}
                                      </div>
                                      <div className="text-[11px] text-emerald-600 font-medium">
                                        Verified Alumni
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </td>

                              <td className="px-5 py-4">
                                {editIndex === index ? (
                                  <input
                                    type="text"
                                    value={editedStudent.companyName}
                                    onChange={(e) =>
                                      handleEditChange("companyName", e.target.value)
                                    }
                                    className="rounded-lg border border-gray-300 px-2 py-1 text-xs text-gray-900 focus:border-[#0092d5] focus:outline-none"
                                  />
                                ) : (
                                  <span className="font-semibold text-gray-800 flex items-center gap-1.5">
                                    <FaBuilding className="text-gray-400 h-3 w-3" />
                                    {student.companyName || "—"}
                                  </span>
                                )}
                              </td>

                              <td className="px-5 py-4 text-xs text-gray-700">
                                {editIndex === index ? (
                                  <input
                                    type="text"
                                    value={editedStudent.designation}
                                    onChange={(e) =>
                                      handleEditChange("designation", e.target.value)
                                    }
                                    className="rounded-lg border border-gray-300 px-2 py-1 text-xs text-gray-900 focus:border-[#0092d5] focus:outline-none"
                                  />
                                ) : (
                                  student.designation || "—"
                                )}
                              </td>

                              <td className="px-5 py-4 text-xs text-gray-600">
                                {editIndex === index ? (
                                  <input
                                    type="text"
                                    value={editedStudent.education}
                                    onChange={(e) =>
                                      handleEditChange("education", e.target.value)
                                    }
                                    className="rounded-lg border border-gray-300 px-2 py-1 text-xs text-gray-900 focus:border-[#0092d5] focus:outline-none"
                                  />
                                ) : (
                                  student.education || "—"
                                )}
                              </td>

                              <td className="px-5 py-4 text-right">
                                {editIndex === index ? (
                                  <div className="inline-flex items-center gap-1">
                                    <button
                                      onClick={() =>
                                        handleSaveStudent(index, student._id)
                                      }
                                      className="rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 p-2 transition"
                                      title="Save Changes"
                                    >
                                      <FaCheck className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      onClick={handleCancelEdit}
                                      className="rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 transition"
                                      title="Cancel"
                                    >
                                      <FaTimes className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                ) : (
                                  <div className="inline-flex items-center gap-1">
                                    <button
                                      onClick={() => handleEditStudent(index, student)}
                                      className="rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 transition"
                                      title="Edit Record"
                                    >
                                      <FaEdit className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteStudent(student)}
                                      className="rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 p-2 transition"
                                      title="Delete Record"
                                    >
                                      <FaTrash className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Table Footer with Pagination */}
                    <div className="border-t border-gray-200 bg-gray-50/70 px-5 py-3 flex items-center justify-between text-xs text-gray-600">
                      <div>
                        Showing{" "}
                        <span className="font-semibold text-gray-900">
                          {Math.min(displayedStudents, filteredStudents.length)}
                        </span>{" "}
                        of{" "}
                        <span className="font-semibold text-gray-900">
                          {filteredStudents.length}
                        </span>{" "}
                        alumni records
                      </div>
                      <div className="flex items-center gap-2">
                        {displayedStudents < filteredStudents.length && (
                          <button
                            onClick={() =>
                              setDisplayedStudents((prev) => prev + 8)
                            }
                            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition shadow-sm"
                          >
                            Load More
                          </button>
                        )}
                        {displayedStudents > 8 && (
                          <button
                            onClick={() => setDisplayedStudents(8)}
                            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition shadow-sm"
                          >
                            View Less
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* MODULE 4: USERS (ADMINS & PLATFORM MEMBERS) */}
            {activeTab === "users" && (
              <div>
                {/* Header & Controls Card */}
                <div className="rounded-2xl border border-gray-200/90 bg-white p-5 sm:p-6 shadow-sm mb-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                        <FaUsers className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">
                          Platform Users & Administrators
                        </h2>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Showing {filteredUsers.length} of {users.length} registered
                          accounts from database
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowUserModal(true)}
                        className="rounded-xl bg-[#0092d5] px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#007bb5] transition flex items-center gap-1.5"
                      >
                        <FaPlus className="h-3 w-3" /> Add User
                      </button>
                    </div>
                  </div>

                  {/* Search Toolbar */}
                  <div className="mt-4 relative max-w-md">
                    <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search user by name, email, or mobile..."
                      value={searchUser}
                      onChange={(e) => setSearchUser(e.target.value)}
                      className="w-full rounded-xl border border-gray-300 pl-10 pr-8 py-2.5 text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#0092d5] focus:outline-none focus:ring-1 focus:ring-[#0092d5]"
                    />
                    {searchUser && (
                      <button
                        onClick={() => setSearchUser("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <FaTimes className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Modal */}
                <AddUserModel
                  showModal={showUserModal}
                  onClose={() => setShowUserModal(false)}
                  fetchUsers={fetchUsers}
                />

                {/* Content Table / Cards */}
                {filteredUsers.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center shadow-sm">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 mb-4">
                      <FaUsers className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {users.length === 0
                        ? "No Registered Users Found"
                        : "No Matching Users Found"}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
                      {users.length === 0
                        ? "Click 'Add User' above to register administrative or instructor credentials."
                        : "Try adjusting your search criteria to find matching user accounts."}
                    </p>
                    {searchUser && (
                      <button
                        onClick={() => setSearchUser("")}
                        className="mt-4 rounded-xl border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
                      >
                        Clear Search
                      </button>
                    )}
                  </div>
                ) : isSmallScreen ? (
                  /* Mobile Cards View */
                  <div className="space-y-4">
                    {filteredUsers.map((user) => (
                      <div
                        key={user._id}
                        className="rounded-2xl border border-gray-200/90 bg-white p-5 shadow-sm hover:shadow-md transition"
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 text-purple-700 font-bold text-xs uppercase">
                              {(user.fullName || "U").slice(0, 2)}
                            </div>
                            <div>
                              <h3 className="text-base font-bold text-gray-900">
                                {user.fullName || "User"}
                              </h3>
                              <span
                                className={`rounded-full text-[11px] font-semibold px-2 py-0.5 border ${
                                  user.userType === "admin"
                                    ? "bg-blue-50 text-[#0092d5] border-blue-200"
                                    : "bg-gray-100 text-gray-700 border-gray-200"
                                }`}
                              >
                                {user.userType === "admin" ? "Administrator" : "Staff"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 space-y-1 text-xs text-gray-600 bg-gray-50 rounded-xl p-3">
                          <div className="flex items-center gap-1.5">
                            <FaEnvelope className="text-gray-400" />
                            <span>{user.email || "No email"}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <FaPhone className="text-gray-400" />
                            <span>{user.mobileNumber || "No mobile"}</span>
                          </div>
                          {user.collegeName && (
                            <div className="flex items-center gap-1.5 text-gray-500">
                              <FaBuilding className="text-gray-400" />
                              <span>{user.collegeName}</span>
                            </div>
                          )}
                        </div>

                        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-end">
                          <button
                            onClick={() => handleDeleteUser(user)}
                            className="rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 px-3 py-1.5 text-xs font-semibold transition flex items-center gap-1"
                            title="Delete User"
                          >
                            <FaTrash className="h-3 w-3" /> Remove User
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Desktop Table View */
                  <div className="rounded-2xl border border-gray-200/90 bg-white shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-gray-200 bg-gray-50/70 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                            <th className="px-5 py-3.5">User Identity</th>
                            <th className="px-5 py-3.5">Email Address</th>
                            <th className="px-5 py-3.5">Mobile Number</th>
                            <th className="px-5 py-3.5">Role</th>
                            <th className="px-5 py-3.5 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
                          {filteredUsers.map((user) => (
                            <tr
                              key={user._id}
                              className="hover:bg-blue-50/20 transition-colors duration-150"
                            >
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 text-purple-700 font-bold text-xs uppercase">
                                    {(user.fullName || "U").slice(0, 2)}
                                  </div>
                                  <div>
                                    <div className="font-bold text-gray-900">
                                      {user.fullName || "Unnamed User"}
                                    </div>
                                    {user.collegeName && (
                                      <div className="text-[11px] text-gray-400 truncate max-w-[200px]">
                                        {user.collegeName}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-5 py-4 text-xs text-gray-700">
                                {user.email || "—"}
                              </td>
                              <td className="px-5 py-4 text-xs text-gray-600">
                                {user.mobileNumber || "—"}
                              </td>
                              <td className="px-5 py-4">
                                <span
                                  className={`rounded-full text-xs font-semibold px-2.5 py-1 border ${
                                    user.userType === "admin"
                                      ? "bg-blue-50 text-[#0092d5] border-blue-200"
                                      : "bg-gray-100 text-gray-700 border-gray-200"
                                  }`}
                                >
                                  {user.userType === "admin"
                                    ? "Administrator"
                                    : user.userType === "teacher"
                                    ? "Instructor"
                                    : "Staff Member"}
                                </span>
                              </td>
                              <td className="px-5 py-4 text-right">
                                <button
                                  onClick={() => handleDeleteUser(user)}
                                  className="rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 p-2 transition"
                                  title="Delete User Account"
                                >
                                  <FaTrash className="h-3.5 w-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
