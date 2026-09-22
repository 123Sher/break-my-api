import express, { Application, Request, Response } from 'express';
import authRouter from "./routes/auth.js";
import protectedRouter from "./routes/protected.js";
import adminRouter from "./routes/admin.js";
import testingRouter from "./routes/testing.js";
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

app.use('/api',adminRouter);

app.use('/api',testingRouter);


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

// Flow 1: Logging in (POST /api/login)

// request in
//    |
//    v
// express.json()        turns the JSON text into req.body
//    |
//    v
// cookieParser()        fills req.cookies (unused for login)
//    |
//    v
// app.use("/api", authRouter)   URL starts with /api -> go into auth.ts
//    |
//    v
// router.post("/login")         method + path match -> your handler runs
//    |
//    +-- wrong credentials -> 401 INVALID_CREDENTIALS (stop)
//    |
//    +-- correct -> sign access token (15s, ACCESS_SECRET)
//                   sign refresh token (7d, REFRESH_SECRET)
//                   Set-Cookie: refreshToken (httpOnly)
//                   200 { accessToken, expiresIn }


// Flow 2: Calling the protected route (GET /api/protected)

// request in, with header  Authorization: Bearer <token>
//    |
//    v
// express.json(), cookieParser()   run first, as always
//    |
//    v
// app.use("/api", authRouter)      no GET /login here -> Express keeps looking
//    |
//    v
// app.use("/api", protectedRouter) URL starts with /api -> go into protected.ts
//    |
//    v
// router.get("/protected", requireAuth, handler)
//    |
//    v
// requireAuth runs FIRST (the guard):
//    |
//    +-- no header / not "Bearer "      -> 401 NO_TOKEN        (handler never runs)
//    +-- jwt.verify throws "expired"    -> 401 TOKEN_EXPIRED   (handler never runs)
//    +-- jwt.verify throws anything else -> 401 INVALID_TOKEN  (handler never runs)
//    +-- verify succeeds -> res.locals.user = payload, then next()
//                               |
//                               v
//                       your handler runs -> 200 { message, user, serverTime }