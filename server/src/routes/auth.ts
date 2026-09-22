import { Router ,Request, Response} from "express";
import jwt from 'jsonwebtoken';

import {
    ACCESS_SECRET,
    REFRESH_SECRET,
    ACCESS_TTL_SECONDS,
    REFRESH_EXPIRY,
    REFRESH_COOKIE_MAX_AGE,
    REFRESH_DELAY_MS,
    state,
} from '../config.js';
import cookieParser from "cookie-parser";


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

    //NOTE:  Both tokens are created completely fresh whenever a user performs a successful 
    // login operation (e.g., submitting their username and password).

    //create access token
    const accessToken = jwt.sign({sub:username},ACCESS_SECRET,{
        expiresIn:ACCESS_TTL_SECONDS
    });

    // create refresh token
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

// modern utility used to pause execution asynchronously in JavaScript and TypeScript.
// this function does not block the main thread. 
// While it pauses your specific async function, the browser or Node.js runtime can still 
// process other events, render UI elements, and run other scripts in the background.

//why no direct setTimeout?
//setTimeout is asynchronous and relies on callbacks.
// It does not pause the execution of the code around it. 
// Instead, it schedules a function to run later and immediately moves on to the next line.

//By wrapping setTimeout in a Promise, you tell the JavaScript engine: 
// "Treat this timer as a task that I can pause and wait for."
//It pauses only the specific async function that contains the await keyword.
//rest of the functions will be resumed.
const sleep = (ms:number) => new Promise ((resolve) => setTimeout(resolve,ms));

router.post('/refresh',async(req,res) => {
    state.refreshCalls++;

    await sleep(REFRESH_DELAY_MS);

    if(state.rejectRefresh)
    {
        res.clearCookie("refreshToken",{path:'/api'});
        return res.status(401).json({
            code:"REFRESH_REJECTED",
            message:"Refresh got rejected",
        })
    }

    const cookie = req.cookies?.refreshToken;
    if(!cookie)
    {
        return res.status(401).json({
            code:"NO_REFRESH_TOKEN",
            message:"Refresh token missing"
        })
    }

    try{
        // 1. Verify the token string
        const payload = jwt.verify(cookie,REFRESH_SECRET);

         // 2. Cast payload as jwt.JwtPayload to read .sub safely
         const userId = (payload as jwt.JwtPayload).sub;

         // 3. Sign the new access token using the extracted sub
        const accessToken = jwt.sign({sub:userId},ACCESS_SECRET,{
            expiresIn:ACCESS_TTL_SECONDS
        });

          // 4. Send the new token back to the user
        return res.status(200).json({
            accessToken,
            expiresIn:ACCESS_TTL_SECONDS
        })

    }
    catch{
        return res.status(401).json({
            code:"REFRESH_INVALID",
            message:"Refresh Invalid"
        })
    }


})
export default router;



