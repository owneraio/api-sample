const api = require('./src/api');
const {getClaimConfiguration, delay} = require('./tests/utils');

(async function () {
    // Creating Owner profile 2
    const crypto2 = api.createCrypto();
    const owner2 = await api.createOwnerProfile(crypto2.private, crypto2.public);

    // Creating Owner profile 3
    const crypto3 = api.createCrypto();
    const owner3 = await api.createOwnerProfile(crypto3.private, crypto3.public);

    // Creating a Provider for KYC service && create owner1
    const {issuerProfile, profile: owner1, year_plus_1, crypto: crypto1} = await getClaimConfiguration('Institution X');


    // Write Claims for Owner 2
    await api.createClaim({
        type: "KYC-Location",
        issuerId: issuerProfile.id,
        issuanceDate: new Date().toISOString(),
        expirationDate: year_plus_1,
        subjectId: owner1.id,
        data: {country: 'US'},
        crypto: crypto1
    });

    await api.createClaim({
        type: "Accreditation",
        issuerId: issuerProfile.id,
        issuanceDate: new Date().toISOString(),
        expirationDate: year_plus_1,
        subjectId: owner2.id,
        data: {accredited: false},
        crypto: crypto1
    });

    await api.createClaim({
        type: "KYC-Location",
        issuerId: issuerProfile.id,
        issuanceDate: new Date().toISOString(),
        expirationDate: year_plus_1,
        subjectId: owner3.id,
        data: {country: 'US'},
        crypto: crypto1
    });

    await api.createClaim({
        type: "Accreditation",
        issuerId: issuerProfile.id,
        issuanceDate: new Date().toISOString(),
        expirationDate: year_plus_1,
        subjectId: owner3.id,
        data: {accredited: false},
        crypto: crypto1
    });

    // Create a profile for an Asset representing Shares in Company Y  
    const assetProfile = await api.createProfileForAsset({config: {}, regulationApps: [], name: 'asset', type: 'type'});

    // Primary Issuance for Owner 1
    await api.issueToken(assetProfile.id, crypto1.public, 150);

    console.log('wait 2s before checking the current balance and transfer the tokens');
    await delay(2000);
    console.log('checking the balance and start the transfer');

    // Owner 1 Balance
    await api.balanceToken(assetProfile.id, crypto1.public);
    // Owner 2 Balance
    await api.balanceToken(assetProfile.id, crypto2.public);
    // Owner 3 Balance
    await api.balanceToken(assetProfile.id, crypto3.public);

    // Transfer tokens from Owner 1 to Owner 2 - should fail
    await api.transferTokens(assetProfile.id, crypto1.private, crypto1.public, crypto2.public, 50).catch(e => {
    });

    // Owner 1 Balance
    await api.balanceToken(assetProfile.id, crypto1.public);
    // Owner 2 Balance
    await api.balanceToken(assetProfile.id, crypto2.public);
    // Owner 3 Balance
    await api.balanceToken(assetProfile.id, crypto3.public);

    // Transfer tokens from Owner 1 to Owner 3
    await api.transferTokens(assetProfile.id, crypto1.private, crypto1.public, crypto3.public, 50).catch(e => {
    });

    console.log('wait 4s before checking the new balance');
    await delay(4000);
    console.log('checking the new balance');
    // Owner 1 Balance
    await api.balanceToken(assetProfile.id, crypto1.public);
    // Owner 2 Balance
    await api.balanceToken(assetProfile.id, crypto2.public);
    // Owner 3 Balance
    await api.balanceToken(assetProfile.id, crypto3.public);

    await delay(2000);
    console.log('Done.');
    process.exit();

})();