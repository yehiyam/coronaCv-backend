const express = require('express');
const formidable = require('formidable');
const {createApplicationDir, applicationGet, getLatestVersion, applicationGetFile, saveApplicationData} = require('../services/application')
const fs = require('fs');
path = require('path');
const {promisify}=require('util')
const stat = promisify(fs.stat)
const promiseReadFile = promisify(fs.readFile);

const app = () => {
    const router = express.Router();

    router.get('versions/:name', async (req, res, next) => {
        try {
            let name = req.params.name;   
            if (!name) {
                res.status(404)
                res.end();
                return
            } else {
                name = name.toLowerCase()
                ret = await applicationGet(name)
                if (!ret){
                    res.status(404)
                    res.end();
                    return
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
                return
            } else {
                
                name = name.toLowerCase()
                ret = await getLatestVersion(name)
                if (!ret){
                    res.status(404)
                    res.end();
                    return
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
                return
            } else {
                name = name.toLowerCase()
                ret = await applicationGetFile(name, version)
                if (!ret){
                    res.status(404)
                    res.end();
                    return
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
                let readStream = await promiseReadFile(filePath)
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
                return

            } else {
                
                name = name.toLowerCase()
                const ver_dir = await createApplicationDir(name, version)
                if(!ver_dir){
                   throw new Error("Error while creating file directory.")
                }

                var form = new formidable.IncomingForm();
                form.parse(req);

                form.on('fileBegin', function (name, file){
                    file.path = ver_dir + "/"+ file.name;
                });

                let ret = await new Promise((resolve, reject) => 
                {
                    form.on('file', async function (_, file) 
                    {
                        try{
                            const path = ver_dir + "/" + file.name;
                            const saveRet = await saveApplicationData(name,path,version)
                            if (saveRet){
                                resolve(saveRet)
                            }else{
                                reject("Error while saving application data.")
                            }
                        }
                        catch (error){
                            reject("Error while saving application data.")
                    }})
                }).then(
                    result => result
                ).catch(
                    error => {
                        console.log("Error at promise: ", error.message)
                        res.statusCode = 500;
                        res.json({ error: error.message })
                        return
                    }
                )
                if (ret){
                    res.json([name+" version "+ version +"successfuly saved."])
                }
                else{
                   throw new Error("Error while saving the data")
                }
        }
        } catch (error) {
            console.log("Error" + error.message)
            res.statusCode = 500;
            res.json({ error: error.message })
            return
        }
        next();
    });

    return { router, path: '/app' }
}

module.exports = app;