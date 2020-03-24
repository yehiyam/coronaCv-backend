const express = require('express');
const { monitorImagePost, monitorImageGetLatest } = require('../services/monitor-image');
const multer = require('multer');
const upload = multer();

const monitorImages = () => {
    const router = express.Router();
    router.post('/', upload.none(), async (req, res, next) => {
        const body = req.body;
        const imageId = parseInt(req.headers['x-image-id'] || 0);
        const monitorId = req.headers['x-monitor-id'];
        const timestamp = req.headers['x-timestamp'];

        const data = {
            file: body,
            imageId,
            monitorId,
            timestamp
        }
        try {
            const ret = await monitorImagePost(data);
            res.json(ret)
        } catch (error) {
            res.statusCode = 500;
            res.json({ error: 'Internal error' })
        }
        next();
    });

    router.get('/:monitorId', async (req, res, next) => {
        const monitorId = req.params.monitorId;
        const imageId = req.headers['x-image-id'] ? parseInt(req.headers['x-image-id']) : null;

        if (monitorId == null) {
            res.statusCode = 404;
            res.json({ error: 'not found' })
        }
        try {
            const ret = await monitorImageGetLatest({ monitorId, imageId });
            res.set('x-image-id', ret.imageId);
            res.set('x-timestamp', ret.timestamp);
            res.type('jpeg')
            res.write(ret.file)
            res.end();
        } catch (error) {
            res.statusCode = 500;
            res.json({ error: 'Internal error' })
        }
        next();

    })
    return { router, path: '/monitor_image' }
}

module.exports = monitorImages;