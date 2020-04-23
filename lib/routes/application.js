const express = require('express');
const asyncHandler = require('express-async-handler')
const {applicationPost} = require('../services/application')

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
               
                ret = await applicationPost(req, name, version)
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