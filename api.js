

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

async function createProfile(privKey){
    /*var sh3 = crypto.createHash("sha3-256");
    sh3.update('');
    const msg = sh3.digest();
    
    // sign the message
    const sigObj = secp256k1.sign(msg, privKey);
    const sigObjR = Buffer.concat([sigObj.signature, Buffer.from(new Uint8Array([sigObj.recovery]))]);

    console.log(sigObjR);
    console.log(sigObjR.length);
    console.log(sigObjR.toString('hex').length)
     
    const response = await axios.post('http://localhost:3000/api/profiles', {
        "sig": sigObjR.toString('hex')*/
     const payload = {};

     var msg = crypto.createHash("sha256").update(JSON.stringify(payload)).digest();
    
      // sign the message
     const sigObj = secp256k1.sign(msg, privKey);
    
     console.log(sigObj.signature.toString('hex'));
    
     const response = await axios.post('http://localhost:3000/api/profiles/owner', {
        "payload": payload,
        "signature": sigObj.signature.toString('hex')    
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



async function readProfile(id){
    const response = await axios.get('http://localhost:3000/api/profiles/'+id).catch(function (error) {
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


async function issueToken(tokenId, recipientPublicKey, quantity){
    const response = await axios.post(`http://localhost:3000/api/tokens/${tokenId}`, {
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

async function balanceToken(tokenId, recipientPublicKey){
    const response = await axios.get(`http://localhost:3000/api/tokens/${recipientPublicKey.toString('hex')}/${tokenId}`).catch(function (error) {
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

async function transferTokens(tokenId, sourcePrivateKey, sourcePublicKey, recipientPublicKey, quantity){
    const nonce = crypto.randomBytes(24);
    const signature = signMessage(sourcePrivateKey, [nonce, "transfer", recipientPublicKey, tokenId, '0x'+quantity.toString(16)]);
    console.log(signature.length);
    const response = await axios.put(`http://localhost:3000/api/tokens/${tokenId}/transfer`, {
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

function signMessage(privKey, values){
    var sh3 = crypto.createHash("sha3-256");
    
    values.forEach((v)=>{
        sh3.update(v);
    });

    const msg = sh3.digest();
    console.log(msg);
    
    // sign the message
    const sigObj = secp256k1.sign(msg, privKey);
    const sigObjR = Buffer.concat([sigObj.signature, Buffer.from(new Uint8Array([sigObj.recovery]))]);
    console.log(sigObj.signature.length);
    return sigObj.signature.toString('hex');
    /*console.log(sigObjR);
    console.log(sigObjR.length);
    console.log(sigObjR.toString('hex').length)
    return sigObjR.toString('hex');*/
}



module.exports = {
    createCrypto: createCrypto,
    createProfile: createProfile,
    createProfileForProvider: createProfileForProvider,
    createProfileForAsset: createProfileForAsset,
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
