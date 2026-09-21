import express, { Application, Request, Response } from 'express';
import authRouter from "./routes/auth.js";
import protectedRouter from "./routes/protected.js";
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
app.use('/api', authRouter); // ->  prefix "/api"
//In auth.ts, router.post("/login",...) => route "/login",
//together it is :POST /api/login

app.use('/api',protectedRouter);


app.get("/api/health",(req:Request,res:Response) => {
    res.json({ok: true});
})


const PORT = 3001;
app.listen(PORT,() =>console.log(`Mock server on http://localhost:${PORT}`));


// Turns on helpers (express.json() reads JSON bodies, cookieParser() reads cookies).
// Says which URLs belong to which file: app.use("/api", authRouter) means "any URL starting with /api, go check auth.ts".
// Starts listening on port 3001.

// When a request comes in, Express checks it against everything you've registered, in order:

// express.json() runs first and turns the raw JSON text into req.body.
// cookieParser() runs and fills req.cookies.
// Express reaches app.use("/api", authRouter). The URL starts with /api, so it hands the request to the router, with the /api part removed. The router now sees just /login.
// The router looks for a matching route. router.post("/login") matches the method and path, so your handler function runs now.
// Inside the handler, res.status(...).json(...) sends the response, and that ends the request.