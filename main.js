const api = require('./src/api');

(async function () {
    const config = JSON.stringify({});
    // create owner1
    const crypto1 = api.createCrypto();
    const owner1 = await api.createOwnerProfile(crypto1.private, crypto1.public);

    // Creating Owner profile 2
    const crypto2 = api.createCrypto();
    const owner2 = await api.createOwnerProfile(crypto2.private, crypto2.public);

    // Creating Owner profile 3
    const crypto3 = api.createCrypto();
    const owner3 = await api.createOwnerProfile(crypto3.private, crypto3.public);

    // Creating a Provider for KYC service
    const cryptoIssuer = api.createCrypto();
    const issuerProfile = await api.createProfileForProvider({name: 'Institution X', crypto: cryptoIssuer, config});
    console.log(`did: ${issuerProfile.id} provider.private = ${cryptoIssuer.private.toString('hex')}`);
    const year_plus_1_date = new Date();
    year_plus_1_date.setFullYear(year_plus_1_date.getFullYear() + 1);
    const year_plus_1 = year_plus_1_date.getTime();


    // Write Claims for Owner 1
    await api.createClaim({
        type: "KYC",
        issuerId: issuerProfile.id,
        issuanceDate: new Date().getTime(),
        expirationDate: year_plus_1,
        subjectId: owner1.id,
        data:JSON.stringify({"country": "usa"}),
        crypto: cryptoIssuer
    });

    // Write Claims for Owner 2
    await api.createClaim({
        type: "KYC/AML",
        issuerId: issuerProfile.id,
        issuanceDate: new Date().getTime(),
        expirationDate: year_plus_1,
        subjectId: owner2.id,
        data: JSON.stringify({"country": "usa"}),
        crypto: cryptoIssuer
    });

    // Write Claims for Owner 3
    await api.createClaim({
        type: "KYC/AML",
        issuerId: issuerProfile.id,
        issuanceDate: new Date().getTime(),
        expirationDate: year_plus_1,
        subjectId: owner3.id,
        data: JSON.stringify({"country": "usa"}),
        crypto: cryptoIssuer
    });

    await api.createClaim({
        type: "Accreditation",
        issuerId: issuerProfile.id,
        issuanceDate: new Date().getTime(),
        expirationDate: year_plus_1,
        subjectId: owner3.id,
        data:JSON.stringify( {"country": "usa"}),
        crypto: cryptoIssuer
    });

    await api.createClaim({
        type: "Accreditation",
        issuerId: issuerProfile.id,
        issuanceDate: new Date().getTime(),
        expirationDate: year_plus_1,
        subjectId: owner2.id,
        data: JSON.stringify({"country": "usa"}),
        crypto: cryptoIssuer
    });

    // Create a profile for an Asset representing Shares in Company Y
    const assetProfile = await api.createProfileForAsset({config, regulationApps: [{ id: 'store-id:did:ownera-provider:c291be0d-e417-4059-b2de-484a3dad3635regd-no-seller'}], name: 'Company Y', type: 'Company', issuerId:'issuerId'});

    // Write KYA for asset
    await api.createClaim({
        type: "KYA",
        issuerId: issuerProfile.id,
        issuanceDate: new Date().getTime(),
        expirationDate: year_plus_1,
        subjectId: assetProfile.id,
        data: JSON.stringify({"country": "usa", "kyc" : ["11111", "22222", "33333"], "aml": ["11111","22222", "33333"]}),
        crypto: cryptoIssuer
    });

    // Primary Issuance for Owner 1 - issue token fail
    await api.issueToken(assetProfile.id, crypto1.public, 150).catch(console.log);

    // Primary Issuance for Owner 2 - issue token success
    await api.issueToken(assetProfile.id, crypto2.public, 150);

    // Owner 1 Balance
    await api.balanceToken(assetProfile.id, crypto1.public);
    // Owner 2 Balance
    await api.balanceToken(assetProfile.id, crypto2.public);
    // Owner 3 Balance
    await api.balanceToken(assetProfile.id, crypto3.public);

    // Transfer tokens from Owner 1 to Owner 2 - should fail
    await api.transferTokens(assetProfile.id, crypto2.private, crypto2.public, crypto1.public, 50).catch(e => {
    });

    // Owner 1 Balance
    await api.balanceToken(assetProfile.id, crypto1.public);
    // Owner 2 Balance
    await api.balanceToken(assetProfile.id, crypto2.public);
    // Owner 3 Balance
    await api.balanceToken(assetProfile.id, crypto3.public);

    // Transfer tokens from Owner 1 to Owner 3
    await api.transferTokens(assetProfile.id, crypto2.private, crypto2.public, crypto3.public, 50).catch(e => {
    });

    // Owner 1 Balance
    await api.balanceToken(assetProfile.id, crypto1.public);
    // Owner 2 Balance
    await api.balanceToken(assetProfile.id, crypto2.public);
    // Owner 3 Balance
    await api.balanceToken(assetProfile.id, crypto3.public);

    console.log('Done.');
    process.exit();

})();
