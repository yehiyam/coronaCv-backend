const axios = require('axios').default;
const moment = require('moment');
const { coviewConfig } = require('../../config');
const { monitorList, monitorGet } = require('./monitor');
const { monitorImageGetLatest } = require('./monitor-image');
const { nameMapping } = require('../helpers/mapping');
const options = {
    timeout: 10000
}
const baseUrl = () => (`${coviewConfig.schema}://${coviewConfig.host}:${coviewConfig.port}/${coviewConfig.path}`);

const sendMeasure = async (data) => {
    const url = `${baseUrl()}`
    const res = await axios.request({
        url,
        method: 'post',
        data,
        headers: { 'content-type': 'application/json' },
        ...options
    });
    if (coviewConfig.logRequests) {
        console.log(`sent to coview: ${data}`)
    }
    console.log(`recived ${res && res.data} form coview`);

    return {
        status: "Ok"
    }

}

const mapName = (name, deviceCategory) => {
    try {
        const device = nameMapping[deviceCategory];
        if (!device) {
            return name;
        }
        const mappedName = device[name] && device[name].coview;
        return mappedName;
    }
    catch (ex) {
        return name;
    }
}

const handle = async () => {
    try {
        const monitors = await monitorList();
        const monitorsInfo = await Promise.all(monitors.map(m => monitorGet({ monitorId: m })));
        const monitorsData = await Promise.all(monitors.map(m => monitorImageGetLatest({ monitorId: m })));
        const now = moment();
        const filtered = monitorsData.filter(m => m && now.diff(moment(m.timestamp)) < coviewConfig.intervalMs);
        if (filtered.length) {
            const transformed = filtered.map(m => {
                const monitorInfo = monitorsInfo.find(mi => mi.monitorId === m.monitorId) || {};
                const initial = { timestamp: now.valueOf(), id: m.monitorId, name: `${monitorInfo.roomId}:${monitorInfo.patientId}` };
                const mapped = m.ocrResults.map(r => {
                    if (r.value && r.name) {
                        const name = mapName(r.name, monitorInfo.deviceCategory);
                        if (name) {
                            return { name, value: r.value }
                        }
                        return null;
                    }
                }).filter(r => r);
                if (mapped.length > 0) {
                    const reduced = mapped.reduce((prev, cur) => {
                        if (cur.value && cur.name) {
                            const name = mapName(cur.name, monitorInfo.deviceCategory);
                            if (name) {
                                prev[name] = cur.value;
                            }
                        }
                        return prev;
                    }, initial);
                    return reduced;
                }
                return null;
            }).filter(r => r);
            if (transformed.length > 0) {
                const stringified = transformed.map(JSON.stringify).join('\n');
                result = await sendMeasure(stringified);
            }
            else {
                console.log(`no mapped data to send to coview in the last ${coviewConfig.intervalMs} milli`);
            }
        }
        else {
            console.log(`no data to send to coview in the last ${coviewConfig.intervalMs} milli`);
        }
    }
    catch (ex) {
        console.error(`error in coview handle: ${ex.message}`);
    }
    finally {
        if (coviewConfig.enabled) {
            setTimeout(handle, coviewConfig.intervalMs);
        }
    }
}
const start = () => {
    if (coviewConfig.enabled) {
        setTimeout(handle, coviewConfig.intervalMs);
    }
}

module.exports = {
    sendMeasure,
    start
}