const express = require('express');
const asyncHandler = require('express-async-handler')
const cache = require('../storage/cache');
const config = require('../../config')
const {applicationPost} = require('../services/application')
var fs = require('fs');

const { monitorImageGetLatest, monitorImageSaveOcr } = require('../services/monitor-image');

const app = () => {
    const router = express.Router();

    router.get('/:name/get_version', async (req, res, next) => {
        try {
            const name = req.params.name;          
            if (!name) {
                res.status(404)
                res.end();
            } else {
                res.send(name)
            }
        } catch (error) {
            res.statusCode = 500;
            res.json({ error: error.message })
        }
        next();
    });

    router.get('/:name/:version', async (req, res, next) => {
        try {
            const name = req.params.name;          
            const version = req.params.version;
            if (!name || !version) {
                res.status(404)
                res.end();
            } else {
                res.send("returning "+version+" of "+name)
            }
        } catch (error) {
            res.statusCode = 500;
            res.json({ error: error.message })
        }
        next();
    });

    router.post('/:name/:version', async (req, res, next) => {
        try {
            const name = req.params.name;          
            const version = req.params.version;
            const body = req.body;
            const data = {
                file: body,
                name,
                version
            }

            if (!name || !version) {
                res.status(404)
                res.end();
            } else {
                
                if (!fs.existsSync(config.applicationConfig.filesLocation)){
                    fs.mkdirSync(config.applicationConfig.filesLocation);
                }
                const dir = config.applicationConfig.filesLocation + "/"+name

                if (!fs.existsSync(dir)){
                    fs.mkdirSync(dir);
                }

                ret = await applicationPost(data)
                if(!ret){
                    res.status(404)
                    res.end();
                }
                const fileName = dir+"/"+name
                fs.writeFile(fileName, ret, function (err) {
                    if (err) throw err;
                    console.log("It's saved");
                  });
                res.send("returning "+version+" of "+name)
            }
        } catch (error) {
            res.statusCode = 500;
            res.json({ error: error.message })
        }
        next();
    });

    return { router, path: '/app' }
}

module.exports = app;