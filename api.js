

const secp256k1 = require('secp256k1');
const axios = require('axios');
const crypto = require('crypto');
const fs = require('fs');
var requestp = require('request-promise-native');


const SERVER_BASE_URI = 'https://api.ownera.io';

function createCrypto(){
    // generate privKey
    let privKey;
    do {
    privKey = crypto.randomBytes(32);
    } while (!secp256k1.privateKeyVerify(privKey))

    // get the public key in a compressed format
    const pubKey = secp256k1.publicKeyCreate(privKey, true);
    return {private: privKey, public: pubKey};
}

async function createOwnerProfile(privKey, publicKey){
     const signature = signMessage(privKey, ['createOwnerProfile', publicKey]);
        
     const response = await axios.post(`${SERVER_BASE_URI}/api/profiles/owner`, {
        "publicKey": publicKey.toString('hex'),
        "signature": signature    
      }).catch(function (error) {
        if (error.response) {
            console.log(error.response.data);
            console.log(error.response.status);
            console.log(error.response.headers);
          } else if (error.request) {
            console.log(error.request);
          } else {
            console.log('Error', error.message);
          }
      });  
    console.log(`createOwnerProfile status Success`);
    console.log("profile = "+JSON.stringify(response.data, null, '\t'));
    return response.data;
}

async function createProfileForProvider(name){
    const response = await axios.post(`${SERVER_BASE_URI}/api/profiles/provider`, {
      "name": name
    }).catch(function (error) {
      if (error.response) {
          console.log(error.response.data);
          console.log(error.response.status);
          console.log(error.response.headers);
        } else if (error.request) {
          console.log(error.request);
        } else {
          console.log('Error', error.message);
        }
    });  
    console.log(`createProfileForProvider status Success`);
    console.log("profile = "+JSON.stringify(response.data, null, '\t'));
    return response.data;
}

async function createProfileForAsset(config, regApps){
    const response = await axios.post(`${SERVER_BASE_URI}/api/profiles/asset`, {
      "config": config,
      "regulationApps": regApps
    }).catch(function (error) {
      if (error.response) {
          console.log(error.response.data);
          console.log(error.response.status);
          console.log(error.response.headers);
        } else if (error.request) {
          console.log(error.request);
        } else {
          console.log('Error', error.message);
        }
    });  
    console.log(`createProfileForAsset status Success`);
    console.log("profile = "+JSON.stringify(response.data, null, '\t'));
    return response.data;
}

async function updateProfileForAsset(id, config){
    const response = await axios.put(`${SERVER_BASE_URI}/api/profiles/${id}/asset`, {
      "config": config
    }).catch(function (error) {
      if (error.response) {
          console.log(error.response.data);
          console.log(error.response.status);
          console.log(error.response.headers);
        } else if (error.request) {
          console.log(error.request);
        } else {
          console.log('Error', error.message);
        }
    });  
    console.log(`updateProfileForAsset status Success`);
    console.log("profile = "+JSON.stringify(response.data, null, '\t'));
    return response.data;
}

async function readProfile(id){
    const response = await axios.get(`${SERVER_BASE_URI}/api/profiles/${id}`).catch(function (error) {
        if (error.response) {
            console.log(error.response.data);
            console.log(error.response.status);
            console.log(error.response.headers);
          } else if (error.request) {
            console.log(error.request);
          } else {
            console.log('Error', error.message);
          }
      });  
      console.log(`readProfile status ${response.status}`);
      return response.data;
}

async function uploadDocument(claimId, file){
    const formData = {
        file: fs.createReadStream(file),
    };
    const response = await requestp.post({url:`${SERVER_BASE_URI}/api/docs/${claimId}`, formData: formData})
    .catch(function (response) {
        //handle error
        console.log(response.statusCode);
        console.log(response.message);
        return response;
    });
    console.log(response);
    return JSON.parse(response);
}

async function updateDocument(docId, claimId, file){
    const formData = {
        file: fs.createReadStream(file),
    };
    const response = await requestp.put({url:`${SERVER_BASE_URI}/api/docs/${claimId}/${docId}`, formData: formData})
    .catch(function (response) {
        //handle error
        console.log(response.statusCode);
        console.log(response.message);
        return response;
    });
    console.log(response);
    return JSON.parse(response);
}


async function listDocuments(claimId){
    const response = await axios.get(`${SERVER_BASE_URI}/api/docs/${claimId}`);
    console.log(`listDocuments status ${response.status}`);
    console.log("documentList = "+JSON.stringify(response.data, null, '\t'));  
    return response.data;
}

async function downloadDocument(claimId, fileId, name){
    const response = await axios.get(`${SERVER_BASE_URI}/api/docs/${claimId}/${fileId}`, {
        responseType: 'arraybuffer'
    });
    fs.writeFileSync(`/tmp/${name}`, response.data);
}

async function createClaim(type, issuerId, issuanceDate, expirationDate, subjectId, data){
    const claim = {
        type: type,
        issuerId: issuerId,
        issuanceDate: issuanceDate,
        expirationDate: expirationDate,
        subjectId: subjectId,
        data: data        
    };
    const response = await axios.post(`${SERVER_BASE_URI}/api/claims`, claim).catch(function (error) {
        if (error.response) {
            console.log(error.response.data);
            console.log(error.response.status);
            console.log(error.response.headers);
          } else if (error.request) {
            console.log(error.request);
          } else {
            console.log('Error', error.message);
          }
      });  
      console.log(`createClaim status Success`);
      console.log("Claim = "+JSON.stringify(response.data, null, '\t'));
    return response.data;
}

async function updateClaim(id, issuanceDate, expirationDate, data){
    const claim = {
        issuanceDate: issuanceDate,
        expirationDate: expirationDate,
        data: data        
    };
    const response = await axios.put(`${SERVER_BASE_URI}/api/claims/${id}`, claim).catch(function (error) {
        if (error.response) {
            console.log(error.response.data);
            console.log(error.response.status);
            console.log(error.response.headers);
          } else if (error.request) {
            console.log(error.request);
          } else {
            console.log('Error', error.message);
          }
      });  
      console.log(`updateClaim status Success`);
    console.log("Claim = "+JSON.stringify(response.data, null, '\t'));
    return response.data;
}

async function readClaim(id){
    const response = await axios.get(`${SERVER_BASE_URI}/api/claims/${id}`).catch(function (error) {
        if (error.response) {
            console.log(error.response.data);
            console.log(error.response.status);
            console.log(error.response.headers);
          } else if (error.request) {
            console.log(error.request);
          } else {
            console.log('Error', error.message);
          }
      });  
      console.log(`readClaim status Success`);
      return response.data;
}


async function issueToken(assetId, recipientPublicKey, quantity){
    const response = await axios.post(`${SERVER_BASE_URI}/api/tokens/${assetId}`, {
        "recipientPublicKey": recipientPublicKey.toString('hex'),
        "quantity": quantity
      }).catch(function (error) {
        if (error.response) {
            console.log(error.response.data);
            console.log(error.response.status);
            console.log(error.response.headers);
          } else if (error.request) {
            console.log(error.request);
          } else {
            console.log('Error', error.message);
          }
      });  
      console.log(`issueToken status Success`);
    return response.data;
}

async function balanceToken(assetId, recipientPublicKey){
    const response = await axios.get(`${SERVER_BASE_URI}/api/tokens/${recipientPublicKey.toString('hex')}/${assetId}`).catch(function (error) {
        if (error.response) {
            console.log(error.response.data);
            console.log(error.response.status);
            console.log(error.response.headers);
          } else if (error.request) {
            console.log(error.request);
          } else {
            console.log('Error', error.message);
          }
      });  
    console.log(`TokenBalance is ${response.data.balance}`);
    return response.data;
}

async function listTokens(recipientPublicKey){
    const response = await axios.get(`${SERVER_BASE_URI}/api/tokens/${recipientPublicKey.toString('hex')}`).catch(function (error) {
        if (error.response) {
            console.log(error.response.data);
            console.log(error.response.status);
            console.log(error.response.headers);
          } else if (error.request) {
            console.log(error.request);
          } else {
            console.log('Error', error.message);
          }
      });  
      console.log(`listTokens status Success`);
    console.log("data="+JSON.stringify(response.data, null, '\t'));
    return response.data;
}

async function transferTokens(assetId, sourcePrivateKey, sourcePublicKey, recipientPublicKey, quantity){
    const nonce = crypto.randomBytes(24);
    const signature = signMessage(sourcePrivateKey, [nonce, "transfer", recipientPublicKey, assetId, '0x'+quantity.toString(16)]);
    const response = await axios.put(`${SERVER_BASE_URI}/api/tokens/${assetId}/transfer`, {
        "sourcePublicKey": sourcePublicKey.toString('hex'),
        "recipientPublicKey": recipientPublicKey.toString('hex'),
        "quantity": quantity,
        "nonce": nonce.toString('hex'), 
        "signature":signature,
      }).catch(function (error) {
        if (error.response) {
            console.log(`transferTokens status ${error.response.status}`);
            if(error.response.data && error.response.data.error)
                console.log(error.response.data.error);
          } else if (error.request) {
            console.log(error.request);
          } else {
            console.log('Error', error.message);
          }
    });  
    console.log(`transferTokens ${response.data.status}`);
    return response.data;
}

function signMessage(privKey, values, recovery){
    var sh3 = crypto.createHash("sha3-256");
    
    values.forEach((v)=>{
        sh3.update(v);
    });

    const msg = sh3.digest();
    
    // sign the message
    const sigObj = secp256k1.sign(msg, privKey);
    if(recovery){
        const sigObjR = Buffer.concat([sigObj.signature, Buffer.from(new Uint8Array([sigObj.recovery]))]);
        return sigObjR.toString('hex');
    }else{
        return sigObj.signature.toString('hex');
    }
}



module.exports = {
    createCrypto: createCrypto,
    createOwnerProfile: createOwnerProfile,
    createProfileForProvider: createProfileForProvider,
    createProfileForAsset: createProfileForAsset,
    updateProfileForAsset: updateProfileForAsset,
    readProfile: readProfile,
    uploadDocument: uploadDocument,
    updateDocument: updateDocument,
    listDocuments: listDocuments,
    downloadDocument: downloadDocument,
    createClaim: createClaim,
    updateClaim: updateClaim,
    readClaim: readClaim,
    issueToken: issueToken,
    balanceToken: balanceToken,
    listTokens: listTokens,
    transferTokens: transferTokens
}
