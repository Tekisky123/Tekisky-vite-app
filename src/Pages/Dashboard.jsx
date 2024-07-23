import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import AddStudentModal from "../Components/AddStudentModal";
import AddUserModel from "../Components/AddUserModel";
import ConsultancyApplications from "../Components/ConsultancyApplications";
import baseURL from "../Common/Api";
import { FaCheck, FaUserEdit } from "react-icons/fa";
import { MdCancel, MdDelete } from "react-icons/md";

const Dashboard = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [users, setUsers] = useState([]);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [token, setToken] = useState("");
  const [displayedStudents, setDisplayedStudents] = useState(5);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [activeTab, setActiveTab] = useState("alumni");

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      Swal.fire({
        title: "Session Expired",
        text: "Please login again",
        icon: "error",
        confirmButtonText: "OK",
      }).then(() => {
        navigate("/login");
      });
    } else {
      setToken(storedToken);

      const logoutTimeout = 10 * 60 * 60 * 1000;
      const timeoutId = setTimeout(() => {
        localStorage.removeItem("token");
        Swal.fire({
          title: "Session Expired",
          text: "Please login again",
          icon: "error",
          confirmButtonText: "OK",
        }).then(() => {
          navigate("/login");
        });
      }, logoutTimeout);

      return () => clearTimeout(timeoutId);
    }
  }, [navigate]);
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

  const fetchStudents = async () => {
    try {
      const response = await axios.get(
        `${baseURL}selectedStudent/getSelectedStudent`,
        { headers: { Authorization: `${token}` } }
      );
      setStudents(response.data.reverse());
    } catch (error) {
      console.error("Error fetching students:", error);
      Swal.fire({
        title: "Error",
        text: "Failed to fetch students. Please try again later.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  const loadMoreStudents = () => {
    setDisplayedStudents(displayedStudents + 5);
  };

  const viewLessStudents = () => {
    setDisplayedStudents(5);
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${baseURL}user/getAllUsers`, {
        headers: {
          Authorization: `${token}`,
        },
      });
      setUsers(response.data.users.users);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchStudents();
      fetchUsers();
    }
  }, [token]);

  const handleDeleteUser = async (id) => {
    const confirmed = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (confirmed.isConfirmed) {
      try {
        await axios.delete(`${baseURL}user/delete/${id}`, {
          headers: {
            Authorization: `${token}`,
          },
        });
        setUsers(users.filter((user) => user._id !== id));
        Swal.fire("Deleted!", "User has been deleted.", "success");
      } catch (error) {
        console.error("Error deleting user:", error);
        Swal.fire("Error!", "Failed to delete user.", "error");
      }
    }
  };

  const handleDeleteStudent = async (id) => {
    const confirmed = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (confirmed.isConfirmed) {
      try {
        await axios.delete(`${baseURL}selectedStudent/delete/${id}`, {
          headers: {
            Authorization: `${token}`,
          },
        });
        setStudents(students.filter((student) => student._id !== id));
        Swal.fire("Deleted!", "Student has been deleted.", "success");
      } catch (error) {
        console.error("Error deleting student:", error);
        Swal.fire("Error!", "Failed to delete student.", "error");
      }
    }
  };

  const [editIndex, setEditIndex] = useState(null);
  const [editedStudent, setEditedStudent] = useState({
    name: "",
    companyName: "",
    designation: "",
    education: "",
  });

  const handleEditStudent = (index) => {
    setEditIndex(index);
    setEditedStudent(students[index]);
  };

  const handleEditChange = (field, value) => {
    setEditedStudent((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  const handleSaveStudent = async (index, id) => {
    try {
      await axios.put(`${baseURL}selectedStudent/update/${id}`, editedStudent, {
        headers: {
          Authorization: `${token}`,
        },
      });
      const updatedStudents = [...students];
      updatedStudents[index] = editedStudent;
      setStudents(updatedStudents);
      setEditIndex(null);
      setEditedStudent({
        name: "",
        companyName: "",
        designation: "",
        education: "",
      });
      Swal.fire({
        icon: "success",
        title: "Student data updated successfully!",
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (error) {
      console.error("Error updating student data:", error);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Failed to update student data. Please try again later.",
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

  return (
    <>
      <div className="container mx-auto mt-40 px-4 py-8">
        <div className="flex items-center justify-center space-x-4 border-b pb-4">
          <button
            className={`rounded-md px-2 py-2 font-semibold ${
              activeTab === "alumni"
                ? "bg-blue-500 text-white"
                : "text-gray-500"
            }`}
            onClick={() => handleTabClick("alumni")}
          >
            Alumni
          </button>
          <button
            className={`rounded-md px-2 py-2 font-semibold ${
              activeTab === "users" ? "bg-blue-500 text-white" : "text-gray-500"
            }`}
            onClick={() => handleTabClick("users")}
          >
            Users
          </button>
          <button
            className={`rounded-md px-2 py-2 font-semibold ${
              activeTab === "consultancy"
                ? "bg-blue-500 text-white"
                : "text-gray-500"
            }`}
            onClick={() => handleTabClick("consultancy")}
          >
            Consultancy Applications
          </button>
        </div>

        {activeTab === "alumni" && (
          <>
            {" "}
            <h2 className="mb-10 mt-10 w-full border bg-slate-300 p-2 text-center text-xl font-semibold">
              Selected Students
            </h2>
            <button
              onClick={() => setShowStudentModal(true)}
              className="mb-4 rounded-md bg-green-500 px-4 py-2 text-white hover:bg-green-600"
            >
              Add Student
            </button>
            <AddStudentModal
              showModal={showStudentModal}
              onClose={() => setShowStudentModal(false)}
              fetchStudents={fetchStudents}
            />
            {isSmallScreen ? (
              <div className="mb-8">
                <div className="overflow-x-auto ">
                  {students
                    .slice(0, displayedStudents)
                    .map((student, index) => (
                      <div
                        key={student._id}
                        className="mb-4    rounded-lg bg-blue-50 border p-6  transition duration-300  shadow-lg"
                      >
                        {editIndex === index ? (
                          <div className="grid grid-cols-2 gap-4">
                            <div className="mb-4">
                              <label className="mb-1 block font-semibold">
                                Name
                              </label>
                              <input
                                type="text"
                                className="w-full rounded-md border px-3 py-2"
                                value={editedStudent.name}
                                onChange={(e) =>
                                  handleEditChange("name", e.target.value)
                                }
                              />
                            </div>
                            <div className="mb-4">
                              <label className="mb-1 block font-semibold">
                                Company Name
                              </label>
                              <input
                                type="text"
                                className="w-full rounded-md border px-3 py-2"
                                value={editedStudent.companyName}
                                onChange={(e) =>
                                  handleEditChange(
                                    "companyName",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                            <div className="mb-4">
                              <label className="mb-1 block font-semibold">
                                Designation
                              </label>
                              <input
                                type="text"
                                className="w-full rounded-md border px-3 py-2"
                                value={editedStudent.designation}
                                onChange={(e) =>
                                  handleEditChange(
                                    "designation",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                            <div className="mb-4">
                              <label className="mb-1 block font-semibold">
                                Education
                              </label>
                              <input
                                type="text"
                                className="w-full rounded-md border px-3 py-2"
                                value={editedStudent.education}
                                onChange={(e) =>
                                  handleEditChange("education", e.target.value)
                                }
                              />
                            </div>
                            <div className="flex justify-center">
                              <button
                                className="rounded-md bg-green-500 px-4 py-2 text-white hover:bg-green-600"
                                onClick={() =>
                                  handleSaveStudent(index, student._id)
                                }
                              >
                                <FaCheck className="size-6" />
                              </button>
                              <button
                                className="ml-2 rounded-md bg-red-500 px-4 py-2 text-white hover:bg-red-600"
                                onClick={() => handleCancelEdit()}
                              >
                                <MdCancel className="size-6" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <p>
                              <strong>Name:</strong> {student.name}
                            </p>
                            <p>
                              <strong>Company Name:</strong>{" "}
                              {student.companyName}
                            </p>
                            <p>
                              <strong>Designation:</strong>{" "}
                              {student.designation}
                            </p>
                            <p>
                              <strong>Education:</strong> {student.education}
                            </p>
                            <div className="mt-2">
                              <button
                                className="mr-2 rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                                onClick={() => handleEditStudent(index)}
                              >
                                <FaUserEdit className="size-6" />
                              </button>
                              <button
                                className="rounded-md bg-red-500 px-4 py-2 text-white hover:bg-red-600"
                                onClick={() => handleDeleteStudent(student._id)}
                              >
                                <MdDelete className="size-6" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  {students.length > displayedStudents ? (
                    <button
                      onClick={loadMoreStudents}
                      className="mt-5 rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                    >
                      Load More
                    </button>
                  ) : (
                    <button
                      onClick={viewLessStudents}
                      className="mt-5 rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                    >
                      View Less
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="mb-8">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 border-2 bg-white">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Company Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Designation
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Education
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {students
                        .slice(0, displayedStudents)
                        .map((student, index) => (
                          <tr key={student._id}>
                            <td className="whitespace-nowrap px-6 py-4">
                              {editIndex === index ? (
                                <input
                                  type="text"
                                  className="w-full rounded-md border px-3 py-2"
                                  value={editedStudent.name}
                                  onChange={(e) =>
                                    handleEditChange("name", e.target.value)
                                  }
                                />
                              ) : (
                                student.name
                              )}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4">
                              {editIndex === index ? (
                                <input
                                  type="text"
                                  className="w-full rounded-md border px-3 py-2"
                                  value={editedStudent.companyName}
                                  onChange={(e) =>
                                    handleEditChange(
                                      "companyName",
                                      e.target.value
                                    )
                                  }
                                />
                              ) : (
                                student.companyName
                              )}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4">
                              {editIndex === index ? (
                                <input
                                  type="text"
                                  className="w-full rounded-md border px-3 py-2"
                                  value={editedStudent.designation}
                                  onChange={(e) =>
                                    handleEditChange(
                                      "designation",
                                      e.target.value
                                    )
                                  }
                                />
                              ) : (
                                student.designation
                              )}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4">
                              {editIndex === index ? (
                                <input
                                  type="text"
                                  className="w-full rounded-md border px-3 py-2"
                                  value={editedStudent.education}
                                  onChange={(e) =>
                                    handleEditChange(
                                      "education",
                                      e.target.value
                                    )
                                  }
                                />
                              ) : (
                                student.education
                              )}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4">
                              {editIndex === index ? (
                                <div className="flex justify-center">
                                  <button
                                    className="rounded-md bg-green-500 px-4 py-2 text-white hover:bg-green-600"
                                    onClick={() =>
                                      handleSaveStudent(index, student._id)
                                    }
                                  >
                                    <FaCheck className="size-6" />
                                  </button>
                                  <button
                                    className="ml-2 rounded-md bg-red-500 px-4 py-2 text-white hover:bg-red-600"
                                    onClick={() => handleCancelEdit()}
                                  >
                                    <MdCancel className="size-6" />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex justify-center  relative">
                                  <button
                                    className="mr-2 group rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600  relative"
                                    onClick={() => handleEditStudent(index)}
                                  >
                                    <FaUserEdit className="size-6" />
                                    <span className="absolute left-1/2 bottom-full mb-2 hidden w-max -translate-x-1/2 rounded bg-gray-800 px-2 py-1 text-sm text-white group-hover:block">
                                      Edit
                                    </span>
                                  </button>
                                  <button
                                    className="rounded-md group relative bg-red-500 px-4 py-2 text-white hover:bg-red-600"
                                    onClick={() =>
                                      handleDeleteStudent(student._id)
                                    }
                                  >
                                    <MdDelete className="size-6" />
                                    <span className="absolute left-1/2 bottom-full mb-2 hidden w-max -translate-x-1/2 rounded bg-gray-800 px-2 py-1 text-sm text-white group-hover:block">
                                      Delete
                                    </span>
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                  {students.length > displayedStudents ? (
                    <button
                      onClick={loadMoreStudents}
                      className="mt-5 rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                    >
                      Load More
                    </button>
                  ) : (
                    <button
                      onClick={viewLessStudents}
                      className="mt-5 rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                    >
                      View Less
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === "users" && (
          <>
            <div>
              <h2 className="mb-10 mt-10 w-full border bg-slate-300 p-2 text-center text-xl font-semibold">
                Users
              </h2>
              <button
                onClick={() => setShowUserModal(true)}
                className="mb-4 rounded-md bg-green-500 px-4 py-2 text-white hover:bg-green-600"
              >
                Add User
              </button>

              <AddUserModel
                showModal={showUserModal}
                onClose={() => setShowUserModal(false)}
                fetchUsers={fetchUsers}
              />
              {isSmallScreen ? (
                <div className="grid grid-cols-1 gap-4">
                  {users.map((user) => (
                    <div
                      key={user._id}
                      className="mb-4    rounded-lg bg-blue-50 border p-6  transition duration-300  shadow-lg"
                    >
                      <p>
                        <strong>FUll Name:</strong> {user.fullName}
                      </p>
                      <p>
                        <strong>Email:</strong> {user.email}
                      </p>
                      <p>
                        <strong>Mobile Number:</strong> {user.mobileNumber}
                      </p>
                      <button
                        className="mt-2 rounded-md bg-red-500 px-4 py-2 text-white hover:bg-red-600"
                        onClick={() => handleDeleteUser(user._id)}
                      >
                        <MdDelete className="size-6" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 border-2   bg-white  dark:bg-dark">
                    <thead className="bg-gray-50   bg-white  dark:bg-dark ">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          FUll Name
                        </th>

                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Mobile Number
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200  text-black dark:text-white">
                      {users.map((user) => (
                        <tr key={user._id}>
                          <td className="whitespace-nowrap px-6 py-4">
                            {user.fullName}
                          </td>

                          <td className="whitespace-nowrap px-6 py-4">
                            {user.email}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4">
                            {user.mobileNumber}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4">
                            <button
                              className="mr-2 rounded-md bg-red-500 px-4 py-2 text-white hover:bg-red-600"
                              onClick={() => handleDeleteUser(user._id)}
                            >
                              <MdDelete className="size-6" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
        {activeTab === "consultancy" && (
          <>
            {" "}
            <ConsultancyApplications />
          </>
        )}
      </div>
    </>
  );
};

export default Dashboard;
