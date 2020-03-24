const express = require('express');
const { monitorList,monitorGet } = require('../services/monitor');
const multer = require('multer');
const upload = multer();

const monitorSetup = () => {
    const router = express.Router();
    router.get('/:monitorId', upload.none(), async (req, res, next) => {
        try {
            const monitorId=req.params.monitorId;
            const ret = await monitorGet({monitorId});
            if (!ret){
                res.status(404)
                res.end();
            } else{
                res.json(ret)
            }
        } catch (error) {
            res.statusCode = 500;
            res.json({ error: 'Internal error' })
        }
        next();
    });

    router.get('/list', upload.none(), async (req, res, next) => {
        try {
            const ret = await monitorList();
            res.json(ret)
        } catch (error) {
            res.statusCode = 500;
            res.json({ error: 'Internal error' })
        }
        next();
    });
    
    return { router, path: '/monitor' }
}

module.exports = monitorSetup;