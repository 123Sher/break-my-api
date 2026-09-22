
import {Router} from "express";
import { resolve } from "node:dns";

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

export default router;
