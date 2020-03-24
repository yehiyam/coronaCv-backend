const axios = require('axios').default;
const path = require('path');
const align_image = '/align_image';
const { cvConfig } = require('../../config');
const options = {
    timeout: 10000
}
const alignImage = async ({ file }) => {
    // return {file, monitorId: 55};
    const url = `${cvConfig.schema}://${cvConfig.host}:${cvConfig.port}/${cvConfig.path}${align_image}`
    const res = await axios.request({
        url,
        method: 'post',
        data: file,
        headers: { 'content-type': 'image/jpeg' },
        ...options
    });
    const monitorId = res.headers['x-monitor-id'];
    const alignedFile = res.data;
    return {
        monitorId,
        file: alignedFile
    }

}

module.exports = {
    alignImage
}