import express, { Application, Request, Response } from 'express';
import cookieParser from "cookie-parser";


//This code sets up a standard, production-ready foundation for a Node.js backend.
//  You are initializing your server application and 
// mounting two essential pieces of middleware that handle incoming user data.
const app: Application = express();

app.use(express.json());

//For secure authentication systems, you want to store your session tokens (JWTs) 
// inside protected browser cookies rather than local storage. 
// This middleware reads the raw text headers sent by the client's browser,
//  extracts the cookies, and organizes them perfectly into a req.cookies object.
app.use(cookieParser());

app.get("/api/health",(req:Request,res:Response) => {
    res.json({ok: true});
})


const PORT = 3001;
app.listen(PORT,() =>console.log(`Mock server on http://localhost:${PORT}`));