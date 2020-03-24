const db = require('../storage/mongo');
const cv = require('./cv')
const monitorImagePost = async (data) => {
    const {
        file,
        imageId,
        timestamp
    } = data;

    // send to align
    const aligned = await cv.alignImage({file})
    const {monitorId, file: alignedFile} = aligned;

    // save to database
    await db.saveMonitorImage({ imageId, monitorId, timestamp, file: alignedFile })
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