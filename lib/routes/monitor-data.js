const express = require('express');
const asyncHandler = require('express-async-handler')

const { monitorImageGetLatest } = require('../services/monitor-image');

const monitorData = () => {
    const router = express.Router();

    router.post('/:monitorId', async (req, res, next) => {

        const {monitorId,imageId,patientId, roomId,deviceCategory,segments, data } = req.body;
        
    })
    router.get('/:monitorId', async (req, res, next) => {
        const monitorId = req.params.monitorId;
        const imageId = req.headers['x-image-id'] ? parseInt(req.headers['x-image-id']) : null;

        if (monitorId == null) {
            res.statusCode = 404;
            res.json({ error: 'not found' })
        }
        try {
            const ret = await monitorImageGetLatest({ monitorId, imageId });
            if (!ret) {
                res.status(404);
                res.end();
                return
            }

            res.set('x-image-id', ret.imageId);
            res.set('x-timestamp', ret.timestamp);
            res.json({ segments: ret.ocrResults, timestamp: ret.timestamp, imageId: ret.imageId })
        } catch (error) {
            res.statusCode = 500;
            res.json({ error: error.message })
        }
        next();

    })
    return { router, path: '/monitor_data' }
}

module.exports = monitorData;