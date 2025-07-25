import React, { useContext } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AppContent } from "../context/AppContent";
import axios from "axios";
import { toast } from "react-toastify";

const Navbar = () => {
  const navigate = useNavigate();
  const { UserData, backendUrl, setUserData, setisLoggedin } =
    useContext(AppContent);

  const sendVerificationOtp = async () => {
    try {
      axios.defaults.withCredentials = true;

      const { data } = await axios.post(
        backendUrl + "/api/auth/send-verify-otp"
      );
      if (data.success) {
        navigate("/email-verify");
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error);
    }
  };
  const logout = async () => {
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(backendUrl + "/api/auth/logout");
      data.success && setisLoggedin(false);
      data.success && setUserData(false);
      navigate("/");
    } catch (error) {
      toast.error(error.message);
    }
  };
  return (
    <div className="w-full flex justify-between items-center p-4 sm:p-6 sm:px-24 absolute top-0">
      <img src={assets.logo} className="w-28 sm:w-32" alt="Logo" />
      {UserData ? (
        <div className="w-9 h-9 flex justify-center items-center rounded-full bg-black text-white relative group cursor-pointer">
          {UserData.name[0].toUpperCase()}
          <div className="absolute hidden group-hover:block top-full left-1/2 transform -translate-x-1/2 mt-0.5  z-10 min-w-[120px] shadow-lg rounded-md">
            <ul className="list-none m-0 p-0 bg-white border border-gray-200 rounded-md text-sm text-gray-700">
              {!UserData.isAccountVerified && (
                <li
                  onClick={sendVerificationOtp}
                  className="py-2 px-4 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  Verify email
                </li>
              )}

              <li
                className="py-2 px-4 hover:bg-gray-100 cursor-pointer"
                onClick={logout}
              >
                Logout
              </li>
            </ul>
          </div>
        </div>
      ) : (
        <button
          onClick={() => navigate("/login")}
          className="flex items-center gap-2 border border-gray-500 rounded-full px-6 py-2 text-gray-800 hover:bg-gray-100 transition-all cursor-pointer"
        >
          Login
        </button>
      )}
    </div>
  );
};

export default Navbar;
