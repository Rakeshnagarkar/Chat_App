import User from "../models/user.model.js";
import { generateToken } from "../lib/utils.js";

import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js"

export const signup = async (req, res) => {
    const { fullName, email, password } = req.body;

    try {
        if (!fullName || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            fullName,
            email,
            password: hashedPassword
        });

        await newUser.save();

        generateToken(newUser._id, res);

        res.status(201).json({
            _id: newUser._id,
            fullName: newUser.fullName,
            email: newUser.email,
            profilePic: newUser.profilePic,
            createdAt: newUser.createdAt, 
            updatedAt: newUser.updatedAt 
        });

    } catch (error) {
        console.log("Error in signup controller", error); // Log the full error object
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

export const login = async (req, res) => {
    
    const { email, password } = req.body;

    try {

        if( !email || !password){
            return res.status(400).json({message: "All fields are required"})
        }

        const user = await User.findOne({ email })

        if(!user){
            return res.status(400).json({message: "User does not exist"})
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if(!isPasswordValid){
            return res.status(400).json({message: "Invalid credentials"})
        }

        generateToken(user._id, res);

        res.status(200).json({

            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic,

        })
        
    } catch (error) {

        console.log("Error in login controller", error.message);
        res.status(500).json({message: "Internal Server Error"})
        
        
    }
}

export const logout = (req, res) => {
  try {
    res.clearCookie("jwt", {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: "/" // 🔥 very important!
    });

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


export const updateProfile = async(req, res) => {

    try {

        const {profilePic} = req.body;
        const userId = req.user._id;

        if(!profilePic){
            return res.status(400).json({message: "Profile pic is required"})
        }
        
        const uploadResponse = await cloudinary.uploader.upload(profilePic)
        const updatedUser = await User.findByIdAndUpdate(userId, {profilePic: uploadResponse.secure_url}, {new:true})

        res.status(200).json(updatedUser)

    } catch (error) {
        console.log("Error in Update Profile:", error);
        res.status(500).json({message: "Internal Server Error"})
        
    }

}

export const checkAuth = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password"); // exclude password
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(user);
        
    } catch (error) {
        console.log("Error in checkAuth controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
