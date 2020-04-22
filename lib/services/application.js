const db = require('../storage/mongo');

const monitorList = async () => {
    // save to database
    const monitors = await db.getMonitors()
    const ret = monitors.map(m => (m.monitorId))
    return ret;
}

const applicationPost = async (data) => {
    const {
        file,
        name,
        version
    } = data;

    let ret = undefined
    try {
        if (file && Buffer.isBuffer(file)) {
           ret = Buffer.from(file,'binary');
           return ret;
        }
    }
    catch (e) {
        console.error("Cannot get data from buffer: " + e.message)
        throw e
    }

    return ret
}

module.exports = {
    applicationPost
}
