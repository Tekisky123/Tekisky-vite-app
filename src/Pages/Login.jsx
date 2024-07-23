import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import LoaderSmall from "../Loader/LoaderSmall";
// import { useNavigate } from "react-router-dom";
import baseURL from "../Common/Api";
import { LuEye, LuEyeOff } from "react-icons/lu";

const Login = () => {
  // const navigate = useNavigate();
  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showLoader, setShowLoader] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockedTime, setBlockedTime] = useState(null);

  useEffect(() => {
    const blockInfo = JSON.parse(localStorage.getItem("blockInfo"));
    if (blockInfo && blockInfo.blockedUntil) {
      const currentTime = new Date().getTime();
      if (currentTime < blockInfo.blockedUntil) {
        setIsBlocked(true);
        setBlockedTime(blockInfo.blockedUntil);
      } else {
        localStorage.removeItem("blockInfo");
      }
    }
  }, []);

  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };

  const validateForm = () => {
    if (!mobileNumber || !password) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Please enter both mobile number and password.",
      });
      return false;
    }
    if (!/^\d{10}$/.test(mobileNumber)) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Please enter a valid 10-digit mobile number.",
      });
      return false;
    }
    return true;
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setShowLoader(true);
    try {
      const response = await axios.post(`${baseURL}user/login`, {
        mobileNumber,
        password,
      });
      const { token, userType, user } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("userType", userType);
      localStorage.setItem("userId", user._id);
      localStorage.setItem("collegeName", user.collegeName || "");

      Swal.fire({
        icon: "success",
        title: "Login Successful!",
        text: "Welcome back!",
        showConfirmButton: false,
        timer: 1500,
      });

      // Reload the page and navigate based on userType
      window.location.reload(); // Reload the page to ensure state is updated
      window.location.replace(
        userType === "admin"
          ? "/dashboard"
          : userType === "teacher"
          ? `/teacherDashboard/${user._id}`
          : "/"
      );
    } catch (error) {
      const failedAttempts =
        JSON.parse(localStorage.getItem("failedAttempts")) || 0;
      const newFailedAttempts = failedAttempts + 1;
      localStorage.setItem("failedAttempts", newFailedAttempts);

      if (newFailedAttempts >= 4) {
        const blockedUntil = new Date().getTime() + 24 * 60 * 60 * 1000; // Block for 24 hours
        localStorage.setItem("blockInfo", JSON.stringify({ blockedUntil }));
        setIsBlocked(true);
        setBlockedTime(blockedUntil);
        Swal.fire({
          icon: "error",
          title: "Login Blocked",
          text: "Too many failed attempts. Please try again after 24 hours.",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Login Failed",
          text: "Please check your credentials and try again.",
        });
      }
    }
    setShowLoader(false);
  };

  if (isBlocked) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">You are blocked!</h2>
          <p className="mb-2">
            Too many failed login attempts. Please try again later.
          </p>
          <p>
            You will be able to try again at{" "}
            {new Date(blockedTime).toLocaleString()}.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <section className="relative z-10 overflow-hidden pb-16 pt-36 md:pb-20 lg:pb-28 lg:pt-[180px]">
        {showLoader && <LoaderSmall />}
        <div className="container">
          <div className="-mx-4 flex flex-wrap">
            <div className="w-full px-4">
              <div className="mx-auto max-w-[500px] rounded bg-white px-6 py-10 shadow-three dark:bg-dark sm:p-[60px]">
                <h3 className="mb-3 text-center text-2xl font-bold text-black dark:text-white sm:text-3xl">
                  Login
                </h3>

                <form onSubmit={handleLogin}>
                  <div className="mb-8">
                    <label
                      htmlFor="mobileNumber"
                      className="mb-3 block text-sm text-dark dark:text-white"
                    >
                      Your Mobile Number
                    </label>
                    <input
                      type="tel"
                      name="mobileNumber"
                      value={mobileNumber}
                      onChange={(e) => {
                        const regex = /^[0-9]{0,10}$/;
                        if (
                          regex.test(e.target.value) ||
                          e.target.value === ""
                        ) {
                          setMobileNumber(e.target.value);
                        }
                      }}
                      placeholder="Enter your Mobile Number"
                      className="border-stroke w-full rounded-lg border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:text-body-color-dark dark:shadow-two dark:focus:border-primary dark:focus:shadow-none"
                    />
                  </div>
                  <div className="mb-8 relative">
                    <label
                      htmlFor="password"
                      className="mb-3 block text-sm text-dark dark:text-white"
                    >
                      Your Password
                    </label>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your Password"
                      className="border-stroke w-full rounded-lg border bg-[#f8f8f8] px-6 py-3 pr-10 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:text-body-color-dark dark:shadow-two dark:focus:border-primary dark:focus:shadow-none"
                    />
                    <div
                      className="absolute inset-y-0 right-0 top-8 flex items-center pr-3 cursor-pointer"
                      onClick={togglePasswordVisibility}
                    >
                      {showPassword ? (
                        <LuEyeOff className="size-6" />
                      ) : (
                        <LuEye className="size-6"/>
                      )}
                    </div>
                  </div>
                  <div className="mb-6">
                    <button
                      type="submit"
                      className="flex w-full items-center justify-center rounded-lg bg-primary px-9 py-4 text-base font-medium text-white shadow-submit duration-300 hover:bg-primary/90 dark:shadow-submit-dark"
                    >
                      Login
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Login;
