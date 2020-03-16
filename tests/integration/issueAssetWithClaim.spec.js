jest.setTimeout(30000);

const api = require('../../src/api');
const {delay, getClaimConfiguration} = require('../utils');

describe('issue token of asset with claim', () => {
    const quantity = 100;
    let ownerCrypto;
    let providerCrypto;
    let assetProfile;

    beforeAll(async () => {
        ownerCrypto = api.createCrypto();
        await api.createOwnerProfile(ownerCrypto.private, ownerCrypto.public);

        const {issuerProfile, profile, year_plus_1, crypto} = await getClaimConfiguration("KYCProvider");
        providerCrypto = crypto;

        const issuanceDate = new Date().getTime();
        await api.createClaim({
            type: "KYC-Location",
            issuerId: issuerProfile.id,
            issuanceDate,
            expirationDate: year_plus_1,
            subjectId: profile.id,
            data: JSON.stringify({country: 'US'}),
            crypto: providerCrypto
        });

        await api.createClaim({
            type: "KYC-Investor",
            issuerId: issuerProfile.id,
            issuanceDate,
            expirationDate: year_plus_1,
            subjectId: profile.id,
            data: JSON.stringify({accredited: true}),
            crypto: providerCrypto
        });

        assetProfile = await api.createProfileForAsset({
            issuerId: "issuerID",
            config: JSON.stringify({}),
            regulationApps: [],
            name: 'testAssetName',
            type: 'testAssetType'
        }).catch(err =>{
            fail(`server response with error: ${err}`)
        });

    });

    test(`
    Scenario: success to transfer tokens, claim approved
    Given     2 owners, asset, RecipientClaimVerification
    | profile  | information                                             |
    | -------- | ------------------------------------------------------- |
    | owner1   |          -                                              |
    | owner2   | claims: [KYC-Investor, KYC-Location]                    |
    | asset    | require: [KYC-Investor, KYC-Location]                   |
    |            regulationApp: RecipientClaimVerification               |
    
    When       transfer token from owner1 to owner2
    Then       claim will be approved
    And        owner1, owner2 balance will be updated
    
    `,
        async () => {
            await api.issueToken(assetProfile.id, ownerCrypto.public, quantity).catch(err=>fail(err));

            const startBalance1 = await api.balanceToken(assetProfile.id, ownerCrypto.public);
            const startBalance2 = await api.balanceToken(assetProfile.id, providerCrypto.public);

            await api.transferTokens(assetProfile.id, ownerCrypto.private, ownerCrypto.public, providerCrypto.public, quantity);

            const endBalance1 = await api.balanceToken(assetProfile.id, ownerCrypto.public);
            const endBalance2 = await api.balanceToken(assetProfile.id, providerCrypto.public);

            expect(endBalance2.balance - startBalance2.balance).toBe(quantity);
            expect(startBalance1.balance - endBalance1.balance).toBe(quantity);
        })


    // test(`
    // Scenario: fail to transfer tokens, claim not approved
    // Given     2 owners, asset, RecipientClaimVerification
    // | profile  | information                                             |
    // | -------- | ------------------------------------------------------- |
    // | owner1   |          -                                              |
    // | owner2   | claims: [KYC-Investor, KYC-Location]                    |
    // | asset    | require: [KYC-Investor, KYC-Location]                   |
    // |            regulationApp: RecipientClaimVerification               |
    //
    // When       transfer token from owner2 to owner1
    // Then       claim will be approved
    // And        owner1, owner2 balance will be updated
    // `,
    //     async () => {
    //         expect.assertions(3);
    //         await api.issueToken(assetProfile.id, providerCrypto.public, quantity);
    //         await delay(5 * 1000);
    //
    //         const startBalance1 = await api.balanceToken(assetProfile.id, ownerCrypto.public);
    //         const startBalance2 = await api.balanceToken(assetProfile.id, providerCrypto.public);
    //
    //         await api.transferTokens(assetProfile.id, providerCrypto.private, providerCrypto.public, ownerCrypto.public, quantity)
    //             .catch(errMsg => {
    //                 expect(errMsg.indexOf('RecipientClaimVerification failed')).toBeGreaterThan(0);
    //             });
    //
    //         await delay(5 * 1000);
    //
    //         const endBalance1 = await api.balanceToken(assetProfile.id, ownerCrypto.public);
    //         const endBalance2 = await api.balanceToken(assetProfile.id, providerCrypto.public);
    //
    //         expect(endBalance2.balance).toBe(startBalance2.balance);
    //         expect(startBalance1.balance).toBe(endBalance1.balance);
    //     })
});