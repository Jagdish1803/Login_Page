import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";

const EmailVerify = () => {
  const inputRefs = useRef([]);
  const navigate = useNavigate();

  const handleInput = (e, index) => {
    const value = e.target.value;
    if (value.length === 1 && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus();
    }
    // Auto-submit when all inputs are filled
    if (index === 5 && value.length === 1) {
      handleSubmit();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && e.target.value === "" && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e, index) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").slice(0, 6);
    const pasteArray = paste.split("");
    pasteArray.forEach((char, i) => {
      if (inputRefs.current[i]) {
        inputRefs.current[i].value = char;
        if (i === pasteArray.length - 1 && i < 5) {
          inputRefs.current[i + 1].focus();
        }
      }
    });
    // Auto-submit if all inputs are filled after paste
    if (pasteArray.length === 6) {
      handleSubmit();
    }
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    const otp = inputRefs.current.map((input) => input.value).join("");
    if (otp.length === 6 && /^\d{6}$/.test(otp)) {
      // Replace with actual API call for OTP verification
      console.log("Valid OTP:", otp);
      // Example: navigate("/success");
    } else {
      alert("Please enter a valid 6-digit OTP");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-200 to-purple-400">
      <img
        onClick={() => navigate("/")}
        src={assets.logo}
        className="absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer"
        alt="Logo"
      />
      <form
        onSubmit={handleSubmit}
        className="bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm"
      >
        <h1 className="text-white text-2xl font-semibold text-center mb-4">
          Email Verification OTP
        </h1>
        <p className="text-center mb-6 text-indigo-300">
          Enter the 6-digit code sent to your email.
        </p>
        <div className="flex justify-between mb-8">
          {Array(6)
            .fill(0)
            .map((_, index) => (
              <input
                type="tel" // Better for numeric input on mobile
                maxLength="1"
                key={index}
                required
                className="w-12 h-12 bg-[#333A5C] text-white text-center text-xl rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                ref={(e) => (inputRefs.current[index] = e)}
                onInput={(e) => handleInput(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onPaste={(e) => handlePaste(e, index)}
                aria-label={`OTP digit ${index + 1}`}
                pattern="\d" // Restrict to digits
              />
            ))}
        </div>
        <button
          type="submit"
          className="w-full py-3 bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-full hover:bg-indigo-600 transition"
        >
          Verify Email
        </button>
      </form>
    </div>
  );
};

export default EmailVerify;