import { BN } from "bn.js";
import { IdentityUpdateRequest, IdentityUpdateResponse, IdentityUpdateEnvelope } from "../../vdxf/classes/identity/IdentityUpdateEnvelope";
import { IdentityUpdateRequestDetails } from "../../vdxf/classes/identity/IdentityUpdateRequestDetails";
import { IdentityUpdateResponseDetails } from "../../vdxf/classes/identity/IdentityUpdateResponseDetails";
import { ContentMultiMap, IDENTITY_VERSION_PBAAS, IdentityID, KeyID, SaplingPaymentAddress } from "../../pbaas";
import { PartialIdentity } from "../../pbaas/PartialIdentity";
import { ResponseUri } from "../../vdxf/classes/ResponseUri";
import { PartialMMRData } from "../../pbaas/PartialMMRData";
import { PartialSignData, PartialSignDataInitData } from "../../pbaas/PartialSignData";
import { DATA_TYPE_MMRDATA } from "../../constants/pbaas";
import { TEST_BASE_SIGN_DATA_WITH_MMR_DATA, TEST_CLI_ID_UPDATE_REQUEST_JSON, TEST_CLI_ID_UPDATE_REQUEST_JSON_HEX, TEST_CREATEDAT, TEST_EXPIRYHEIGHT, TEST_MMR_DATA, TEST_PARTIAL_IDENTITY, TEST_REQUESTID, TEST_SALT, TEST_SIGNDATA_MAP, TEST_SIGNINGID, TEST_SYSTEMID, TEST_TXID } from "../constants/fixtures";

describe("IdentityUpdateEnvelope Serialization", () => {
  function testSerialization(instance) {
    const fromBufferInstance = new instance.constructor();
    fromBufferInstance.fromBuffer(instance.toBuffer());
    expect(fromBufferInstance.toBuffer().toString("hex")).toBe(instance.toBuffer().toString("hex"));
  }

  function testJsonSerialization(instance) {
    const json = instance.toJson();
    const fromJsonInstance = instance.constructor.fromJson(json);
    const newJson = fromJsonInstance.toJson();

    expect(newJson).toEqual(json);
  }

  function testCLIJsonSerialization(instance: IdentityUpdateRequestDetails) {
    const cliJson = instance.toCLIJson();

    const fromCLIJsonInstance = IdentityUpdateRequestDetails.fromCLIJson(cliJson);
    
    expect(fromCLIJsonInstance.toCLIJson()).toEqual(cliJson);
  }

  test("Serialize/Deserialize unsigned IdentityUpdateRequest", () => {
    const requestDetails = new IdentityUpdateRequestDetails({ 
      requestid: TEST_REQUESTID, 
      createdat: TEST_CREATEDAT, 
      systemid: TEST_SYSTEMID, 
      identity: TEST_PARTIAL_IDENTITY, 
      expiryheight: TEST_EXPIRYHEIGHT, 
      salt: TEST_SALT, 
      signdatamap: TEST_SIGNDATA_MAP
    });
    const request = new IdentityUpdateRequest({ details: requestDetails });
    testSerialization(request);
    testCLIJsonSerialization(request.details as IdentityUpdateRequestDetails);
  });

  test("Serialize/Deserialize signed IdentityUpdateRequest", () => {
    const requestDetails = new IdentityUpdateRequestDetails({ 
      requestid: TEST_REQUESTID, 
      createdat: TEST_CREATEDAT, 
      systemid: TEST_SYSTEMID, 
      identity: TEST_PARTIAL_IDENTITY, 
      expiryheight: TEST_EXPIRYHEIGHT, 
      salt: TEST_SALT, 
      signdatamap: TEST_SIGNDATA_MAP
    });
    const request = new IdentityUpdateRequest({ 
      details: requestDetails, 
      systemid: TEST_SYSTEMID, 
      signingid: TEST_SIGNINGID, 
      signature: "AeNjMwABQSAPBEuajDkRyy+OBJsWmDP3EUoqN9UjCJK9nmoSQiNoZWBK19OgGCYdEqr1CiFfBf8SFHVoUv4r2tb5Q3qsMTrp" 
    });

    testSerialization(request);
    testCLIJsonSerialization(request.details as IdentityUpdateRequestDetails);
  });

  test("Serialize/Deserialize unsigned IdentityUpdateResponse", () => {
    const responseDetails = new IdentityUpdateResponseDetails({ requestid: TEST_REQUESTID, createdat: TEST_CREATEDAT });
    const response = new IdentityUpdateResponse({ details: responseDetails });
    testSerialization(response);
  });

  test("Serialize/Deserialize signed IdentityUpdateResponse", () => {
    const responseDetails = new IdentityUpdateResponseDetails({ requestid: TEST_REQUESTID, createdat: TEST_CREATEDAT });
    const response = new IdentityUpdateResponse({ 
      details: responseDetails, 
      systemid: TEST_SYSTEMID, 
      signingid: TEST_SIGNINGID, 
      signature: "AeNjMwABQSAPBEuajDkRyy+OBJsWmDP3EUoqN9UjCJK9nmoSQiNoZWBK19OgGCYdEqr1CiFfBf8SFHVoUv4r2tb5Q3qsMTrp" 
    });
    testSerialization(response);
  });

  test("Remove optional fields from unsigned IdentityUpdateRequest", () => {
    let baseRequestDetailsConfig = { 
      requestid: TEST_REQUESTID, 
      createdat: TEST_CREATEDAT, 
      systemid: TEST_SYSTEMID, 
      identity: TEST_PARTIAL_IDENTITY,
      expiryheight: TEST_EXPIRYHEIGHT,
      responseuris: [ResponseUri.fromUriString("http:/127.0.0.1:8000", ResponseUri.TYPE_REDIRECT), ResponseUri.fromUriString("http:/127.0.0.1:8000", ResponseUri.TYPE_POST)],
      signdatamap: TEST_SIGNDATA_MAP,
      salt: TEST_SALT
    };

    const toRemove = ["expiryheight", "responseuris", "signdatamap", "salt", "systemid"];

    for (let i = 0; i < toRemove.length + 1; i++) {
      const newRequestDetails = new IdentityUpdateRequestDetails({ ...baseRequestDetailsConfig });
      const request = new IdentityUpdateRequest({ details: newRequestDetails });

      testSerialization(request);
      testCLIJsonSerialization(request.details as IdentityUpdateRequestDetails);

      if (i < toRemove.length) {
        delete baseRequestDetailsConfig[toRemove[i]]
      }
    }
  });

  test("Remove optional fields from IdentityUpdateResponse", () => {
    const txidbuf = Buffer.from(TEST_TXID, 'hex').reverse();
    let baseResponseDetailsConfig = { requestid: TEST_REQUESTID, createdat: TEST_CREATEDAT, txid: txidbuf, TEST_SALT };
   
    const toRemove = ["txid", "salt"];

    for (let i = 0; i < toRemove.length + 1; i++) {
      const newResponseDetails = new IdentityUpdateResponseDetails({ ...baseResponseDetailsConfig });
      const response = new IdentityUpdateResponse({ details: newResponseDetails });

      testSerialization(response);

      if (i < toRemove.length) {
        delete baseResponseDetailsConfig[toRemove[i]]
      }
    }
  });

  test("Serialize/Deserialize IdentityUpdateRequest to/from JSON", () => {
    const requestDetails = new IdentityUpdateRequestDetails({ 
      requestid: TEST_REQUESTID, 
      createdat: TEST_CREATEDAT, 
      systemid: TEST_SYSTEMID, 
      identity: TEST_PARTIAL_IDENTITY, 
      expiryheight: TEST_EXPIRYHEIGHT, 
      salt: TEST_SALT, 
      signdatamap: TEST_SIGNDATA_MAP
    });

    const request = new IdentityUpdateRequest({ details: requestDetails });
    testJsonSerialization(request);
    testCLIJsonSerialization(request.details as IdentityUpdateRequestDetails);
  });

  test("Serialize/Deserialize signed IdentityUpdateRequest to/from JSON", () => {
    const requestDetails = new IdentityUpdateRequestDetails({ 
      requestid: TEST_REQUESTID, 
      createdat: TEST_CREATEDAT, 
      systemid: TEST_SYSTEMID, 
      identity: TEST_PARTIAL_IDENTITY, 
      expiryheight: TEST_EXPIRYHEIGHT, 
      salt: TEST_SALT, 
      signdatamap: TEST_SIGNDATA_MAP
    });

    const request = new IdentityUpdateRequest({ 
      details: requestDetails, 
      systemid: TEST_SYSTEMID, 
      signingid: TEST_SIGNINGID, 
      signature: "AeNjMwABQSAPBEuajDkRyy+OBJsWmDP3EUoqN9UjCJK9nmoSQiNoZWBK19OgGCYdEqr1CiFfBf8SFHVoUv4r2tb5Q3qsMTrp" 
    });

    testJsonSerialization(request);
    testCLIJsonSerialization(request.details as IdentityUpdateRequestDetails);
  });

  test("Serialize/Deserialize IdentityUpdateResponse to/from JSON", () => {
    const txidbuf = Buffer.from(TEST_TXID, 'hex').reverse();
    let baseResponseDetailsConfig = { requestid: TEST_REQUESTID, createdat: TEST_CREATEDAT, txid: txidbuf, salt: TEST_SALT };

    const responseDetails = new IdentityUpdateResponseDetails(baseResponseDetailsConfig);
    const response = new IdentityUpdateResponse({ details: responseDetails });
    testJsonSerialization(response);
  });

  test("Serialize/Deserialize signed IdentityUpdateResponse to/from JSON", () => {
    const txidbuf = Buffer.from(TEST_TXID, 'hex').reverse();
    let baseResponseDetailsConfig = { requestid: TEST_REQUESTID, createdat: TEST_CREATEDAT, txid: txidbuf, salt: TEST_SALT };

    const responseDetails = new IdentityUpdateResponseDetails(baseResponseDetailsConfig);

    const response = new IdentityUpdateResponse({ 
      details: responseDetails, 
      systemid: TEST_SYSTEMID, 
      signingid: TEST_SIGNINGID, 
      signature: "AeNjMwABQSAPBEuajDkRyy+OBJsWmDP3EUoqN9UjCJK9nmoSQiNoZWBK19OgGCYdEqr1CiFfBf8SFHVoUv4r2tb5Q3qsMTrp" 
    });

    testJsonSerialization(response);
  });

  test("Serialize/Deserialize IdentityUpdateRequestDetails to/from JSON", () => {
    const requestDetails = new IdentityUpdateRequestDetails({ 
      requestid: TEST_REQUESTID, 
      createdat: TEST_CREATEDAT, 
      systemid: TEST_SYSTEMID, 
      identity: TEST_PARTIAL_IDENTITY, 
      expiryheight: TEST_EXPIRYHEIGHT, 
      salt: TEST_SALT, 
      signdatamap: TEST_SIGNDATA_MAP
    });

    testJsonSerialization(requestDetails);
    testCLIJsonSerialization(requestDetails);
  });

  test("Serialize/Deserialize IdentityUpdateResponseDetails to/from JSON", () => {
    const responseDetails = new IdentityUpdateResponseDetails({ 
      requestid: TEST_REQUESTID, 
      createdat: TEST_CREATEDAT, 
      txid: Buffer.from(TEST_TXID, 'hex').reverse(), 
      salt: TEST_SALT
    });

    testJsonSerialization(responseDetails);
  });

  test("Serialize/Deserialize PartialIdentity to/from JSON", () => {
    testJsonSerialization(TEST_PARTIAL_IDENTITY);
  });

  test("Serialize/Deserialize PartialSignData to/from JSON", () => {
    const partialSignData = new PartialSignData(TEST_BASE_SIGN_DATA_WITH_MMR_DATA);
    testJsonSerialization(partialSignData);
  });

  test("Serialize/Deserialize PartialMMRData to/from JSON", () => {
    testJsonSerialization(TEST_MMR_DATA);
  });

  test("Serialize/Deserialize ResponseUri to/from JSON", () => {
    const responseUri = ResponseUri.fromUriString("http:/127.0.0.1:8000", ResponseUri.TYPE_REDIRECT);
    testJsonSerialization(responseUri);
  });

  test("Serialize/Deserialize ContentMultiMap to/from JSON", () => {
    const contentMultiMap = ContentMultiMap.fromJson({
      "iPsFBfFoCcxtuZNzE8yxPQhXVn4dmytf8j": [
        { "iK7a5JNJnbeuYWVHCDRpJosj3irGJ5Qa8c": "Test String 123454321" }
      ]
    });

    testJsonSerialization(contentMultiMap);
  });

  test("Deserialize cli identity update details", () => {
    const req = IdentityUpdateRequestDetails.fromCLIJson(TEST_CLI_ID_UPDATE_REQUEST_JSON);

    testCLIJsonSerialization(req);
  })

  test("Deserialize cli identity update details", () => {
    const req = IdentityUpdateRequestDetails.fromCLIJson(
      TEST_CLI_ID_UPDATE_REQUEST_JSON_HEX, 
      {
        systemid: TEST_SYSTEMID.toAddress() as string, 
        requestid: TEST_REQUESTID.toString(), 
        createdat: TEST_CREATEDAT.toString(), 
        expiryheight: TEST_EXPIRYHEIGHT.toString(), 
        responseuris: [
          ResponseUri.fromUriString("http:/127.0.0.1:8000", ResponseUri.TYPE_REDIRECT).toJson(), 
          ResponseUri.fromUriString("http:/127.0.0.1:8000", ResponseUri.TYPE_POST).toJson()
        ],
        salt: TEST_SALT.toString('hex'),
        txid: TEST_TXID
      }
    );

    const env = new IdentityUpdateRequest({ 
      details: req, 
      signingid: TEST_SIGNINGID, 
      systemid: TEST_SYSTEMID,
      signature: "AeNjMwABQSAPBEuajDkRyy+OBJsWmDP3EUoqN9UjCJK9nmoSQiNoZWBK19OgGCYdEqr1CiFfBf8SFHVoUv4r2tb5Q3qsMTrp"
    });

    const envBuf = env.toBuffer();

    const envFromBuf = new IdentityUpdateRequest();
    envFromBuf.fromBuffer(envBuf);

    expect(JSON.stringify(env.toJson())).toEqual(JSON.stringify(IdentityUpdateRequest.fromWalletDeeplinkUri(env.toWalletDeeplinkUri()).toJson()));
    testCLIJsonSerialization(req);
    testJsonSerialization(env);
    testSerialization(env);
  })

  test("Deserialize cli identity update details", () => {
    const detailsProps = {
      requestid: TEST_REQUESTID.toString(), 
      createdat: TEST_CREATEDAT.toString(), 
      expiryheight: TEST_EXPIRYHEIGHT.toString(), 
      responseuris: [
        ResponseUri.fromUriString("http:/127.0.0.1:8000", ResponseUri.TYPE_REDIRECT).toJson(), 
        ResponseUri.fromUriString("http:/127.0.0.1:8000", ResponseUri.TYPE_POST).toJson()
      ],
      salt: TEST_SALT.toString('hex'),
      txid: TEST_TXID
    };

    expect(IdentityUpdateRequestDetails.fromCLIJson(
      { name: "data" }, 
      detailsProps
    ).getIdentityAddress()).toEqual("iHhi8aSwJcA5SzP2jE2M3wcsuVcnMdh6Fr");

    expect(IdentityUpdateRequestDetails.fromCLIJson(
      { name: "Mozek86", parent: "iQ2TqQot9W7mLrcCRJKnAZmaPTTY6sx4S4" }, 
      detailsProps
    ).getIdentityAddress()).toEqual("i6joVUtMohssU9pFAwojYrZfF9EmyAB95K");

    expect(IdentityUpdateRequestDetails.fromCLIJson(
      { name: "VRSC" }, 
      detailsProps
    ).getIdentityAddress()).toEqual("i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV");
    
    expect(IdentityUpdateRequestDetails.fromCLIJson(
      { name: "VRSCTEST" }, 
      detailsProps
    ).getIdentityAddress()).toEqual("iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq");
  })
});
