const mongoose = require('mongoose');
const cache = require('./cache')
class Mongo {

    async init(config) {
        this._config = config;
        await mongoose.connect(this._config.connection, { useNewUrlParser: true });
        this._db = mongoose.connection;
        this._createSchemas();

    }

    _key({ monitorId, imageId }) {
        return `${monitorId}:${imageId}`;
    }
    _createSchemas() {
        const monitorImageSchema = new mongoose.Schema({
            monitorId: { type: String, index: true },
            imageId: { type: Number, index: true },
            file: Buffer,
            timestamp: { type: Date, index: true },
            ocrResults: { type: [{}] }
        });

        this._monitorImage = mongoose.model('monitorImage', monitorImageSchema);

        const monitorSetupSchema = new mongoose.Schema({
            monitorId: { type: String, index: true },
            monitorImage: Buffer,
            patientImage: Buffer,
            roomImage: Buffer,
            patientId: String,
            roomId: String,
            segments: { type: [{}] },
            imageId: { type: Number, index: true }
        });
        monitorSetupSchema.set('toObject', {
            transform: (doc, ret, options) => { delete ret['_id'] },
        })

        this._monitorSetup = mongoose.model('monitorSetup', monitorSetupSchema);

    }

    async saveMonitorImage(data) {
        try {
            const { file, ...toSave } = data;
            const doc = await this._monitorImage.create(toSave);
            await doc.save();
            cache.cache.set(this._key(data), file);
        } catch (error) {
            console.error('saveMonitorImage error: ' + error)
        }
    }

    async getMonitorImage({ monitorId, imageId }) {
        try {
            let doc;
            if (imageId != null) {
                doc = await this._monitorImage.find({
                    monitorId, imageId
                }).sort({ timestamp: 'desc' }).limit(1);
            }
            else {
                doc = await this._monitorImage.find({
                    monitorId
                }).sort({ timestamp: 'desc' }).limit(1);
            }
            if (doc && doc[0]) {
                const image = doc[0]
                const file = cache.cache.get(this._key(image))
                if (file) {
                    return { file, imageId: image.imageId, monitorId, timestamp: image.timestamp, ocrResults: image.ocrResults }
                }
                else return { imageId: image.imageId, monitorId, timestamp: image.timestamp, ocrResults: image.ocrResults }
            }
            return null;
        } catch (error) {
            console.error('saveMonitorImage error: ' + error)
            throw error;
        }
    }

    async getMonitors({ monitorId } = {}) {
        try {
            const query = monitorId ? {
                monitorId
            } : {

                }
            const doc = await this._monitorSetup.find(query);
            return doc;
        } catch (error) {
            console.error('getMonitors error: ' + error.message)
            throw error;
        }
    }

    async deleteMonitor({ monitorId }) {
        try {
            const query = {
                monitorId
            }
            const res1 = await this._monitorSetup.deleteMany(query);
            const res2 = await this._monitorImage.deleteMany(query);
            return {status: 'Deleted', monitors: res1.deletedCount, images: res2.deletedCount}
        } catch (error) {
            console.error('getMonitors error: ' + error.message)
            throw error;
        }
    };

    async updateMonitor(doc, { segments, imageId, ...data }) {
        if (segments) {
            doc.segments = segments;
            doc.markModified("segments");
        }
        doc.imageId = imageId
        doc.monitorImage = data.monitorImage ? Buffer.from(data.monitorImage, 'base64') : null;
        doc.monitorId = data.monitorId;
        doc.patientImage = data.patientImage ? Buffer.from(data.patientImage, 'base64') : null;
        doc.patientId = data.patientId;
        doc.roomImage = data.roomImage ? Buffer.from(data.roomImage, 'base64') : null
        doc.roomId = data.roomId;
        await doc.save();
        return doc;
    }

    async saveMonitorSetup(data) {
        try {
            const monitors = await this.getMonitors({ monitorId: data.monitorId })
            if (monitors && monitors[0]) {
                return await this.updateMonitor(monitors[0], data)
            }
            const doc = await this._monitorSetup.create(data);
            await doc.save();
        } catch (error) {
            console.error('saveMonitorSetup error: ' + error)
        }
    }
}

module.exports = new Mongo();