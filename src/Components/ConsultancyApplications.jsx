import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Link, useNavigate } from "react-router-dom";
import ToastNotification from "../Loader/ToastNotification";
import { FaFileDownload, FaFolderOpen, FaShareAltSquare } from "react-icons/fa";
import { MdAssignmentAdd, MdDelete } from "react-icons/md";
import baseURL from "../Common/Api";

const ConsultancyApplications = () => {
  const [applicants, setApplicants] = useState([]);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const fetchApplicants = async () => {
    try {
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
        setApplicants(response.data);
      }
    } catch (error) {
      console.error("Error fetching applicants:", error);
    }
  };

  useEffect(() => {
    console.log("Fetching applicants...");
    fetchApplicants();
  }, []);

  const handleViewMore = async (applicant) => {
    try {
      const response = await axios.get(
        `${baseURL}consultancy/getoneuploadresume/${applicant._id}`
      );
      const data = response.data;
      console.log("Fetched applicant details:", data);
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
          title: "Success",
          text: "Changes saved successfully",
          icon: "success",
          confirmButtonText: "OK",
        });

        fetchApplicants();
        handleCloseModal();
      }
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "Failed to save changes",
        icon: "error",
        confirmButtonText: "OK",
      });
      console.error("Error saving changes:", error);
    }
  };

  const handleFieldChange = (field, value) => {
    if (!selectedApplicant) return;

    setSelectedApplicant((prevApplicant) => ({
      ...prevApplicant,
      [field]: value,
    }));
  };

  const filteredApplicants = applicants.filter((applicant) => {
    const searchTermLower = searchTerm ? searchTerm.toLowerCase() : "";

    const fullNameMatch =
      applicant.fullName &&
      applicant.fullName.toLowerCase().includes(searchTermLower);

    const experienceMatch =
      applicant.yearsOfExperience &&
      applicant.yearsOfExperience.toString().includes(searchTermLower);

    const skillMatch = applicant.skills.some((skill) =>
      skill.toLowerCase().includes(searchTermLower)
    );

    const statusMatch = statusFilter ? applicant.status === statusFilter : true;

    return (fullNameMatch || experienceMatch || skillMatch) && statusMatch;
  });

  const getStatusClassName = (status) => {
    switch (status) {
      case "Verified":
        return "rounded bg-green-500 px-2 py-1 text-md text-center";
      case "New":
        return "rounded bg-orange-400 px-2 py-1 text-md text-center";
      case "Rejected":
        return "rounded bg-red-500 px-2 py-1 text-md text-center";
      case "Mock Interview Done":
        return "rounded bg-blue-300 px-2 py-1 text-md text-center";
      case "Assessment Assigned":
        return "rounded bg-purple-400 px-2 py-1 text-md text-center";
      case "Assessment Submitted":
        return "rounded  bg-green-300 px-2 py-1 text-md text-center";
      default:
        return "";
    }
  };

  const handleDeleteApplicant = async (applicantId) => {
    try {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        const confirmResult = await Swal.fire({
          title: "Are you sure?",
          text: "Do you really want to delete this applicant?",
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
            text: "The applicant has been deleted.",
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
      await navigator.share({
        title: "Application Link",
        text: "Check out this application:",
        url: applicationUrl,
      });
    } catch (error) {
      console.error("Error sharing the link:", error);
    }
  };

  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth <= 640);
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const applicantsPerPage = 4;

  const totalPages = Math.ceil(filteredApplicants.length / applicantsPerPage);

  const [currentPage, setCurrentPage] = useState(1);

  const startIndex = (currentPage - 1) * applicantsPerPage;
  const endIndex = startIndex + applicantsPerPage;

  const visibleApplicants = filteredApplicants
    .reverse()
    .slice(startIndex, endIndex);

  const goToPage = (page) => {
    setCurrentPage(page);
  };

  const navigate = useNavigate();

  const handleNavigate = (applicantId) => {
    navigate(`/assign-Assisment/${applicantId}`);
  };

  return (
    <div className=" mx-auto contents px-4 py-8">
      {showToast && (
        <ToastNotification
          message={toastMessage}
          onClose={() => setShowToast(false)}
        />
      )}

      <h1 className="mb-10 mt-10 w-full border bg-slate-300 p-2 text-center text-xl font-semibold">
        Consultancy Applications
      </h1>
      <input
        type="text"
        placeholder="Search by name, Skills or experience"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input mb-4 rounded-md border border-gray-300 px-4 py-2 mr-5"
      />
      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="mb-4 rounded-md border border-gray-300 px-4 py-2"
      >
        <option value="">All Statuses</option>
        <option value="Verified">Verified</option>
        <option value="New">New</option>
        <option value="Rejected">Rejected</option>
        <option value="Mock Interview Done">Mock Interview Done</option>
        <option value="Assessment Assigned">Assessment Assigned</option>
        <option value="Assessment Submitted">Assessment Submitted</option>
      </select>

      {isSmallScreen ? (
        <div>
          <div className="">
            {visibleApplicants.map((applicant) => (
              <div
                key={applicant._id}
                className="mb-6 transform overflow-hidden rounded-lg bg-blue-50 border p-6  transition duration-300  shadow-lg"
              >
                <div className="mb-4">
                  <p className="mb-2 text-gray-800">
                    <strong>Full Name:</strong> {applicant.fullName}
                  </p>
                  <p className="mb-1 text-gray-700">
                    <strong>Email:</strong> {applicant.email}
                  </p>
                  <p className="mb-1 text-gray-700">
                    <strong>Mobile Number:</strong> {applicant.mobileNumber}
                  </p>
                  <p className="mb-1 text-gray-700">
                    <strong>Referred By:</strong> {applicant.referredBy}
                  </p>
                  <p className="mb-1 text-gray-700">
                    <strong>Years of Experience:</strong>{" "}
                    {applicant.yearsOfExperience} || {applicant.workStatus}
                  </p>
                  <p className="mb-1 text-gray-700">
                    <strong>Skills:</strong>{" "}
                    <div className="w-75 flex flex-wrap gap-1 ">
                      {applicant.skills[0]
                        .split(",")
                        .slice(0, 5)
                        .map((skill, index) => (
                          <div
                            key={index}
                            className="rounded bg-blue-200 px-2 py-1 text-sm text-blue-700"
                          >
                            {skill.trim()}
                          </div>
                        ))}
                      {applicant.skills[0].split(",").length > 5 && (
                        <span className="ml-1 text-gray-500">
                          +{applicant.skills[0].split(",").slice(5).length}
                        </span>
                      )}
                    </div>
                  </p>

                  <p className="mb-4 text-gray-700">
                    <strong>Application Status:</strong>{" "}
                    <div
                      className={`w-40 border ${getStatusClassName(
                        applicant.status
                      )}`}
                    >
                      {applicant.status}
                    </div>
                  </p>
                  <a
                    className="mb-4 block text-blue-500 hover:underline"
                    href={applicant.resumeUrl}
                    target="_blank"
                  >
                    Download Resume
                  </a>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleViewMore(applicant)}
                    className="transform rounded bg-blue-500 px-2 py-2 text-white transition duration-300 hover:scale-105 hover:bg-blue-600"
                  >
                    View More
                  </button>

                  <button
                    onClick={() => handleNavigate(applicant._id)}
                    className="transform rounded bg-teal-500 px-2 py-2 text-white transition duration-300 hover:scale-105 hover:bg-teal-600"
                  >
                    Assessment
                  </button>

                  <button
                    onClick={() => handleShare(applicant._id)}
                    className="transform rounded bg-teal-500 px-2 py-2 text-white transition duration-300 hover:scale-105 hover:bg-teal-600"
                  >
                    Share
                  </button>

                  <button
                    className="transform rounded bg-red-500 px-2 py-2 text-white transition duration-300 hover:scale-105 hover:bg-red-600"
                    onClick={() => handleDeleteApplicant(applicant._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex justify-between">
            <button
              className="rounded bg-gray-200 px-3 py-1"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                className={`${
                  currentPage === index + 1
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700"
                } rounded px-3 py-1`}
                onClick={() => goToPage(index + 1)}
              >
                {index + 1}
              </button>
            ))}
            <button
              className="rounded bg-gray-200 px-3 py-1"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr>
                <th className="border px-4 py-2   text-body-color  text-gray-700 dark:text-body-color-dark">
                  Name
                </th>
                <th className="w-10 border px-4  py-2  text-body-color text-gray-700 dark:text-body-color-dark">
                  Email
                </th>
                <th className="border px-4 py-2  text-body-color  text-gray-700 dark:text-body-color-dark">
                  Mobile Number
                </th>
                <th className="border px-4 py-2  text-body-color  text-gray-700 dark:text-body-color-dark">
                  Refered By
                </th>
                <th className="w-10 border px-4  py-2  text-body-color text-gray-700 dark:text-body-color-dark">
                  Year Of Experience
                </th>
                <th className="border px-4 py-2  text-body-color  text-gray-700 dark:text-body-color-dark">
                  Skills
                </th>
                <th className="border px-4 py-2  text-body-color  text-gray-700 dark:text-body-color-dark">
                  Application Status
                </th>
                <th className="w-10   border  text-body-color text-gray-700 dark:text-body-color-dark">
                  Download Resume
                </th>
                <th className="border px-4 py-2  text-body-color  text-gray-700 dark:text-body-color-dark">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredApplicants.map((applicant) => (
                <tr key={applicant._id}>
                  <td className="border px-4 py-2">{applicant.fullName}</td>
                  <td className="border">{applicant.email}</td>
                  <td className="border px-4 py-2">{applicant.mobileNumber}</td>
                  <td className="border px-4 py-2">{applicant.referredBy}</td>

                  <td className="border px-4 py-2">
                 {applicant.workStatus}   {applicant.yearsOfExperience}
                  </td>
                  <td className="w-80 border px-4 py-2">
                    <div className="w-75 flex flex-wrap gap-1 ">
                      {applicant.skills[0]
                        .split(",")
                        .slice(0, 5)
                        .map((skill, index) => (
                          <div
                            key={index}
                            className="rounded bg-blue-200 px-2 py-1 text-sm text-blue-700"
                          >
                            {skill.trim()}
                          </div>
                        ))}
                      {applicant.skills[0].split(",").length > 5 && (
                        <span className="ml-1 text-gray-500">
                          +{applicant.skills[0].split(",").slice(5).length}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="relative w-10 border px-2 py-2 group">
                    <div
                      className={`border ${getStatusClassName(
                        applicant.status
                      )}`}
                    >
                      {applicant.status}
                    </div>
                    <span className="absolute left-1/2 top-2 mb-2 hidden w-max -translate-x-1/2 rounded bg-gray-800 px-2 py-1 text-sm text-white group-hover:block">
                      {applicant.status}
                    </span>
                  </td>

                  <td className="border px-8 py-2 ">
                    <a
                      className="resume-download"
                      target="_blank"
                      href={applicant.resumeUrl}
                    >
                      <FaFileDownload className="size-10 text-green-500" />
                    </a>
                  </td>

                  <td className="d-flex w-40 border px-4 py-2 relative">
                    <button
                      onClick={() => handleViewMore(applicant)}
                      className="group m-1 rounded-md bg-green-500 px-2 py-2 text-white hover:bg-green-600 relative"
                    >
                      <FaFolderOpen className="size-6" />
                      <span className="absolute left-1/2 bottom-full mb-2 hidden w-max -translate-x-1/2 rounded bg-gray-800 px-2 py-1 text-sm text-white group-hover:block">
                        View More
                      </span>
                    </button>
                    <button
                      className="group m-1 rounded bg-red-500 px-2 py-2 text-white hover:bg-red-700 relative"
                      onClick={() => handleDeleteApplicant(applicant._id)}
                    >
                      <MdDelete className="size-6" />
                      <span className="absolute left-1/2 bottom-full mb-2 hidden w-max -translate-x-1/2 rounded bg-gray-800 px-2 py-1 text-sm text-white group-hover:block">
                        Delete
                      </span>
                    </button>
                    <button
                      onClick={() => handleShare(applicant._id)}
                      className="group m-1 rounded-md bg-blue-500 px-2 py-2 text-white hover:bg-blue-600 relative"
                    >
                      <FaShareAltSquare className="size-6" />
                      <span className="absolute left-1/2 bottom-full mb-2 hidden w-max -translate-x-1/2 rounded bg-gray-800 px-2 py-1 text-sm text-white group-hover:block">
                        Share
                      </span>
                    </button>
                    <button
                      onClick={() => handleNavigate(applicant._id)}
                      className="group m-1 rounded-md bg-blue-500 px-2 py-2 text-white hover:bg-blue-600 relative"
                    >
                      <MdAssignmentAdd className="size-6" />
                      <span className="absolute left-1/2 bottom-full mb-2 hidden w-max -translate-x-1/2 rounded bg-gray-800 px-2 py-1 text-sm text-white group-hover:block">
                        Assign Assisment
                      </span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedApplicant && (
        <div className="fixed inset-0 overflow-y-auto mt-20">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Application Details
                    </h3>
                    <div className="mt-2">
                      <table className="min-w-full divide-y divide-gray-200">
                        <tbody className="bg-white divide-y text-start divide-gray-200">
                          <tr>
                            <td className="px-2 py-4  whitespace-nowrap text-sm font-medium text-gray-900">
                              Name:
                            </td>
                            <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500">
                              {selectedApplicant.fullName}
                            </td>
                          </tr>
                          <tr>
                            <td className="px-2  py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              Email:
                            </td>
                            <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500">
                              {selectedApplicant.email}
                            </td>
                          </tr>
                          <tr>
                            <td className="px-2  py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              Mobile Number:
                            </td>
                            <td className="px-2  py-4 whitespace-nowrap text-sm text-gray-500">
                              {selectedApplicant.mobileNumber}
                            </td>
                          </tr>
                          <tr>
                            <td className="px-2  py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              Employee Id:
                            </td>
                            <td className="px-2  py-4 whitespace-nowrap text-sm text-gray-500">
                              {selectedApplicant.employeeNumber}
                            </td>
                          </tr>
                          <tr>
                            <td className="px-2  py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              Tenth Percentage:
                            </td>
                            <td className="px-2  py-4 whitespace-nowrap text-sm text-gray-500">
                              {selectedApplicant.tenthPercentage}
                            </td>
                          </tr>
                          <tr>
                            <td className="px-2  py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              Twelth Percentage:
                            </td>
                            <td className="px-2  py-4 whitespace-nowrap text-sm text-gray-500">
                              {selectedApplicant.twelthPercentage}
                            </td>
                          </tr>
                          <tr>
                            <td className="px-2  py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              Twelth College:
                            </td>
                            <td className="px-2  py-4 whitespace-nowrap text-sm text-gray-500">
                              {selectedApplicant.twelthCollegeName}
                            </td>
                          </tr>
                          <tr>
                            <td className="px-2  py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              Diploma Percentage:
                            </td>
                            <td className="px-2  py-4 whitespace-nowrap text-sm text-gray-500">
                              {selectedApplicant.diplomaPercentage}
                            </td>
                          </tr>
                          <tr>
                            <td className="px-2  py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              Diploma College:
                            </td>
                            <td className="px-2  py-4 whitespace-nowrap text-sm text-gray-500">
                              {selectedApplicant.diplomaCollegeName}
                            </td>
                          </tr>
                          <tr>
                            <td className="px-2  py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              Degree Name:
                            </td>
                            <td className="px-2  py-4 whitespace-nowrap text-sm text-gray-500">
                              {selectedApplicant.degreeName}
                            </td>
                          </tr>
                          <tr>
                            <td className="px-2 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              Degree Percentage:
                            </td>
                            <td className="px-2  py-4 whitespace-nowrap text-sm text-gray-500">
                              {selectedApplicant.degreePercentage}
                            </td>
                          </tr>
                          <tr>
                            <td className="px-2  py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              Degree College:
                            </td>
                            <td className="px-2  py-4 whitespace-nowrap text-sm text-gray-500">
                              {selectedApplicant.degreeCollegeName}
                            </td>
                          </tr>
                          <tr>
                            <td className="px-2  py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              Year Of Passing:
                            </td>
                            <td className="px-2  py-4 whitespace-nowrap text-sm text-gray-500">
                              {selectedApplicant.yearOfPassing}
                            </td>
                          </tr>
                          <tr>
                            <td className="px-2  py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              Mock Interview Date
                            </td>
                            <td className="px-2  py-4 whitespace-nowrap text-sm text-gray-500">
                              {selectedApplicant.mockInterviewDate}
                            </td>
                          </tr>
                          <tr>
                            <td className="px-2  py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              Mock Interview Time
                            </td>
                            <td className="px-2  py-4 whitespace-nowrap text-sm text-gray-500">
                              {selectedApplicant.mockInterviewTime}
                            </td>
                          </tr>
                          {/* <tr>
                            <td className="px-2  py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              Interested In Mock Interview:
                            </td>
                            <td className="px-2  py-4 whitespace-nowrap text-sm text-gray-500">
                              {selectedApplicant.interestedInMockInterview
                                ? "Yes"
                                : "No"}
                            </td>
                          </tr> */}
                        </tbody>
                      </table>
                    </div>

                    <div className="mt-4">
                      <label className="mb-2 block font-bold" htmlFor="rating">
                        Rating:
                      </label>
                      <select
                        id="rating"
                        value={selectedApplicant.rating ?? ""}
                        onChange={(e) =>
                          handleFieldChange("rating", parseInt(e.target.value))
                        }
                        className="w-full rounded border border-gray-300 px-3 py-2"
                      >
                        <option value="" disabled>
                          Select rating
                        </option>
                        {[1, 2, 3, 4, 5].map((value) => (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mt-4">
                      <label
                        className="mb-2 block font-bold"
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
                        className="w-full rounded border border-gray-300 px-3 py-2"
                      >
                        <option value="" disabled>
                          Select rating
                        </option>
                        {[1, 2, 3, 4, 5].map((value) => (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mt-4">
                      <label
                        className="mb-2 block font-bold"
                        htmlFor="technicalRoundComments"
                      >
                        Technical Round Comments:
                      </label>
                      <textarea
                        id="technicalRoundComments"
                        value={selectedApplicant.technicalRoundComments || ""}
                        onChange={(e) =>
                          handleFieldChange(
                            "technicalRoundComments",
                            e.target.value
                          )
                        }
                        className="w-full rounded border px-4 py-2"
                      />
                    </div>

                    <div className="mt-4">
                      <label
                        className="mb-2 block font-bold"
                        htmlFor="comments"
                      >
                        Comments:
                      </label>
                      <textarea
                        id="comments"
                        value={selectedApplicant.comments || ""}
                        onChange={(e) =>
                          handleFieldChange("comments", e.target.value)
                        }
                        className="w-full rounded border px-4 py-2"
                      />
                    </div>

                    <div className="mt-4">
                      <label className="mb-2 block font-bold" htmlFor="status">
                        Status:
                      </label>
                      <select
                        id="status"
                        value={selectedApplicant.status ?? ""}
                        onChange={(e) =>
                          handleFieldChange("status", e.target.value)
                        }
                        className="w-full rounded border border-gray-300 px-3 py-2"
                      >
                        <option value="" disabled>
                          Select status
                        </option>
                        {[
                          "Verified",
                          "New",
                          "Rejected",
                          "Mock Interview Done",
                          "Assessment Assigned",
                          "Assessment Submitted",
                        ].map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </div>
                    {selectedApplicant.status === "Mock Interview Done" && (
                      <div className="mb-4">
                        <label
                          className="mb-2 block font-bold"
                          htmlFor="mockInterviewFeedback"
                        >
                          Mock Interview Feedback:
                        </label>
                        <textarea
                          id="mockInterviewFeedback"
                          value={selectedApplicant.mockInterviewFeedback || ""}
                          onChange={(e) =>
                            handleFieldChange(
                              "mockInterviewFeedback",
                              e.target.value
                            )
                          }
                          className="w-full rounded border px-4 py-2"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                  onClick={() => setSelectedApplicant(null)}
                >
                  Close
                </button>
                <button
                  onClick={handleSaveChanges}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                >
                  Save Changes
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
