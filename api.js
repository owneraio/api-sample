

const secp256k1 = require('secp256k1');
const axios = require('axios');
const crypto = require('crypto');
const fs = require('fs');
var requestp = require('request-promise-native');

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
        
     const response = await axios.post('http://localhost:3000/api/profiles/owner', {
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
    console.log("STATUS="+response.status);
    console.log("data="+JSON.stringify(response.data));
    return response.data;
}

async function createProfileForProvider(name){
    const response = await axios.post('http://localhost:3000/api/profiles/provider', {
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
    console.log("STATUS="+response.status);
    console.log("data="+JSON.stringify(response.data));
    return response.data;
}

async function createProfileForAsset(config){
    const response = await axios.post('http://localhost:3000/api/profiles/asset', {
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
    console.log("STATUS="+response.status);
    console.log("data="+JSON.stringify(response.data));
    return response.data;
}

async function updateProfileForAsset(id, config){
    const response = await axios.put(`http://localhost:3000/api/profiles/${id}/asset`, {
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
    console.log("STATUS="+response.status);
    console.log("data="+JSON.stringify(response.data));
    return response.data;
}

async function readProfile(id){
    const response = await axios.get(`http://localhost:3000/api/profiles/${id}`).catch(function (error) {
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
    console.log("STATUS="+response.status);
    return response.data;
}

async function putDocument(claimId, file){
    const formData = {
        file: fs.createReadStream(file),
    };
    const response = await requestp.put({url:'http://localhost:3000/api/docs/'+claimId, formData: formData})
    .catch(function (response) {
        //handle error
        console.log(response.statusCode);
        console.log(response.message);
        return response;
    });
    console.log(response);
}

async function listDocuments(claimId){
    const response = await axios.get('http://localhost:3000/api/docs/'+claimId);
    console.log("STATUS="+response.status); 
    console.log("data="+JSON.stringify(response.data));  
    return response.data;
}

async function downloadDocument(claimId, fileId, name){
    const response = await axios.get(`http://localhost:3000/api/docs/${claimId}/${fileId}`, {
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
    const response = await axios.post('http://localhost:3000/api/claims', claim).catch(function (error) {
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
    console.log("STATUS="+response.status);
    console.log("data="+JSON.stringify(response.data));
    return response.data;
}

async function readClaim(id){
    const response = await axios.get('http://localhost:3000/api/claims/'+id).catch(function (error) {
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
    console.log("STATUS="+response.status);
}


async function issueToken(assetId, recipientPublicKey, quantity){
    const response = await axios.post(`http://localhost:3000/api/tokens/${assetId}`, {
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
    console.log("STATUS="+response.status);
    console.log("data="+JSON.stringify(response.data));
    return response.data;
}

async function balanceToken(assetId, recipientPublicKey){
    const response = await axios.get(`http://localhost:3000/api/tokens/${recipientPublicKey.toString('hex')}/${assetId}`).catch(function (error) {
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
    console.log("STATUS="+response.status);
    console.log("data="+JSON.stringify(response.data));
    return response.data;
}

async function listTokens(recipientPublicKey){
    const response = await axios.get(`http://localhost:3000/api/tokens/${recipientPublicKey.toString('hex')}`).catch(function (error) {
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
    console.log("STATUS="+response.status);
    console.log("data="+JSON.stringify(response.data));
    return response.data;
}

async function transferTokens(assetId, sourcePrivateKey, sourcePublicKey, recipientPublicKey, quantity){
    const nonce = crypto.randomBytes(24);
    const signature = signMessage(sourcePrivateKey, [nonce, "transfer", recipientPublicKey, assetId, '0x'+quantity.toString(16)]);
    console.log(signature.length);
    const response = await axios.put(`http://localhost:3000/api/tokens/${assetId}/transfer`, {
        "sourcePublicKey": sourcePublicKey.toString('hex'),
        "recipientPublicKey": recipientPublicKey.toString('hex'),
        "quantity": quantity,
        "nonce": nonce.toString('hex'), 
        "signature":signature,
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
    console.log("STATUS="+response.status);
    console.log("data="+JSON.stringify(response.data));
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
    putDocument: putDocument,
    listDocuments: listDocuments,
    downloadDocument: downloadDocument,
    createClaim: createClaim,
    readClaim: readClaim,
    issueToken: issueToken,
    balanceToken: balanceToken,
    listTokens: listTokens,
    transferTokens: transferTokens
}
