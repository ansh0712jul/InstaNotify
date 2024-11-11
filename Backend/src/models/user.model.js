import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        password: {
            type: String,
            required: [true, "password is required"]
        },
        refreshToken: {
            type: String
        }
    },
    {
        timestamps: true
    }
);

// Hashing password with pre-save hook
// userSchema.pre("save", async function(next) {
//     if (!this.isModified("password")) return next();
//     this.password = await bcrypt.hash(this.password, 10);
//     next();
// });

// Custom methods
// userSchema.methods.isPasswordCorrect = async function(password) {
//     return await bcrypt.compare(password, this.password);
// };

// Token generation methods
userSchema.methods.generateAccessToken = function() {
    return jwt.sign(
        {
            _id: this._id,
            name: this.name,
            email: this.email
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    );
};

userSchema.methods.generateRefreshToken = function() {
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    );
};

export const User = mongoose.model("User", userSchema);
