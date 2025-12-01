"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SerializableEntityOrdinalVDXFObject = void 0;
const OrdinalVDXFObject_1 = require("./OrdinalVDXFObject");
class SerializableEntityOrdinalVDXFObject extends OrdinalVDXFObject_1.OrdinalVDXFObject {
    constructor(request, entity) {
        if (!request || !request.type)
            throw new Error("Expected request with data and type");
        super({
            type: request.type
        });
        this.entity = entity;
        this.data = request.data ? request.data : new entity();
    }
    getDataByteLength() {
        return this.data.getByteLength();
    }
    toDataBuffer() {
        return this.data.toBuffer();
    }
    fromDataBuffer(buffer) {
        this.data = new this.entity();
        this.data.fromBuffer(buffer);
    }
}
exports.SerializableEntityOrdinalVDXFObject = SerializableEntityOrdinalVDXFObject;
