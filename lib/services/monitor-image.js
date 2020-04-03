const db = require('../storage/mongo');
const cv = require('./cv')
const metrics = require('./metrics')
const { monitorSetupPost } = require('./monitor-setup');
const { monitorPost, monitorGet } = require('./monitor');
const monitorImagePost = async (data) => {
    const {
        file,
        imageId,
        timestamp,
        monitorId
    } = data;

    // send to align
    let aligned
    try
    {
        console.log(`before align ${imageId}`)
        aligned = await cv.alignImage({ file })
    }
    catch (e){
        console.error("Cannot perform align: " + e.message)
        throw e
    }
    const { file: alignedFile } = aligned;
    await monitorSetupPost({ monitorId, timestamp });
    const monitor = await monitorGet({ monitorId })
    const { segments } = monitor
    let ocred = [];
    if (alignedFile && Buffer.isBuffer(alignedFile)) {
        try {
            const encodedFile = alignedFile.toString('base64');
            try {
                ocrResultsFromDevice = await db.getMonitorOcrFromDevice({ monitorId, imageId });
                if (ocrResultsFromDevice) {
                    ocrResultsFromDevice.forEach(d => {
                        found = false;
                        segments.forEach(s => {
                            if (d.name === s.name) {
                                found = true;
                                s.top = d.top;
                                s.left = d.left;
                                s.bottom = d.bottom;
                                s.right = d.right;
                                s.value = d.value;
                                s.score = d.score;
                                s.source = 'device';
                            }
                        });
                        if (!found) {
                            segments.push(d);
                        }
                    });
                }
            }
            catch (e) {
                console.log("Cannot get ocr data from mobile: " + e.message)
            }
            ocred = await cv.ocr({ segments, image: encodedFile });
            // console.log(JSON.stringify(ocred, null, 2))
        }
        catch (e) {
            console.log("Cannot perform ocr: " + e.message)
        }
    }
    const imageIdNumber = parseInt(imageId);
    if (Number.isInteger(imageIdNumber)) {
        metrics['image_id'].set({ value: imageIdNumber, labelValues: { monitorId } });
    }

    // write metrics
    if (ocred) {
        ocred.forEach(s => {
            metrics['monitor_data'].set({ value: parseFloat(s.value) || 0, labelValues: { monitorId, segment_name: s.segment_name } });
        })
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