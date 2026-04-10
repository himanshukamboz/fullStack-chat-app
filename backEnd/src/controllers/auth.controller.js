import { signupService,loginService,updateProfileService,verifyOtpService } from "../services/index.js";
import { generateToken } from "../lib/utils.js";

export const signup = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    const newUser = await signupService({
      fullName,
      email: email.toLowerCase().trim(),
      password,
    });

    res.status(201).json(newUser);

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const user = await loginService({
      email: email.toLowerCase().trim(),
      password,
    });

    generateToken(user._id, res);

    return res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });

  } catch (error) {
    console.log("Error in login controller:", error);

    return res.status(400).json({
      message: error.message || "Login failed",
    });
  }
}

export const logout = (req, res) => {
  try {
    res.cookie("token", "", { maxAge: 0 });

    return res.status(200).json({
      message: "Logged out successfully",
    });

  } catch (error) {
    console.log("Error in logout controller:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;

    const updatedUser = await updateProfileService(userId, profilePic);

    return res.status(200).json(updatedUser);

  } catch (error) {
    console.log("Error in updateProfile controller:", error);

    return res.status(400).json({
      message: error.message || "Profile update failed",
    });
  }
};


export const checkAuth = (req, res) => {
  try {
    return res.status(200).json(req.user);

  } catch (error) {
    console.log("Error in checkAuth controller:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP are required",
      });
    }

    const user = await verifyOtpService({
      email: email.toLowerCase().trim(),
      otp,
    });

    generateToken(user._id, res);

    return res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });

  } catch (error) {
    console.log("Error in verifyOtp controller:", error);

    return res.status(400).json({
      message: error.message || "OTP verification failed",
    });
  }
};
