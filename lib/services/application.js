const db = require('../storage/mongo');
var fs = require('fs');
var formidable = require('formidable');

const monitorList = async () => {
    // save to database
    const monitors = await db.getMonitors()
    const ret = monitors.map(m => (m.monitorId))
    return ret;
}

const applicationPost = async (req, name, version) => {
try{
    // const { req , name, version } = data;
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
    const path =  ver_dir + "/"+ file.name
    console.log(path)
    form.on('fileBegin', function (name, file){
        file.path = path
    });

    form.on('file', function (name, file){
        console.log('Uploaded ' + file.name);
    });
    console.log("Before save to DB")
    // ret = db.saveApplication({name, path, version})
    console.log("Returned from saveApplication " +ret)
    return ret
}
catch(error) {
    return undefined
}
}

module.exports = {
    applicationPost
}
