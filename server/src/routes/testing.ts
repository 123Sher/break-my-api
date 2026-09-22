
import {Router} from "express";
import multer from "multer";
import { MIMEType } from "node:util";

const upload = multer({storage:multer.memoryStorage()});
//multer.memoryStorage() keeps each uploaded file as a Buffer in memory 
// (req.file or req.files), rather than writing it to your filesystem. 
// Fine for a demo; a real app would use disk storage or stream straight to cloud storage.

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

router.post("/upload",upload.single("file"), (req,res) => {

    //upload.single("file") is middleware, just like requireAuth. 
    // It runs before your handler, parses the multipart body, 
    // and populates req.file and req.body. 
    // The string "file" must match the field name the client 
    // uses when appending the file to FormData (formData.append("file", someFile)). 
    // If the client uses a different field name, multer won't find it 
    // and req.file stays undefined, which is a very common real-world bug worth knowing about now.
    if(!req.file)
    {
        return res.status(400).json({
            code:"NO_FILE",
            message:"No file was uploaded"
        })
    }

    return res.status(200).json({
        file:{
            name:req.file.originalname,
            size:req.file.size,
            mimetype:req.file.mimetype,
        },
        fields:req.body
        //req.body here will contain any other text fields sent alongside the file, 
        // e.g. { description: "profile photo" }, 
        // since multer fills that in from the multipart form, 
        // not from express.json() 
        // (JSON and multipart are different content types, handled by different parsers).
    })

})

export default router;
