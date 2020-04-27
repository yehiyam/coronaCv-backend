const express = require('express');
const multer = require('multer');
const { monitorSetupPost } = require('../services/monitor-setup');

const upload = multer();

const monitorSetup = () => {
  const router = express.Router();
  router.post('/', upload.none(), async (req, res, next) => {
    const { body } = req;

    const data = { ...body };

    try {
      const ret = await monitorSetupPost(data);
      res.json(ret);
    } catch (error) {
      res.statusCode = 500;
      res.json({ error: 'Internal error' });
    }
    next();
  });


  return { router, path: '/monitor_setup' };
};

module.exports = monitorSetup;
