import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import { STATES } from "mongoose";
import { text } from "express";
import transporter from "../config/nodeMailer.js";
//this was for user register
export const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.json({ success: false, message: "Missing Details" });
  }

  try {
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, message: "User already exists" });
    }
    //stored user in database
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new userModel({ name, email, password: hashedPassword });
    await user.save();
    //generated one JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    //add cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    //Sending welcome email
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: `Welcome to CodeQuest ${name}`,
      text: `Hi ${name},
Welcome to CodeQuest your account has been created with email id: ${email} — we’re thrilled to have you join us!
You've chosen to explore the world of subject, and that’s 
an excellent decision. Whether you're just getting started or 
aiming to sharpen your expertise, we’ve designed every challenge, 
lesson, and quest to help you grow into a confident, capable developer.
At CodeQuest, you’ll:
Solve real-world coding problems
Earn XP, coins, and level up as you learn
Take on quests, unlock achievements, and track your mastery
Your learning journey is now gamified, goal-oriented, and built to be both challenging and fun.
Click below to begin your first challenge and start earning XP:
👉 https://codequest.dev/dashboard
If you didn’t sign up for CodeQuest, you can safely ignore this email.
Welcome aboard, and happy coding!
— The CodeQuest Team`,
    };
    await transporter.sendMail(mailOptions);

    return res.json({ success: true });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
//this is for user login
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.json({
      success: false,
      message: "Email and password are required",
    });
  }

  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "Invaild email" });
    }
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.json({ success: false, message: error.message });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.json({ success: true });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};
//this is for user logout
export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });

    return res.json({ success: true, message: "Logged Out" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

//Send Verification OTP to the User Email
export const sendVerifyOtp = async (req, res) => {
  try {
    const { userID } = req.body;
    const user = await userModel.findById(userID);
    if (user.isAccountVerified) {
      return res.json({ success: false, message: "Account Already Verified" });
    }
    const otp = String(Math.floor(100000 + Math.random() * 900000));

    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;

    await user.save();

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: `Verify your CodeQuest account — ${otp}`,
      text: `Thank you for signing up to CodeQuest!
To complete your registration and activate your account, 
please verify your email address by entering the following One-Time Password ${otp}`,
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: "Verification OTP sent to Email" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
//verify the user account
export const verifyEmail = async (req, res) => {
  const { userID, otp } = req.body;
  console.log("otp", otp);
  if (!userID || !otp) {
    return res.json({ success: false, message: "Missing details" });
  }
  try {
    const user = await userModel.findById(userID);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }
    if (user.verifyOtp === "" || user.verifyOtp !== otp) {
      return res.json({ success: false, message: "Invalid OTP" });
    }
    if (user.verifyOtpExpireAt < Date.now()) {
      return res.json({ success: false, message: "OTP expired" });
    }
    user.isAccountVerified = true;
    user.verifyOtp = "";
    user.verifyOtpExpireAt = 0;
    await user.save();
    return res.json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

//verfiy account authentication
export const isAuthenticated = async (req, res) => {
  try {
    return res.json({ success: true });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

//send password reset OTP
export const sendResetOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.json({ success: false, message: "Email is required" });
  }
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "user not found" });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));

    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000;

    await user.save();

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: `Verify your CodeQuest account — ${otp}`,
      text: `Thank you for signing up to CodeQuest!
            To complete your registration and activate your account, 
             please verify your email address by entering the following One-Time Password ${otp}`,
    };

    await transporter.sendMail(mailOptions);

    return res.json({ success: true, message: "OTP sent to your email" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

//reset user password
export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.json({
      success: false,
      message: "Email,OTP and password has  sent to email",
    });
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "user not found" });
    }
    if (user.resetOtp === "" || user.resetOtp !== otp) {
      return res.json({ success: false, message: "Invaild OTP" });
    }
    if (user.resetOtpExpireAt < Date.now()) {
      return res.json({ success: false, message: " OTP Expired" });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetOtp = "";
    user.resetOtpExpireAt = 0;

    await user.save();
    return res.json({
      success: true,
      message: "Password has been reset successfully",
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

