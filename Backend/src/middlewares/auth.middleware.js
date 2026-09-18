import jwt, { decode } from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const isAuthenticated = async (req, res, next) => {
    try{
        const authHeader = req.headers.authorization;

        
        if(!authHeader || !authHeader.startsWith("Bearer")){
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }
        
        const token = authHeader.split(" ")[1];
        
        if(!token){
            return res.status(401).json({
                success: false,
                message: "Authentication token is missing"
            })
        }
        
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

        const user = await User.findById(decoded.userId).select("-password")

        if(!user) {
            return res.status(401).json({
                success: false,
                message: "User no longer exists"
            })
        }

        if(user.isBlocked){
            return res.status(403).json({
                success: false,
                message: "Your account has been blocked"
            });
        }

        if(!user.isActive){
            return res.status(403).json({
                success: false,
                message: "Your account is inActive"
            })
        }

        req.user = user;

        next();
    }

    catch(error){
        if(error.name === "TokenExpiredError"){
            return res.status(401).json({
                success: false,
                message: "Authorization token has expired"
            })
        }

        if(error.name === "JsonWebTokenError"){
            return res.status(401).json({
                success: false,
                message: "Invalid authentication token"
            });
        }

        console.error("Authentication error:", error);

        return res.status(500).json({
            success: false,
            message: "Authentication failed"
        })
    }
}