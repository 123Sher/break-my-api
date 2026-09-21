import { Router ,Request, Response} from "express";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

//The middleware goes between the path and the handler, which is how it runs first.
router.get("/protected",requireAuth,(req:Request,res:Response) => {
    return res.status(200).json({
        message:"Secret Data",
        user: res.locals.user.sub,
        serverTime: new Date().toISOString()
    })
})

export default router;