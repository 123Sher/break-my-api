import { Router ,Request, Response} from "express";
import jwt from 'jsonwebtoken';

import {
    ACCESS_SECRET,
    REFRESH_SECRET,
    ACCESS_TTL_SECONDS,
    REFRESH_EXPIRY,
    REFRESH_COOKIE_MAX_AGE,
} from '../config.js';


const router = Router();

//hardcoded demo user for testing
const USER = { username: "demo", password: "demo@123" };


//router.post("/login", handler) runs when a request arrives with both of these:
// The method is POST
// The path is /api/login

router.post("/login",(req:Request,res:Response) => {
    const {username, password} = req.body ?? {};

    //if they dont match
    if(username!==USER.username || password!== USER.password)
    {
       return res.status(401).json({
            code: "INVALID_CREDENTIALS",
            message: "Incorrect username or password",
        });
    }

    //create access token
    const accessToken = jwt.sign({sub:username},ACCESS_SECRET,{
        expiresIn:ACCESS_TTL_SECONDS
    });

    const refreshToken = jwt.sign({sub:username},REFRESH_SECRET,{
        expiresIn:REFRESH_EXPIRY
    });

    res.cookie("refreshToken",refreshToken,{
        httpOnly: true, // This is the security magic! JavaScript cannot read this.
        secure: false, // plain http locally; must be true in production
        sameSite: 'lax', // Prevents CSRF attacks
        path:'/api',
        maxAge:REFRESH_COOKIE_MAX_AGE,
    })

    return res.status(200).json({ accessToken, expiresIn: ACCESS_TTL_SECONDS });

});

export default router;



