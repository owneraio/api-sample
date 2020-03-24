require('dotenv').config();

const {SERVER_BASE_URI} = require('./helpers/configuration');
const secp256k1 = require('secp256k1');
const {restRequest} = require('./helpers/restRequest');
const {docRequest} = require('./helpers/docRequest');
const crypto = require('crypto');
const fs = require('fs');
const {orderValuesForHash} = require('./helpers/utils');


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
            'publicKey': publicKey.toString('hex'),
            signature
        }
    });
}

async function createProfileForProvider({name, crypto}) {
    const signature = signMessage(crypto.private, ['createProviderProfile', ...orderValuesForHash({
        name,
        publickKey: crypto.public
    })]);
    return restRequest({
        type: 'post',
        url: `${SERVER_BASE_URI}/api/profiles/provider`,
        data: {
            name,
            publicKey: crypto.public.toString('hex'),
            signature,
        }
    });
}

async function createProfileForAsset({ issuerId,regulationApps, name, type, config}) {
    return restRequest({
        type: 'post',
        url: `${SERVER_BASE_URI}/api/profiles/asset`,
        data: {
            name,
            type,
            regulationApps,
            config,
            issuerId
        }
    });
}

async function updateProfileForAsset({id, config, regulationApps, name, type, issuerId}) {
    return restRequest({
        type: 'put',
        url: `${SERVER_BASE_URI}/api/profiles/${id}/asset`,
        data: {
            name,
            type,
            config,
            regulationApps,
            issuerId
        }
    });
}

async function readProfile(id) {
    return restRequest({
        type: 'get',
        url: `${SERVER_BASE_URI}/api/profiles/${id}`,
    });
}


async function uploadDocument({claimId, filePath, crypto}) {
    const signature = signMessage(crypto.private, ['CreateDocument', ...orderValuesForHash({
        claimId,
        file: fs.readFileSync(filePath)
    })]);

    return docRequest({
        type: 'post',
        url: `${SERVER_BASE_URI}/api/docs/${claimId}`,
        formData: {
            file: fs.createReadStream(filePath),
            signature
        }
    });
}

async function updateDocument({docId, claimId, filePath, crypto}) {
    const signature = signMessage(crypto.private, ['UpdateDocument', ...orderValuesForHash({
        claimId,
        file: fs.readFileSync(filePath),
        id: docId
    })]);

    return docRequest({
        type: 'put',
        url: `${SERVER_BASE_URI}/api/docs/${claimId}/${docId}`,

        formData: {
            file: fs.createReadStream(filePath),
            signature
        }
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

    console.log('doc', data)
    fs.writeFileSync(`/tmp/${name}`, data);
}

async function createClaim({type, issuerId, issuanceDate, expirationDate, subjectId, data, crypto}) {
    const signature = signMessage(crypto.private, [
        'CreateClaim',
        ...orderValuesForHash({
            data,
            expirationDate,
            issuanceDate,
            issuerId,
            subjectId,
            type,
        })
    ]);

    return restRequest({
        type: 'post',
        url: `${SERVER_BASE_URI}/api/claims`,
        data: {type, issuerId, issuanceDate, expirationDate, subjectId, data, signature}
    });
}

async function updateClaim({claimId, issuanceDate, expirationDate, data, crypto}) {
    const signature = signMessage(crypto.private, [
        'UpdateClaim',
        ...orderValuesForHash({
            data,
            expirationDate,
            claimId,
            issuanceDate
        })
    ]);

    return restRequest({
        type: 'put',
        url: `${SERVER_BASE_URI}/api/claims/${claimId}`,
        data: {issuanceDate, expirationDate, data, signature}
    });
}

async function readClaim(id) {
    return restRequest({
        type: 'get',
        url: `${SERVER_BASE_URI}/api/claims/${id}`,
    });
}

async function readClaims(id) {
    return restRequest({
        type: 'get',
        url: `${SERVER_BASE_URI}/api/claims/profile/${id}`,
    });
}


async function issueToken(assetId, recipientPublicKey, quantity) {
    return restRequest({
        type: 'post',
        url: `${SERVER_BASE_URI}/api/tokens/${assetId}`,
        data: {
            'recipientPublicKey': recipientPublicKey.toString('hex'),
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
    const signature = signMessage(sourcePrivateKey, [nonce, 'transfer', recipientPublicKey, assetId, '0x' + quantity.toString(16)]);

    return restRequest({
        type: 'put',
        url: `${SERVER_BASE_URI}/api/tokens/${assetId}/transfer`,
        data: {
            'sourcePublicKey': sourcePublicKey.toString('hex'),
            'recipientPublicKey': recipientPublicKey.toString('hex'),
            'quantity': quantity,
            'nonce': nonce.toString('hex'),
            signature,
        }
    });
}

function signMessage(privKey, values) {
    const sh3 = crypto.createHash('sha3-256');

    values.forEach((v) => {
        // console.log('value to hash', v);
        sh3.update(v);
    });

    const msg = sh3.digest();

    // sign the message
    const sigObj = secp256k1.sign(msg, privKey);
    return sigObj.signature.toString('hex');
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
    readClaims,
    issueToken,
    balanceToken,
    listTokens,
    transferTokens
}
