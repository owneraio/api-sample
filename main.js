const api = require('./src/api');
const path = require('path');

const wait = (t) => new Promise((res) => setTimeout(res, t));

(async function () {
    const config = JSON.stringify({});
    // Creating Owner profile 1
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



    // Creating Asset Issuer profile
    const cryptoIssuer = api.createCrypto();
    const issuer = await api.createOwnerProfile(cryptoIssuer.private, cryptoIssuer.public);
    console.log('-------------');
    console.log('issuer ', issuer);
    console.log('-------------');


    const year_plus_1_date = new Date();
    year_plus_1_date.setFullYear(year_plus_1_date.getFullYear() + 1);
    const year_plus_1 = Math.floor(year_plus_1_date.getTime() / 1000);

    // Certificates data sample
    // Minimalist
    const user1Data = {email:'owner1@example.com',name:'Owner 1', type:'company'};
    const user2Data = {email:'owner2@example.com',name:'Owner 2', type:'company'};
    const user3Data = {email:'owner3@example.com',name:'Owner 3', type:'company'};
    // More detailed example - the `role` can be any string value (note that value `test` is filtered out)
    // const user1Data = {email:'owner1@example.com',name:'Owner 1',created: Date.now(), updated: Date.now(), type:'company', role:'demo'};
    // const user2Data = {email:'owner2@example.com',name:'Owner 2',created: Date.now(), updated: Date.now(), type:'company', role:'demo'};
    // const user3Data = {email:'owner3@example.com',name:'Owner 3',created: Date.now(), updated: Date.now(), type:'company', role:'demo'};
    const kycData = {name:'AML/KYC Compliance', country:'usa', info:[{type:'text',name: 'Certificate ID',value:'0WUA4BGZIM5'},{type:'text',name:'Country',value:'usa'}]}
    const accreditationData = {name:'Certificate of Accreditation',country:'usa',info:[{type:'text',name:'Certificate ID',value:'O6GDGOILC9'},{type:'text',name:'Country',value:'usa'}]};

    // Write Claims for Owner 1
    await api.createClaim({
        type: "KYC/AML",
        issuanceDate: Math.floor(Date.now() / 1000),
        expirationDate: year_plus_1,
        subjectId: owner1.id,
        data:JSON.stringify(kycData),
    });

    await api.createClaim({
        type: "ownerInfo",
        issuanceDate: Math.floor(Date.now() / 1000),
        expirationDate: year_plus_1,
        subjectId: owner1.id,
        data:JSON.stringify(user1Data),
    });

    // Write Claims for Owner 2
    await api.createClaim({
        type: "KYC/AML",
        issuanceDate: Math.floor(Date.now() / 1000),
        expirationDate: year_plus_1,
        subjectId: owner2.id,
        data: JSON.stringify(kycData),
    });

    await api.createClaim({
        type: "Accreditation",
        issuanceDate: Math.floor(Date.now() / 1000),
        expirationDate: year_plus_1,
        subjectId: owner2.id,
        data: JSON.stringify(accreditationData),
    });

    await api.createClaim({
        type: "ownerInfo",
        issuanceDate: Math.floor(Date.now() / 1000),
        expirationDate: year_plus_1,
        subjectId: owner2.id,
        data:JSON.stringify(user2Data),
    });

    // Write Claims for Owner 3
    await api.createClaim({
        type: "KYC/AML",
        issuanceDate: Math.floor(Date.now() / 1000),
        expirationDate: year_plus_1,
        subjectId: owner3.id,
        data: JSON.stringify(kycData),
    });

    await api.createClaim({
        type: "Accreditation",
        issuanceDate: Math.floor(Date.now() / 1000),
        expirationDate: year_plus_1,
        subjectId: owner3.id,
        data:JSON.stringify( accreditationData),
    });

    await api.createClaim({
        type: "ownerInfo",
        issuanceDate: Math.floor(Date.now() / 1000),
        expirationDate: year_plus_1,
        subjectId: owner3.id,
        data:JSON.stringify(user3Data),
    });

    // Create a profile for an Asset representing Shares in Company Y
    const assetProfile = await api.createProfileForAsset({
        config,
        regulationApps: [
            // { id: 'store-id:bank-us:100:7928d6a5-0a85-4425-a531-b0eb452e6aa6RegX' },
            // { id: 'store-id:bank-us:100:7928d6a5-0a85-4425-a531-b0eb452e6aa6RegD' },
        ],
        name: 'Company Y',
        type: 'Company',
        issuerId: issuer.id,
    });
    console.log('-------------');
    console.log('assetProfile ', assetProfile);
    console.log('-------------');

    // Add a sale to asset
    const sale = await api.addSaleToAsset({
        assetId: assetProfile.id,
        start: 1600000000,
        end: year_plus_1,
        price: 10,
        quantity: 1000000,
    });
    console.log('-------------');
    console.log('asset sale ', sale);
    console.log('-------------');

    // Write KYA (Know Your Asset) for asset
    const assetCertificate = await api.createClaim({
        type: "KYA",
        issuanceDate: Math.floor(Date.now() / 1000),
        expirationDate: year_plus_1,
        subjectId: assetProfile.id,
        data: JSON.stringify({ info: [
            // Data contains a field 'info' is an array of objects with this structure:
            // {
            //   type: 'link' | 'text' | 'component';
            //   name: string;
            //   value: string | React.ReactNode;
            // }
            // Note that for value 'ReactNode' you need to pass type 'component'
            { type: 'text', name: 'Issuer', value: 'Issuer name' },
            { type: 'text', name: 'Headquarters', value: 'New York' },
            { type: 'text', name: 'Industry', value: 'Finance' },
            { type: 'link', name: 'Website', value: 'company-Y-asset.com' },
        ]}),
    });

    // Add document to asset KYA certificate
    const uploadDocResponse = await api.uploadDocument({
        profileId: assetProfile.id,
        certificateId: assetCertificate.id,
        file: path.resolve(__dirname, 'test.txt'),
    });
    console.log('-------------');
    console.log('assetCertificate ', assetCertificate);
    console.log('-------------');

    // Primary Issuance for Owner 1 - issue token fail (if `RegD` reg-app is associated with asset as user is not accredited)
    await api.issueToken({ assetId: assetProfile.id, recipientPublicKey: crypto1.public, quantity: 150, buyerId: owner1.id}).catch(console.log);

    // Primary Issuance for Owner 2 - issue token success
    await api.issueToken({ assetId: assetProfile.id, recipientPublicKey: crypto2.public, quantity: 150, buyerId: owner2.id}).catch(console.log);


    // Download document
    const doc = JSON.parse(uploadDocResponse);
    await api.getDocument({ docUri: doc.refs[0].uri, filename: 'dl_test.txt' });

    // Owner 1 Balance
    let b1 = await api.balanceToken(assetProfile.id, crypto1.public);
    // Owner 2 Balance
    let b2 = await api.balanceToken(assetProfile.id, crypto2.public);
    // Owner 3 Balance
    let b3 = await api.balanceToken(assetProfile.id, crypto3.public);

    console.log('------ balances -------');
    console.log('owner1', b1);
    console.log('owner2', b2);
    console.log('owner3', b3);
    console.log('-----------------------');

    // Transfer tokens from Owner 3 to Owner 1 - should fail
    try {
        await api.transferTokens({
            asset: assetProfile.id,
            sourcePrivateKey: crypto3.private,
            sourcePublicKey: crypto3.public,
            seller: owner3.id,
            recipientPublicKey: crypto1.public,
            buyer: owner1.id,
            quantity: 50,
        });
    } catch (e) {
        console.error('fails due to the fact owner3 balance is 0 ', e);
    }

    await wait(1000);

    // Owner 1 Balance
    b1 = await api.balanceToken(assetProfile.id, crypto1.public);
    // Owner 2 Balance
    b2 = await api.balanceToken(assetProfile.id, crypto2.public);
    // Owner 3 Balance
    b3 = await api.balanceToken(assetProfile.id, crypto3.public);

    console.log('------ balances -------');
    console.log('owner1', b1);
    console.log('owner2', b2);
    console.log('owner3', b3);
    console.log('-----------------------');

    // Transfer tokens from Owner 1 to Owner 2
    await api.transferTokens({
        asset: assetProfile.id,
        sourcePrivateKey: crypto1.private,
        sourcePublicKey: crypto1.public,
        seller: owner1.id,
        recipientPublicKey: crypto2.public,
        buyer: owner2.id,
        quantity: 50,
    }).catch(e => {});

    await wait(1000);

    // Owner 1 Balance
     b1 =  await api.balanceToken(assetProfile.id, crypto1.public);
    // Owner 2 Balance
     b2 =  await api.balanceToken(assetProfile.id, crypto2.public);
    // Owner 3 Balance
     b3 =  await api.balanceToken(assetProfile.id, crypto3.public);

    console.log('------ balances -------');
    console.log('owner1', b1);
    console.log('owner2', b2);
    console.log('owner3', b3);
    console.log('-----------------------');

    console.log('Done.');
    process.exit();

})();
