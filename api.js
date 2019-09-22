

const { randomBytes } = require('crypto');
const secp256k1 = require('secp256k1');
const axios = require('axios');
const crypto = require('crypto');
const fs = require('fs');
var FormData = require('form-data');
var request = require('request');
var requestp = require('request-promise-native');

/*


		const trans_bytes = Buffer.concat([commandHeader.nonce.toBuffer(), commandHeader.creator.toBuffer()]);
		const trans_hash = HashPrimitives.SHA2_256(trans_bytes);
		const txId = Buffer.from(trans_hash).toString();

*/


function createCrypto(){
// generate privKey
let privKey;
do {
  privKey = randomBytes(32);
} while (!secp256k1.privateKeyVerify(privKey))

// get the public key in a compressed format
const pubKey = secp256k1.publicKeyCreate(privKey);
 return privKey;
}

async function createProfile(privKey){
    const payload = {};

    var msg = crypto.createHash("sha256").update(JSON.stringify(payload)).digest();
    
    // sign the message
    const sigObj = secp256k1.sign(msg, privKey);
    
    console.log(sigObj.signature.toString('hex'));
    
    const response = await axios.post('http://localhost:3000/api/profiles', {
        "payload": payload,
        "sig": sigObj.signature.toString('hex')
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

async function createProfileForMSP(name){
    const response = await axios.post('http://localhost:3000/api/profiles/issuer', {
      "issuerName": name
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
    //console.log("statusCode="+response.statusCode); 
    //console.log("data="+JSON.stringify(response.data));  
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

    //response.data.pipe(fs.createWriteStream("/tmp/my.pdf"));
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


module.exports = {
    createCrypto: createCrypto,
    createProfile: createProfile,
    createProfileForMSP: createProfileForMSP,
    readProfile: readProfile,
    putDocument: putDocument,
    listDocuments: listDocuments,
    downloadDocument: downloadDocument,
    createClaim: createClaim
}
