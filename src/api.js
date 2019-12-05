const {SERVER_BASE_URI} = require('./helpers/configuration');
const secp256k1 = require('secp256k1');
const {restRequest} = require('./helpers/restRequest');
const {docRequest} = require('./helpers/docRequest');
const crypto = require('crypto');
const fs = require('fs');

function createCrypto() {
    // generate privKey
    let privKey;
    do {
        privKey = crypto.randomBytes(32);
    } while (!secp256k1.privateKeyVerify(privKey))

    // get the public key in a compressed format
    const pubKey = secp256k1.publicKeyCreate(privKey, true);
    return {private: privKey, public: pubKey};
}

async function createOwnerProfile(privateKey, publicKey) {
    const signature = signMessage(privateKey, ['createOwnerProfile', publicKey]);

    return restRequest({
        type: 'post',
        url: `${SERVER_BASE_URI}/api/profiles/owner`,
        data: {
            "publicKey": publicKey.toString('hex'),
            signature
        }
    });
}

async function createProfileForProvider(name) {
    return restRequest({
        type: 'post',
        url: `${SERVER_BASE_URI}/api/profiles/provider`,
        data: {
            name
        }
    });
}

async function createProfileForAsset(config, regApps) {
    return restRequest({
        type: 'post',
        url: `${SERVER_BASE_URI}/api/profiles/asset`,
        data: {
            config,
            "regulationApps": regApps
        }
    });
}

async function updateProfileForAsset(id, config) {
    return restRequest({
        type: 'put',
        url: `${SERVER_BASE_URI}/api/profiles/${id}/asset`,
        data: {
            config
        }
    });
}

async function readProfile(id) {
    return restRequest({
        type: 'get',
        url: `${SERVER_BASE_URI}/api/profiles/${id}`,
    });
}

async function uploadDocument(claimId, file) {
    const formData = {
        file: fs.createReadStream(file),
    };

    return docRequest({
        type: 'post',
        url: `${SERVER_BASE_URI}/api/docs/${claimId}`,
        formData
    });
}

async function updateDocument(docId, claimId, file) {
    const formData = {
        file: fs.createReadStream(file),
    };
    return docRequest({
        type: 'put',
        url: `${SERVER_BASE_URI}/api/docs/${claimId}/${docId}`,
        formData
    });
}


async function listDocuments(claimId) {
    return restRequest({
        type: 'get',
        url: `${SERVER_BASE_URI}/api/docs/${claimId}`,
    });
}

async function downloadDocument(claimId, fileId, name) {
    const data = await restRequest({
        type: 'get',
        url: `${SERVER_BASE_URI}/api/docs/${claimId}/${fileId}`,
    });

    fs.writeFileSync(`/tmp/${name}`, data);
}

async function createClaim(type, issuerId, issuanceDate, expirationDate, subjectId, data) {
    const claim = {
        type,
        issuerId,
        issuanceDate,
        expirationDate,
        subjectId,
        data
    };

    return restRequest({
        type: 'post',
        url: `${SERVER_BASE_URI}/api/claims`,
        data: claim
    });
}

async function updateClaim(id, issuanceDate, expirationDate, data) {
    const claim = {
        issuanceDate: issuanceDate,
        expirationDate: expirationDate,
        data: data
    };

    return restRequest({
        type: 'put',
        url: `${SERVER_BASE_URI}/api/claims/${id}`,
        data: claim
    });
}

async function readClaim(id) {
    restRequest({
        type: 'get',
        url: `${SERVER_BASE_URI}/api/claims/${id}`,
    });
}


async function issueToken(assetId, recipientPublicKey, quantity) {
    return restRequest({
        type: 'post',
        url: `${SERVER_BASE_URI}/api/tokens/${assetId}`,
        data: {
            "recipientPublicKey": recipientPublicKey.toString('hex'),
            quantity
        }
    });
}

async function balanceToken(assetId, recipientPublicKey) {
    return restRequest({
        type: 'get',
        url: `${SERVER_BASE_URI}/api/tokens/${recipientPublicKey.toString('hex')}/${assetId}`,
    });
}

async function listTokens(recipientPublicKey) {
    return restRequest({
        type: 'get',
        url: `${SERVER_BASE_URI}/api/tokens/${recipientPublicKey.toString('hex')}`,
    });
}

async function transferTokens(assetId, sourcePrivateKey, sourcePublicKey, recipientPublicKey, quantity) {
    const nonce = crypto.randomBytes(24);
    const signature = signMessage(sourcePrivateKey, [nonce, "transfer", recipientPublicKey, assetId, '0x' + quantity.toString(16)]);

    return restRequest({
        type: 'put',
        url: `${SERVER_BASE_URI}/api/tokens/${assetId}/transfer`,
        data: {
            "sourcePublicKey": sourcePublicKey.toString('hex'),
            "recipientPublicKey": recipientPublicKey.toString('hex'),
            "quantity": quantity,
            "nonce": nonce.toString('hex'),
            signature,
        }
    });
}

function signMessage(privKey, values, recovery) {
    var sh3 = crypto.createHash("sha3-256");

    values.forEach((v) => {
        sh3.update(v);
    });

    const msg = sh3.digest();

    // sign the message
    const sigObj = secp256k1.sign(msg, privKey);
    if (recovery) {
        const sigObjR = Buffer.concat([sigObj.signature, Buffer.from(new Uint8Array([sigObj.recovery]))]);
        return sigObjR.toString('hex');
    } else {
        return sigObj.signature.toString('hex');
    }
}


module.exports = {
    createCrypto,
    createOwnerProfile,
    createProfileForProvider,
    createProfileForAsset,
    updateProfileForAsset,
    readProfile,
    uploadDocument,
    updateDocument,
    listDocuments,
    downloadDocument,
    createClaim,
    updateClaim,
    readClaim,
    issueToken,
    balanceToken,
    listTokens,
    transferTokens
}
