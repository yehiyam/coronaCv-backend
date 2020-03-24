const mongoose = require('mongoose');

class Mongo {

    async init(config) {
        this._config = config;
            await mongoose.connect(this._config.connection, { useNewUrlParser: true });
            this._db = mongoose.connection;
            this._createSchemas();
        
    }

    _createSchemas() {
        const monitorImageSchema = new mongoose.Schema({
            monitorId: { type: String, index: true },
            imageId: { type: Number, index: true },
            file: Buffer,
            timestamp: { type: Date, index: true },

        });

        this._monitorImage = mongoose.model('monitorImage', monitorImageSchema);

        const monitorSetupSchema = new mongoose.Schema({
            monitorId: { type: String, index: true },
            monitorImage: Buffer,
            patientImage: Buffer,
            roomImage: Buffer,
            patientId: String,
            roomId: String
        });

        this._monitorSetup = mongoose.model('monitorSetup', monitorSetupSchema);

    }

    async saveMonitorImage(data) {
        try {
            const doc = await this._monitorImage.create(data);
            await doc.save();
        } catch (error) {
            console.error('saveMonitorImage error: ' + error)
        }
    }

    async getMonitorImage({ monitorId }) {
        try {
            const doc = await this._monitorImage.find({
                monitorId
            }).sort({ timestamp: 'desc' }).limit(1);
            return doc && doc[0];
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
            console.error('getMonitors error: ' + error)
            throw error;
        }
    }
    async saveMonitorSetup(data) {
        try {
            const doc = await this._monitorSetup.create(data);
            await doc.save();
        } catch (error) {
            console.error('saveMonitorSetup error: ' + error)
        }
    }
}

module.exports = new Mongo();