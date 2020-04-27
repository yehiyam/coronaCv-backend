const express = require('express');
const { sendImages, timeouts } = require('../../config');
const cache = require('../storage/cache');

const { monitorImageGetLatest, monitorImageSaveOcr } = require('../services/monitor-image');

const monitorData = () => {
  const router = express.Router();

  router.post(['/', '/:monitorId'], async (req, res) => {
    const {
      monitorId, imageId, timestamp = Date.now(), segments,
    } = req.body;
    console.log(` ocr for ${imageId}, ${monitorId} ${JSON.stringify(segments)}`);
    if (monitorId == null) {
      res.statusCode = 404;
      res.json({ error: 'monitorId is mandatory' });
    }
    if (imageId == null) {
      res.statusCode = 404;
      res.json({ error: 'imageId is mandatory' });
    }
    const sendImagesRequested = Date.now() - (cache.lastRequestedImageForMonitor[monitorId] || 0) < timeouts.sendImagesTimeout;
    const autofocusRequested = Date.now() - (cache.lastRequestedFocusForMonitor[monitorId] || 0) < timeouts.autofocusTimeout;
    try {
      const ret = await monitorImageSaveOcr({
        monitorId, imageId, timestamp, segments,
      });
      if (!ret) {
        res.status(404);
        res.end();
        return;
      }
      res.set('x-image-id', ret.imageId);
      res.set('x-timestamp', ret.timestamp);
      res.json({ sendImages: sendImages && sendImagesRequested, autofocus: autofocusRequested });
    } catch (error) {
      res.statusCode = 500;
      res.json({ error: error.message });
    }
    console.log(`post monitorData ${monitorId}, image: ${imageId}`);
  });
  router.get('/:monitorId', async (req, res, next) => {
    const { monitorId } = req.params;
    const imageId = req.headers['x-image-id'] ? parseInt(req.headers['x-image-id'], 10) : null;

    if (monitorId == null) {
      res.statusCode = 404;
      res.json({ error: 'not found' });
    }
    try {
      const ret = await monitorImageGetLatest({ monitorId, imageId });
      if (!ret) {
        res.status(404);
        res.end();
        return;
      }

      res.set('x-image-id', ret.imageId);
      res.set('x-timestamp', ret.timestamp);
      res.json({ segments: ret.ocrResults, timestamp: ret.timestamp, imageId: ret.imageId });
    } catch (error) {
      res.statusCode = 500;
      res.json({ error: error.message });
    }
    next();
  });
  return { router, path: '/monitor_data' };
};

module.exports = monitorData;
