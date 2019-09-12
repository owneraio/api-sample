

const { randomBytes } = require('crypto');
const secp256k1 = require('secp256k1');
const axios = require('axios');
const crypto = require('crypto');
const fs = require('fs');
var FormData = require('form-data');
var request = require('request');
var requestp = require('request-promise-native');


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


(async function() {
    //const privKey = createCrypto();
    //const profile = await createProfile(privKey);
    //await readProfile(profile.id);
    //await putDocument('claim123', '/Users/ycarmel/go/src/github.com/ownera/core/app/kyab1d1.pdf');
    const documents = await listDocuments('claim123');
    const file = documents[0];
    console.log(file);
    //await downloadDocument('claim123', file.id, file.name)
})();

