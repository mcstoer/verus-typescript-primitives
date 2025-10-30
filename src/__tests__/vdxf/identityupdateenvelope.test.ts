import { IdentityUpdateRequestDetails } from "../../vdxf/classes/identity/IdentityUpdateRequestDetails";
import { IdentityUpdateResponseDetails } from "../../vdxf/classes/identity/IdentityUpdateResponseDetails";
import { ContentMultiMap } from "../../pbaas";
import { ResponseUri } from "../../vdxf/classes/ResponseUri";
import { PartialSignData } from "../../pbaas/PartialSignData";
import { 
  TEST_BASE_SIGN_DATA_WITH_MMR_DATA, 
  TEST_CLI_ID_UPDATE_REQUEST_JSON, 
  TEST_CLI_ID_UPDATE_REQUEST_JSON_HEX, 
  TEST_CREATEDAT, 
  TEST_EXPIRYHEIGHT, 
  TEST_MMR_DATA, 
  TEST_PARTIAL_IDENTITY, 
  TEST_REQUESTID, 
  TEST_SALT, 
  TEST_SIGNDATA_MAP,
  TEST_SYSTEMID, 
  TEST_TXID 
} from "../constants/fixtures";

describe("IdentityUpdate request/response details Serialization", () => {
  function testSerialization(instance: any) {
    const fromBufferInstance = new instance.constructor();
    fromBufferInstance.fromBuffer(instance.toBuffer());
    expect(fromBufferInstance.toBuffer().toString("hex")).toBe(instance.toBuffer().toString("hex"));
  }

  function testJsonSerialization(instance: any) {
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

  test("Serialize/Deserialize basic IdentityUpdateRequestDetails", () => {
    const requestDetails = new IdentityUpdateRequestDetails({ 
      requestID: TEST_REQUESTID, 
      createdAt: TEST_CREATEDAT, 
      systemID: TEST_SYSTEMID, 
      identity: TEST_PARTIAL_IDENTITY, 
      expiryHeight: TEST_EXPIRYHEIGHT, 
      salt: TEST_SALT, 
      signDataMap: TEST_SIGNDATA_MAP
    });

    testSerialization(requestDetails);
    testCLIJsonSerialization(requestDetails);
  });

  test("Serialize/Deserialize basic IdentityUpdateResponseDetails", () => {
    const responseDetails = new IdentityUpdateResponseDetails({ requestID: TEST_REQUESTID, createdAt: TEST_CREATEDAT });

    testSerialization(responseDetails);
  });

  test("Remove optional fields from IdentityUpdateRequestDetails", () => {
    let baseRequestDetailsConfig = { 
      requestID: TEST_REQUESTID, 
      createdAt: TEST_CREATEDAT, 
      systemID: TEST_SYSTEMID, 
      identity: TEST_PARTIAL_IDENTITY,
      expiryHeight: TEST_EXPIRYHEIGHT,
      responseURIs: [ResponseUri.fromUriString("http:/127.0.0.1:8000", ResponseUri.TYPE_REDIRECT), ResponseUri.fromUriString("http:/127.0.0.1:8000", ResponseUri.TYPE_POST)],
      signDataMap: TEST_SIGNDATA_MAP,
      salt: TEST_SALT
    };

    const toRemove = ["expiryHeight", "responseURIs", "signDataMap", "salt", "systemID"];

    for (let i = 0; i < toRemove.length + 1; i++) {
      const newRequestDetails = new IdentityUpdateRequestDetails({ ...baseRequestDetailsConfig });

      testSerialization(newRequestDetails);
      testCLIJsonSerialization(newRequestDetails as IdentityUpdateRequestDetails);

      if (i < toRemove.length) {
        delete baseRequestDetailsConfig[toRemove[i]]
      }
    }
  });

  test("Remove optional fields from IdentityUpdateResponseDetails", () => {
    const txidbuf = Buffer.from(TEST_TXID, 'hex').reverse();
    let baseResponseDetailsConfig = { requestID: TEST_REQUESTID, createdAt: TEST_CREATEDAT, txid: txidbuf, TEST_SALT };
   
    const toRemove = ["txid", "salt"];

    for (let i = 0; i < toRemove.length + 1; i++) {
      const newResponseDetails = new IdentityUpdateResponseDetails({ ...baseResponseDetailsConfig });

      testSerialization(newResponseDetails);

      if (i < toRemove.length) {
        delete baseResponseDetailsConfig[toRemove[i]]
      }
    }
  });

  test("Serialize/Deserialize IdentityUpdateRequestDetails to/from JSON", () => {
    const requestDetails = new IdentityUpdateRequestDetails({ 
      requestID: TEST_REQUESTID, 
      createdAt: TEST_CREATEDAT, 
      systemID: TEST_SYSTEMID, 
      identity: TEST_PARTIAL_IDENTITY, 
      expiryHeight: TEST_EXPIRYHEIGHT, 
      salt: TEST_SALT, 
      signDataMap: TEST_SIGNDATA_MAP
    });

    testJsonSerialization(requestDetails);
    testCLIJsonSerialization(requestDetails);
  });

  test("Serialize/Deserialize IdentityUpdateResponseDetails to/from JSON", () => {
    const txidbuf = Buffer.from(TEST_TXID, 'hex').reverse();

    let baseResponseDetailsConfig = { requestID: TEST_REQUESTID, createdAt: TEST_CREATEDAT, txid: txidbuf, salt: TEST_SALT };

    const responseDetails = new IdentityUpdateResponseDetails(baseResponseDetailsConfig);

    testJsonSerialization(responseDetails);
  });

  test("Serialize/Deserialize IdentityUpdateRequestDetails to/from JSON", () => {
    const requestDetails = new IdentityUpdateRequestDetails({ 
      requestID: TEST_REQUESTID, 
      createdAt: TEST_CREATEDAT, 
      systemID: TEST_SYSTEMID, 
      identity: TEST_PARTIAL_IDENTITY, 
      expiryHeight: TEST_EXPIRYHEIGHT, 
      salt: TEST_SALT, 
      signDataMap: TEST_SIGNDATA_MAP
    });

    testJsonSerialization(requestDetails);
    testCLIJsonSerialization(requestDetails);
  });

  test("Serialize/Deserialize IdentityUpdateResponseDetails to/from JSON", () => {
    const responseDetails = new IdentityUpdateResponseDetails({ 
      requestID: TEST_REQUESTID, 
      createdAt: TEST_CREATEDAT, 
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

    testCLIJsonSerialization(req);
    testJsonSerialization(req);
    testSerialization(req);
  })

  test("Deserialize cli identity update details", () => {
    const detailsProps = {
      requestID: TEST_REQUESTID.toString(), 
      createdAt: TEST_CREATEDAT.toString(), 
      expiryHeight: TEST_EXPIRYHEIGHT.toString(), 
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
