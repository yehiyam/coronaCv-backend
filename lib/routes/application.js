const express = require('express');
const asyncHandler = require('express-async-handler')
const cache = require('../storage/cache');
const config = require('../../config')
const {applicationPost} = require('../services/application')
var fs = require('fs');
var formidable = require('formidable');
const mongo = require('../storage/mongo')


const { monitorImageGetLatest, monitorImageSaveOcr } = require('../services/monitor-image');

const app = () => {
    const router = express.Router();
    
    // router.get('/:name/get_version', async (req, res, next) => {
    //     try {
    //         const name = req.params.name;          
    //         if (!name) {
    //             res.status(404)
    //             res.end();
    //         } else {
    //             res.send(name)
    //         }
    //     } catch (error) {
    //         res.statusCode = 500;
    //         res.json({ error: error.message })
    //     }
    //     next();
    // });

    // router.get('/:name/:version', async (req, res, next) => {
    //     try {
    //         const name = req.params.name;          
    //         const version = req.params.version;
    //         if (!name || !version) {
    //             res.status(404)
    //             res.end();
    //         } else {
    //             res.send("returning "+version+" of "+name)
    //         }
    //     } catch (error) {
    //         res.statusCode = 500;
    //         res.json({ error: error.message })
    //     }
    //     next();
    // });

    router.post('/:name/:version', async (req, res, next) => {
        try {
            const name = req.params.name;   
            const version = req.params.version;

            if (!name || !version) {
                res.status(404)
                res.end();
            } else {
                
                if (!fs.existsSync(config.applicationConfig.filesLocation)){
                    fs.mkdirSync(config.applicationConfig.filesLocation);
                }
                const app_dir = config.applicationConfig.filesLocation + "/"+name

                if (!fs.existsSync(app_dir)){
                    fs.mkdirSync(app_dir);
                }
                const ver_dir = app_dir+"/"+version
                if (!fs.existsSync(ver_dir)){
                    fs.mkdirSync(ver_dir);
                }
            var form = new formidable.IncomingForm();

            form.parse(req);
        
            form.on('fileBegin', function (name, file){
                file.path = ver_dir + "/"+ file.name;
            });
        
            form.on('file', function (name, file){
                console.log('Uploaded ' + file.name);
            });
            res.status(200)
            res.send("")
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