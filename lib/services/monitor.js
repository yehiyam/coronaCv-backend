const db = require('../storage/mongo');
const monitorList = async () => {
    // save to database
    const monitors = await db.getMonitors()
    const ret = monitors.map(m=>(m.monitorId))
    return ret;
}

const monitorGet = async ({monitorId}) => {
    // save to database
    const monitors = await db.getMonitors({monitorId})
    if (!monitors || !monitors[0]){
        return null 
    }
    const ret={
        monitorImage: monitors[0].monitorImage,
        monitorId: monitors[0].monitorId,
        patientImage: monitors[0].patientImage,
        patientId: monitors[0].patientId,
        roomImage: monitors[0].roomImage,
        roomId: monitors[0].roomId,
    } ;
    return ret;
}

module.exports = {
    monitorList,
    monitorGet
}