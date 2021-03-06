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
        url: `${SERVER_BASE_URI}/finapi/profiles/owner`,
        data: {
            'publicKey': publicKey.toString('hex'),
            signature
        }
    });
}

async function createProfileForAsset({ issuerId, regulationApps, name, type, config }) {
    return restRequest({
        type: 'post',
        url: `${SERVER_BASE_URI}/finapi/profiles/asset`,
        data: {
            name,
            type,
            regulationApps,
            config,
            issuerId
        }
    });
}

async function addSaleToAsset ({ assetId, start, end, price, quantity }) {
    return restRequest({
        type: 'post',
        url: `${SERVER_BASE_URI}/finapi/profiles/asset/${assetId}/sale`,
        data: { start, end, price, quantity },
    });
};

async function updateProfileForAsset({ id, config, regulationApps, name }) {
    return restRequest({
        type: 'put',
        url: `${SERVER_BASE_URI}/finapi/profiles/asset/${id}`,
        data: {
            name,
            config,
            regulationApps,
        }
    });
}

async function createClaim({ type, issuanceDate, expirationDate, subjectId, data }) {
    return restRequest({
        type: 'post',
        url: `${SERVER_BASE_URI}/finapi/profiles/${subjectId}/certificates`,
        data: { type, issuanceDate, expirationDate, data },
    });
}

async function updateClaim({claimId, issuanceDate, expirationDate, data, profileId}) {
    return restRequest({
        type: 'put',
        url: `${SERVER_BASE_URI}/finapi/profiles/${profileId}/certificates/${claimId}`,
        data: {issuanceDate, expirationDate, data},
    });
}

async function uploadDocument({ profileId, certificateId, file }) {
    const formData = {
        file: fs.createReadStream(file),
    };
    return docRequest({
        type: 'post',
        url: `${SERVER_BASE_URI}/finapi/profiles/${profileId}/certificates/${certificateId}/docs`,
        formData,
    });
}
async function updateDocument({ profileId, certificateId, docId, file }) {
    const formData = {
        file: fs.createReadStream(file),
    };
    return docRequest({
        type: 'put',
        url: `${SERVER_BASE_URI}/finapi/profiles/${profileId}/certificates/${certificateId}/docs/${docId}`,
        formData,
    });
}

async function getDocument({ docUri, filename }) {
    const data = await restRequest({
        type: 'get',
        url: `${SERVER_BASE_URI}/finapi/docs/${docUri}`,
    });
    try {
        fs.writeFileSync(`/tmp/${filename}`, data);
        console.log(`file downloaded: /tmp/${filename}`);
    } catch (err) {
        console.error(`Unable to get file with URI: ${docUri}`)
    }
}

async function issueToken({ assetId, recipientPublicKey, quantity, buyerId }) {
    const nonce = crypto.randomBytes(24);
    return restRequest({
        type: 'post',
        url: `${SERVER_BASE_URI}/finapi/tokens/issue`,
        data: {
            nonce: nonce.toString('hex'),
            asset: assetId,
            buyer: buyerId,
            recipientPublicKey: recipientPublicKey.toString('hex'),
            quantity: quantity.toString(),
            settlementRef: '',
        }
    });
}

async function balanceToken(assetId, sourcePublicKey) {
    return restRequest({
        type: 'post',
        url: `${SERVER_BASE_URI}/finapi/tokens/balance`,
        data: {
            asset: assetId,
            sourcePublicKey: sourcePublicKey.toString('hex'),
        },
    });
}

async function transferTokens({ asset, sourcePrivateKey, sourcePublicKey, recipientPublicKey, quantity, seller, buyer }) {
    const nonce = crypto.randomBytes(24);
    const signature = signMessage(sourcePrivateKey, [nonce, 'transfer', recipientPublicKey, asset, '0x' + quantity.toString(16)]);

    return restRequest({
        type: 'put',
        url: `${SERVER_BASE_URI}/finapi/tokens/transfer`,
        data: {
            asset,
            seller,
            sourcePublicKey: sourcePublicKey.toString('hex'),
            buyer,
            recipientPublicKey: recipientPublicKey.toString('hex'),
            quantity: quantity.toString(),
            settlementRef: '',
            nonce: nonce.toString('hex'),
            signature,
        }
    });
}

async function redeemTokens({ assetId, sourcePrivateKey, sourcePublicKey, quantity, sellerId }) {
    const nonce = crypto.randomBytes(24);
    const signature = signMessage(sourcePrivateKey, [nonce, 'redeem', assetId, '0x' + quantity.toString(16)]);

    return restRequest({
        type: 'put',
        url: `${SERVER_BASE_URI}/api/tokens/transfer`,
        data: {
            asset: assetId,
            seller: sellerId,
            sourcePublicKey: sourcePublicKey.toString('hex'),
            quantity,
            nonce: nonce.toString('hex'),
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
    createProfileForAsset,
    addSaleToAsset,
    updateProfileForAsset,
    createClaim,
    updateClaim,
    uploadDocument,
    updateDocument,
    getDocument,
    issueToken,
    balanceToken,
    transferTokens,
    redeemTokens,
}
