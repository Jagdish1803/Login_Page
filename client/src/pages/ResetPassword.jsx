import React, { useContext, useState, useRef } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AppContent } from "../context/AppContent";
import { toast } from "react-toastify";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { backendUrl } = useContext(AppContent);

  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isOtpSubmitted, setIsOtpSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const inputRefs = useRef([]);

  const handleInput = (e, index) => {
    const value = e.target.value;
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    if (value.length > 0 && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text");
    const pasteArray = paste.split("").slice(0, 6);
    const newOtp = [...otp];
    
    pasteArray.forEach((char, index) => {
      if (index < 6 && /^\d$/.test(char)) {
        newOtp[index] = char;
      }
    });
    setOtp(newOtp);
    
    const nextEmptyIndex = newOtp.findIndex(val => val === "");
    const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
    inputRefs.current[focusIndex]?.focus();
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch(`${backendUrl}/api/auth/sent-reset-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (data.success) {
        setIsEmailSent(true);
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join("");
    
    if (otpString.length !== 6) {
      toast.error("Please enter the complete 6-digit OTP");
      return;
    }
    
    setIsOtpSubmitted(true);
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    
    if (!newPassword) {
      toast.error("Please enter a new password");
      return;
    }
    
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const otpString = otp.join("");
      const response = await fetch(`${backendUrl}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email,
          otp: otpString,
          newPassword
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        navigate("/login");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetFlow = () => {
    setEmail("");
    setNewPassword("");
    setConfirmPassword("");
    setIsEmailSent(false);
    setOtp(["", "", "", "", "", ""]);
    setIsOtpSubmitted(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-blue-200 to-purple-400">
      <img
        onClick={() => navigate("/")}
        src={assets.logo}
        className="absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer"
        alt="Logo"
      />
      
      <div className="bg-slate-900 p-10 rounded-lg shadow-lg w-full sm:w-96 text-indigo-300 text-sm">
        <h2 className="text-3xl font-semibold text-white text-center mb-3">
          Reset Password
        </h2>
        
        {!isEmailSent && (
          <>
            <p className="text-center text-sm mb-6">
              Enter your registered email ID to receive a reset code.
            </p>
            
            <form onSubmit={handleEmailSubmit}>
              <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
                <img src={assets.mail_icon} alt="Mail" />
                <input
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                  className="bg-transparent outline-none text-white w-full"
                  type="email"
                  placeholder="Email ID"
                  required
                />
              </div>
              
              <button 
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-900 text-white font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Sending..." : "Send Reset Code"}
              </button>
            </form>
          </>
        )}

        {isEmailSent && !isOtpSubmitted && (
          <>
            <p className="text-center text-sm mb-6">
              Enter the 6-digit code sent to {email}
            </p>
            
            <form onSubmit={handleOtpSubmit}>
              <div className="flex justify-between mb-8">
                {Array(6).fill(0).map((_, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="tel"
                    maxLength="1"
                    required
                    className="w-12 h-12 bg-[#333A5C] text-white text-center text-xl rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={otp[index]}
                    onChange={(e) => handleInput(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    onPaste={handlePaste}
                    pattern="\d"
                  />
                ))}
              </div>
              
              <button 
                type="submit"
                className="w-full py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-900 text-white font-medium cursor-pointer mb-3"
              >
                Verify Code
              </button>
              
              <p 
                onClick={resetFlow}
                className="text-gray-400 text-center text-xs cursor-pointer hover:text-white"
              >
                Change Email Address
              </p>
            </form>
          </>
        )}

        {isOtpSubmitted && (
          <>
            <p className="text-center text-sm mb-6">
              Enter your new password
            </p>
            
            <form onSubmit={handlePasswordReset}>
              <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
                <img src={assets.lock_icon} alt="Lock" />
                <input
                  onChange={(e) => setNewPassword(e.target.value)}
                  value={newPassword}
                  className="bg-transparent outline-none text-white w-full"
                  type="password"
                  placeholder="New Password"
                  required
                />
              </div>
              
              <div className="mb-6 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
                <img src={assets.lock_icon} alt="Lock" />
                <input
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  value={confirmPassword}
                  className="bg-transparent outline-none text-white w-full"
                  type="password"
                  placeholder="Confirm New Password"
                  required
                />
              </div>
              
              <button 
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-900 text-white font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mb-3"
              >
                {isLoading ? "Resetting..." : "Reset Password"}
              </button>
              
              <p 
                onClick={resetFlow}
                className="text-gray-400 text-center text-xs cursor-pointer hover:text-white"
              >
                Start Over
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;