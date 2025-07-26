import React, { useContext, useState, useRef, useEffect } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AppContent } from "../context/AppContent";
import axios from "axios";
import { toast } from "react-toastify";

const Navbar = () => {
  const navigate = useNavigate();
  const { UserData, backendUrl, setUserData, setisLoggedin } = useContext(AppContent);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const sendVerificationOtp = async () => {
    try {
      const response = await axios.post(`${backendUrl}/api/auth/send-verify-otp`, {
        withCredentials: true,
      });
      if (response.data.success) {
        navigate("/email-verify");
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message || "Failed to send verification OTP");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred while sending OTP");
    }
    setShowDropdown(false);
  };

  const logout = async () => {
    try {
      const response = await axios.post(`${backendUrl}/api/auth/logout`, {
        withCredentials: true,
      });
      if (response.data.success) {
        setisLoggedin(false);
        setUserData(null); // Use null instead of false for clarity
        navigate("/");
        toast.success("Logged out successfully");
      } else {
        toast.error(response.data.message || "Failed to logout");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred during logout");
    }
    setShowDropdown(false);
  };

  const toggleDropdown = () => {
    setShowDropdown((prev) => !prev);
  };

  return (
    <div className="w-full flex justify-between items-center p-4 sm:p-6 sm:px-24 absolute top-0 z-50">
      <img
        src={assets.logo}
        className="w-28 sm:w-32 cursor-pointer"
        alt="Logo"
        onClick={() => navigate("/")}
      />

      {UserData ? (
        <div className="relative" ref={dropdownRef}>
          {/* User Avatar Button */}
          <button
            onClick={toggleDropdown}
            className="w-9 h-9 flex justify-center items-center rounded-full bg-black text-white cursor-pointer hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            aria-label="User menu"
            aria-expanded={showDropdown}
            aria-controls="user-menu"
          >
            {UserData.name?.[0]?.toUpperCase() || "?"}
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div
              id="user-menu"
              className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10"
              role="menu"
            >
              <div className="py-2">
                {/* User Info */}
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {UserData.name || "User"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {UserData.isAccountVerified ? (
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        Verified
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                        Unverified
                      </span>
                    )}
                  </p>
                </div>

                {/* Menu Items */}
                {!UserData.isAccountVerified && (
                  <button
                    onClick={sendVerificationOtp}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition-colors focus:outline-none focus:bg-gray-100"
                    role="menuitem"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    Verify Email
                  </button>
                )}

                <button
                  onClick={logout}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors focus:outline-none focus:bg-red-50"
                  role="menuitem"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Logout
                </button>
              </div>
            </div>
          )}

          {/* Mobile Backdrop */}
          {showDropdown && (
            <div
              className="fixed inset-0 z-0 sm:hidden"
              onClick={() => setShowDropdown(false)}
              aria-hidden="true"
            />
          )}
        </div>
      ) : (
        <button
          onClick={() => navigate("/login")}
          className="flex items-center gap-2 border border-gray-500 rounded-full px-6 py-2 text-gray-800 hover:bg-gray-100 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
            />
          </svg>
          Login
        </button>
      )}
    </div>
  );
};

export default Navbar;