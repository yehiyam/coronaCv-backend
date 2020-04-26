const express = require('express');
const {applicationPost, applicationGet, getLatestVersion, applicationGetFile} = require('../services/application')
const fs = require('fs');
path = require('path');
const {promisify}=require('util')
const stat = promisify(fs.stat)

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
                if (!ret){
                    res.status(404)
                    res.end();
                }
                res.json(ret)
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
                if (!ret){
                    res.status(404)
                    res.end();
                }
                res.json(ret)
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
                if (!ret){
                    res.status(404)
                    res.end();
                }
                let filePath = ret
                let splitted = filePath.split(".")
                const fileType = splitted[splitted.length-1]
                const fileStat = await stat(filePath)

                res.writeHead(200, {
                    'Content-Type': 'application/' + type,
                    'Content-Length': fileStat.size,
                    'Content-Disposition': "filename=" + name +"_"+ version + "."+ fileType
                });
                let readStream = fs.createReadStream(filePath);
                readStream.pipe(res)
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
                const ret = await applicationPost(req, name, version)
                // console.log(ret)
                // if (!ret){
                //     res.status(404)
                //     res.end();
                // }
                res.status(200)
                res.end();    
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