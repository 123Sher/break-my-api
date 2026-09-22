
import {Router} from "express";
import { resolve } from "node:dns";
import { stat } from "node:fs";

const router = Router();

const sleep = (ms:number) => new Promise((resolve) => setTimeout(resolve,ms));

router.get('/slow',async(req,res) => {
    const raw = req.query.delay;
    const delay = Number(raw);
    const delayMs = Number.isFinite(delay) && delay > 0 ? delay :10000;

    //Number("abc") is NaN, and Number.isFinite(NaN) is false, 
    // so this line safely falls back to the default whenever the input isn't a real positive number.

    await sleep(delayMs);

    return res.status(200).json({ message: `Responded after ${delayMs}ms`, delayMs });
})

router.get('/fail', (req,res) => {
    const raw = req.query.status;
    const status = Number(raw);
    const statusCode = Number.isFinite(status) && status>=100 && status<=599 ? status : 500;

    return res.status(statusCode).json({
        code:"FORCED_ERROR",
        message:`Forced ${statusCode} response`,
    })
})


router.post("/fail/validate",(req,res) => {
    return res.status(422).json({
        code:"VALIDATION_ERROR",
        message:"Validation error",
        errors:{
            email:"Email is required",
            password:"Password must be atleast 8 characters"
        }
    })
});


export default router;
