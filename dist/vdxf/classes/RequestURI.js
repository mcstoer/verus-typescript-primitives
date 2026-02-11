"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestURI = void 0;
const bn_js_1 = require("bn.js");
const ResponseURI_1 = require("./ResponseURI");
class RequestURI extends ResponseURI_1.ResponseURI {
    constructor(data) {
        super(data);
        if (this.type == null) {
            this.type = ResponseURI_1.ResponseURI.TYPE_POST;
        }
        if (this.uri == null) {
            this.uri = Buffer.alloc(0);
        }
        this.assertPostType();
    }
    static fromUriString(str) {
        return new RequestURI({ uri: Buffer.from(str, 'utf-8'), type: ResponseURI_1.ResponseURI.TYPE_POST });
    }
    fromBuffer(buffer, offset) {
        const newOffset = super.fromBuffer(buffer, offset);
        this.assertPostType();
        return newOffset;
    }
    static fromJson(json) {
        return new RequestURI({
            type: new bn_js_1.BN(json.type, 10),
            uri: Buffer.from(json.uri, 'utf-8')
        });
    }
    assertPostType() {
        if (!this.type.eq(ResponseURI_1.ResponseURI.TYPE_POST)) {
            throw new Error("RequestURI type must be TYPE_POST");
        }
    }
}
exports.RequestURI = RequestURI;
