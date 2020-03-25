const db = require('../storage/mongo');
const cv = require('./cv')
const { monitorSetupPost } = require('./monitor-setup');
const { monitorPost, monitorGet } = require('./monitor');
const monitorImagePost = async (data) => {
    const {
        file,
        imageId,
        timestamp
    } = data;

    // send to align
    const aligned = await cv.alignImage({ file })
    const { monitorId, file: alignedFile } = aligned;
    await monitorSetupPost({ monitorId });
    const monitor = await monitorGet({ monitorId })
    const { segments } = monitor
    let ocred = [];
    if (alignedFile && Buffer.isBuffer(alignedFile)) {
        const encodedFile = alignedFile.toString('base64')
        ocred = await cv.ocr({ segments, image: encodedFile });
        // console.log(JSON.stringify(ocred, null, 2))
    }
    // save to database
    await db.saveMonitorImage({ imageId, monitorId, timestamp, file: alignedFile, ocrResults: ocred })
    const ret = {
        monitorId,
        nextImageId: imageId + 1
    }
    return ret;
}

const monitorImageGetLatest = async ({ monitorId, imageId }) => {
    const ret = await db.getMonitorImage({ monitorId, imageId });
    return ret;
}

module.exports = {
    monitorImagePost,
    monitorImageGetLatest,
}