import type {Request,Response, NextFunction} from 'express';
import jwt from "jsonwebtoken";
import { ACCESS_SECRET } from '../config.js';

export function requireAuth(req:Request,res:Response,next:NextFunction)
{
    const header = req.headers.authorization;

    if(!header || !header.startsWith('Bearer '))
    {
        return res.status(401).json({
            code: "NO_TOKEN",
            message: "Token is missing",
        });
    }

    let token = header.slice(7); //removes the 7 characters of "Bearer "
    try{
        const payload = jwt.verify(token,ACCESS_SECRET);
        res.locals.user = payload;
        next();
    }
    catch(err)
    {
        if((err as Error).name == 'TokenExpiredError')
        {   
            return res.status(401).json({
                code:"TOKEN_EXPIRED",
                message: 'Token got expired'
            })
        }
        else
        {
            return res.status(401).json({
                code: "INVALID_TOKEN",
                message: 'Invalid Token'
            })
        }
    }

}