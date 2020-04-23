const db = require('../storage/mongo');
const fs = require('fs');
const config = require('../../config')
var formidable = require('formidable');

const monitorList = async () => {
    // save to database
    const monitors = await db.getMonitors()
    const ret = monitors.map(m => (m.monitorId))
    return ret;
}

const applicationPost = async (req, name, version) => {
try{
    
    console.log("In app post")
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
    form.on('fileBegin', async function (name, file){
        file.path = ver_dir + "/"+ file.name;
    });

    form.on('file', function (name, file) {
    console.log('Uploaded ' + file.name);
    });

    const path = ver_dir + "/" + name;
    console.log("Path " + path);
    ret = await db.saveApplication({ name, path, version });
    console.log(ret);
}
catch(error) {
    console.log("ERROR")
    return undefined
}
}

module.exports = {
    applicationPost
}
