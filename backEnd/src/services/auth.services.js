import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";
import transporter from "../config/nodemailer.js";

const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

export const signupService = async ({ fullName, email, password }) => {
  const existingUser = await User.findOne({ email });

  if (existingUser && !existingUser.isVerified) {
    
    const otp = generateOtp();
    const otpExpiry = Date.now() + 5 * 60 * 1000;

    existingUser.fullName = fullName;
    existingUser.password = await bcrypt.hash(password, 10);
    existingUser.otp = otp;
    existingUser.otpExpiry = otpExpiry;

    await existingUser.save();

    await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: "Verify your account",
      html: `
        <h2>OTP Verification</h2>
        <p>Your OTP is: <b>${otp}</b></p>
        <p>This OTP will expire in 5 minutes.</p>
      `,
    });

    return existingUser;
  }


  if (existingUser) {
    throw new Error("Email already exists");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const otp = generateOtp();
  const otpExpiry = Date.now() + 5 * 60 * 1000;



  const newUser = await User.create({
    fullName,
    email,
    password: hashedPassword,
    otp,
    otpExpiry,
    isVerified: false,
  });

  await transporter.sendMail({
    from: `chatty <${process.env.EMAIL}>`,
    to: email,
    subject: "Verify your account",
    html: `
      <h2>OTP Verification</h2>
      <p>Your OTP is: <b>${otp}</b></p>
      <p>This OTP will expire in 5 minutes.</p>
    `,
  });

  return newUser;
};

export const loginService = async ({ email, password }) => {
    const user = await User.findOne({ email });
  
    if (!user) {
      throw new Error("Invalid credentials");
    }
  
    const isMatch = await bcrypt.compare(password, user.password);
  
    if (!isMatch) {
      throw new Error("Invalid credentials");
    }
    if(!user.isVerified){
        throw new Error("User not verified");
    }
    return user;
  };

export const updateProfileService = async (userId, profilePic) => {
  if (!profilePic) {
    throw new Error("Profile pic is required");
  }

  const uploadResponse = await cloudinary.uploader.upload(profilePic);

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { profilePic: uploadResponse.secure_url },
    { new: true }
  );

  return updatedUser;
};

export const verifyOtpService = async ({ email, otp }) => {
    const user = await User.findOne({ email });
  
    if (!user) {
      throw new Error("User not found");
    }
  
    if (user.otp !== otp) {
      throw new Error("Invalid OTP");
    }
  
    if (user.otpExpiry < Date.now()) {
      throw new Error("OTP expired");
    }
  
    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
  
    await user.save();
  
    return user;
  };