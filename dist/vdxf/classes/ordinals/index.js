"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
const register_1 = require("../../../constants/ordinals/register");
__exportStar(require("./DataDescriptorOrdinalVdxfObject"), exports);
__exportStar(require("./IdentityUpdateRequestOrdinalVdxfObject"), exports);
__exportStar(require("./IdentityUpdateResponseOrdinalVdxfObject"), exports);
__exportStar(require("./OrdinalVdxfObject"), exports);
__exportStar(require("./OrdinalVdxfObjectOrdinalMap"), exports);
__exportStar(require("./SerializableEntityOrdinalVdxfObject"), exports);
__exportStar(require("./VerusPayInvoiceOrdinalVdxfObject"), exports);
__exportStar(require("./LoginRequestDetailsOrdinalVdxfObject"), exports);
__exportStar(require("./LoginResponseDetailsOrdinalVdxfObject"), exports);
__exportStar(require("./AppEncryptionRequestOrdinalVdxfObject"), exports);
__exportStar(require("./ProvisionIdentityDetailsOrdinalVdxfObject"), exports);
__exportStar(require("./DataPacketResponseOrdinalVdxfObject"), exports);
__exportStar(require("./UserDataRequestOrdinalVdxfObject"), exports);
__exportStar(require("./UserSpecificDataPacketDetailsOrdinalVdxfObject"), exports);
(0, register_1.registerOrdinals)();
