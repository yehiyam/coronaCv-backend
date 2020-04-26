const express = require('express');
const asyncHandler = require('express-async-handler')
const {applicationPost, applicationGet, getLatestVersion, applicationGetFile} = require('../services/application')
const fs = require('fs');
path = require('path');

const app = () => {
    const router = express.Router();
    
    router.get('/:name/list', async (req, res, next) => {
        try {
            let name = req.params.name;   
            if (!name) {
                res.status(404)
                res.end();
            } else {
                name = name.toLowerCase()
                ret = await applicationGet(name)
                res.send(ret)
                
                if (!ret){
                    res.status(404)
                    res.end();
                }
                
        }
        } catch (error) {
            res.statusCode = 500;
            res.json({ error: error.message })
        }
        next();
    });

    router.get('/:name/get_version', async (req, res, next) => {
        try {
            let name = req.params.name;   
            if (!name) {
                res.status(404)
                res.end();
            } else {
                name = name.toLowerCase()
                ret = await getLatestVersion(name)
                
                res.send(ret)
                
                if (!ret){
                    res.status(404)
                    res.end();
                }
                
        }
        } catch (error) {
            res.statusCode = 500;
            res.json({ error: error.message })
        }
        next();
    });

    router.get('/:name/:version', async (req, res, next) => {
        try {
            let name = req.params.name;   
            const version = req.params.version;
            
            if (!name || !version) {
                res.status(404)
                res.end();
            } else {
                name = name.toLowerCase()
                ret = await applicationGetFile(name, version)
                let filePath = ret
                let splitted = filePath.split(".")
                type = splitted[splitted.length-1]
                var stat = fs.statSync(filePath);
                
                console.log(stat.size)
                res.writeHead(200, {
                    'Content-Type': 'application/'+type,
                    'Content-Length': stat.size,
                    'Content-Disposition': "filename=" + name +"_"+ version + "."+ type
                });
                var readStream = fs.createReadStream(filePath);
                readStream.pipe(res);
                          
                               
                if (!ret){
                    res.status(404)
                    res.end();
                }
                
        }
        } catch (error) {
            res.statusCode = 500;
            res.json({ error: error.message })
        }
        
        next();
    });


    router.post('/:name/:version', async (req, res, next) => {
        try {
            let name = req.params.name;   
            const version = req.params.version;

            if (!name || !version) {
                res.status(404)
                res.end();
            } else {
                name = name.toLowerCase()
                ret = await applicationPost(req, name, version)
                res.status(200)
                res.send("Uploading succeeded")
                res.end();
                if (!ret){
                    res.status(404)
                    res.end();
                }
                
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