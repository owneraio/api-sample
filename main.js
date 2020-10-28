const api = require('./src/api');

(async function () {
    const config = JSON.stringify({});
    // create owner1
    const crypto1 = api.createCrypto();
    const owner1 = await api.createOwnerProfile(crypto1.private, crypto1.public);
    console.log('-------------');
    console.log('owner1 ', owner1);
    console.log('-------------');

    // Creating Owner profile 2
    const crypto2 = api.createCrypto();
    const owner2 = await api.createOwnerProfile(crypto2.private, crypto2.public);
    console.log('-------------');
    console.log('owner2 ', owner2);
    console.log('-------------');

    // Creating Owner profile 3
    const crypto3 = api.createCrypto();
    const owner3 = await api.createOwnerProfile(crypto3.private, crypto3.public);
    console.log('-------------');
    console.log('owner3 ', owner3);
    console.log('-------------');

    // Creating a Provider for KYC service
    // const cryptoIssuer = api.createCrypto();
    // const issuerProfile = await api.createProfileForProvider({name: 'Institution X', crypto: cryptoIssuer, config});
    // console.log(`did: ${issuerProfile.id} provider.private = ${cryptoIssuer.private.toString('hex')}`);
    const year_plus_1_date = new Date();
    year_plus_1_date.setFullYear(year_plus_1_date.getFullYear() + 1);
    const year_plus_1 = year_plus_1_date.getTime();


    // Write Claims for Owner 1
    // await api.createClaim({
    //     type: "KYC",
    //     issuerId: issuerProfile.id,
    //     issuanceDate: new Date().getTime(),
    //     expirationDate: year_plus_1,
    //     subjectId: owner1.id,
    //     data:JSON.stringify({"country": "usa"}),
    //     crypto: cryptoIssuer
    // });
    //
    // // Write Claims for Owner 2
    // await api.createClaim({
    //     type: "KYC/AML",
    //     issuerId: issuerProfile.id,
    //     issuanceDate: new Date().getTime(),
    //     expirationDate: year_plus_1,
    //     subjectId: owner2.id,
    //     data: JSON.stringify({"country": "usa"}),
    //     crypto: cryptoIssuer
    // });
    //
    // // Write Claims for Owner 3
    // await api.createClaim({
    //     type: "KYC/AML",
    //     issuerId: issuerProfile.id,
    //     issuanceDate: new Date().getTime(),
    //     expirationDate: year_plus_1,
    //     subjectId: owner3.id,
    //     data: JSON.stringify({"country": "usa"}),
    //     crypto: cryptoIssuer
    // });
    //
    // await api.createClaim({
    //     type: "Accreditation",
    //     issuerId: issuerProfile.id,
    //     issuanceDate: new Date().getTime(),
    //     expirationDate: year_plus_1,
    //     subjectId: owner3.id,
    //     data:JSON.stringify( {"country": "usa"}),
    //     crypto: cryptoIssuer
    // });
    //
    // await api.createClaim({
    //     type: "Accreditation",
    //     issuerId: issuerProfile.id,
    //     issuanceDate: new Date().getTime(),
    //     expirationDate: year_plus_1,
    //     subjectId: owner2.id,
    //     data: JSON.stringify({"country": "usa"}),
    //     crypto: cryptoIssuer
    // });

    // Create a profile for an Asset representing Shares in Company Y
    const assetProfile = await api.createProfileForAsset({
        config,
        regulationApps: [],
        name: 'Company Y',
        type: 'Company',
        issuerId:'issuerId',
    });
    console.log('-------------');
    console.log('assetProfile ', assetProfile);
    console.log('-------------');

    // Add a sale to asset
    await api.addSaleToAsset({
        assetId: assetProfile.id,
        start: 1600000000000,
        end: year_plus_1,
        price: 10,
        quantity: 1000000,
    });

    // Write KYA for asset
    // await api.createClaim({
    //     type: "KYA",
    //     issuerId: issuerProfile.id,
    //     issuanceDate: new Date().getTime(),
    //     expirationDate: year_plus_1,
    //     subjectId: assetProfile.id,
    //     data: JSON.stringify({"country": "usa", "kyc" : ["11111", "22222", "33333"], "aml": ["11111","22222", "33333"]}),
    //     crypto: cryptoIssuer
    // });

    // Primary Issuance for Owner 1 - issue token fail
    await api.issueToken({ assetId: assetProfile.id, recipientPublicKey: crypto1.public, quantity: 150, buyerId: owner1.id}).catch(console.log);

    // Primary Issuance for Owner 2 - issue token success
    await api.issueToken({ assetId: assetProfile.id, recipientPublicKey: crypto2.public, quantity: 150, buyerId: owner2.id}).catch(console.log);

    // Owner 1 Balance
    // await api.balanceToken(assetProfile.id, crypto1.public);
    // Owner 2 Balance
    // await api.balanceToken(assetProfile.id, crypto2.public);
    // Owner 3 Balance
    // await api.balanceToken(assetProfile.id, crypto3.public);

    // Transfer tokens from Owner 1 to Owner 2 - should fail
    try {
        await api.transferTokens({
            asset: assetProfile.id,
            sourcePrivateKey: crypto2.private,
            sourcePublicKey: crypto2.public,
            seller: owner2.id,
            recipientPublicKey: crypto1.public,
            buyer: owner1.id,
            quantity: 50,
        });
    } catch (e) {
        console.log(e);
    }

    // Owner 1 Balance
    const b1 = await api.balanceToken(assetProfile.id, crypto1.public);
    console.log('-------------');
    console.log(b1);
    console.log('-------------');
    // Owner 2 Balance
    // await api.balanceToken(assetProfile.id, crypto2.public);
    // Owner 3 Balance
    // await api.balanceToken(assetProfile.id, crypto3.public);

    // Transfer tokens from Owner 2 to Owner 3
    await api.transferTokens({
        asset: assetProfile.id,
        sourcePrivateKey: crypto2.private,
        sourcePublicKey: crypto2.public,
        seller: owner2.id,
        recipientPublicKey: crypto3.public,
        buyer: owner3.id,
        quantity: 50,
    }).catch(e => {});

    // Owner 1 Balance
    // await api.balanceToken(assetProfile.id, crypto1.public);
    // Owner 2 Balance
    // await api.balanceToken(assetProfile.id, crypto2.public);
    // Owner 3 Balance
    // await api.balanceToken(assetProfile.id, crypto3.public);

    console.log('Done.');
    process.exit();

})();
