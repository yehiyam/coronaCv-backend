const db = require('../storage/mongo');
const monitorImagePost = async (data) => {
    const {
        file,
        imageId,
        monitorId,
        timestamp
    } = data;

    // send to ocr

    // save to database
    await db.saveMonitorImage({ imageId, monitorId, timestamp, file })
    const ret = {
        monitorId,
        nextImageId: imageId + 1
    }
    return ret;
}

const monitorImageGetLatest = async ({ monitorId }) => {
    const ret = db.getMonitorImage({monitorId});
    return ret;
}

module.exports = {
    monitorImagePost,
    monitorImageGetLatest
}