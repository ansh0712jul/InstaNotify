import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asynchandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token");
    }
};
// registering the user 
const registerUser = asynchandler(async (req, res) => {
    const { name, email, password } = req.body;
    console.log(name,email,password)
   

    // Validate required fields
    if ([name, email, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required!");
    }

    // Check if user already exists
    const existedUser = await User.findOne({
        $or: [{ email }, { name }]
    });
    console.log(existedUser)
    if (existedUser) {
        throw new ApiError(409, "User already exists");
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in the database
    const user = await User.create({
        email,
        password: hashedPassword,
        name: name.toLowerCase(),
    });

    // Retrieve user without password and tokens
    const createdUser = await User.findById(user._id).select("-password -refreshToken");
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    );
});

const LoginUser = asynchandler(async (req, res) => {
    const { name, email, password } = req.body;

    // Check if name or email is provided
    if (!(name || email)) {
        throw new ApiError(400, "Email or username is required");
    }

    // Find user in database, including password for comparison
    const user = await User.findOne({
        $or: [{ name }, { email }]
    })

    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    // Check if the provided password matches the stored hashed password
    const isMatched = await bcrypt.compare(password, user.password);
    if (!isMatched) {
        throw new ApiError(422, "Credentials do not match");
    }

    // Generate access and refresh tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    // Remove password and refreshToken before sending user info
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    // Set cookies with tokens
    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken
                },
                "User logged in successfully"
            )
        );
});

const LogoutUser = asynchandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    );

    const options = {
        httpOnly: true,
        secure: true
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out"));
});

export { registerUser, LoginUser, LogoutUser };
