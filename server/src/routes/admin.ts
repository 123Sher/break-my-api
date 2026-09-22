import {Router} from 'express';
import { state } from '../config.js';

const router = Router();

router.get('/admin/state',(req,res) => {
    return res.status(200).json(state);
})

router.post('/admin/reject-refresh/on',(req,res) => {
    state.rejectRefresh = true;
    return res.status(200).json(state);
})

router.post('/admin/reject-refresh/off',(req,res) => {
    state.rejectRefresh = false;
    return res.status(200).json(state);
})

router.post('/admin/reset',(req,res) => {
    state.refreshCalls =0;
    state.rejectRefresh = false;
    return res.status(200).json(state);
})

export default router;