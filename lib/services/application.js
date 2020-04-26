const db = require('../storage/mongo');
const fs = require('fs');
const config = require('../../config')
const formidable = require('formidable');

const applicationGet =  async (name) => {
    try {
        if (name){
            const app_versions = await db.getApplication({name})
            const ret = app_versions.map(app => (app.version))
            return ret
        }
    }
    catch (error){
        console.log("Error in applicationGet " + error.message)
        return undefined
    }
}

const getLatestVersion = async (name) => {
    try {
        if (name){
            const latest_version = await db.getLatestVersion({name})
            const ret = latest_version.map(app => (app.version))
            return ret
        }
    }
    catch (error){
        console.log("Error in getLatestVersion " + error.message)
        return undefined
    }
}

const applicationGetFile = async (name, version) => {
    try {
        if(!name)
            throw new Error("Application name must be valid")
        if(!version)
            throw new Error("Application version must be valid")
        console.log("@",name, version)
        if (name && version){
            const application_doc = await db.getApplication({name, version})
            const file = application_doc.map(doc => (doc.path))
            const path = file[0]
            return path
        }
        }
    catch (error){
        console.log("Error in getLatestVersion " + error.message)
        return undefined
    }
}

const applicationPost = async (req, name, version) => {
    try{
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

        return new Promise((resolve, reject) =>{
            form.on('file', async function (_, file) {
            try{
                console.log('Uploaded ' + file.name, file.path, name);
                const path = ver_dir + "/" + file.name;
                ret = await db.saveApplication({ name, path, version });
                resolve(ret)
            }
            catch (error){
                reject(error.message)
            }});
        }
        )
     

    }
    catch(error) {
        console.log("Error in applicationPost " + error.message)
        return undefined
    }
}

module.exports = {
    applicationPost,
    applicationGet,
    getLatestVersion,
    applicationGetFile
}

        
// form.on('end', function() {
//     res.end('success');
//    });