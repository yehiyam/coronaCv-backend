const NodeCache = require("node-cache");
class Cache {
    constructor() {
        this.cache = new NodeCache({
            stdTTL:600
        });
    }
}

module.exports = new Cache();