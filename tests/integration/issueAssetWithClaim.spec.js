jest.setTimeout(30000);

const api = require('../../src/api');
const {delay, getClaimConfiguration} = require('../utils');

describe('issue token of asset with claim', () => {
    const quantity = 100;
    let crypto1;
    let crypto2;
    let assetProfile;

    beforeAll(async () => {
        crypto1 = api.createCrypto();
        await api.createOwnerProfile(crypto1.private, crypto1.public);

        const {issuerProfile, profile, year_plus_1, crypto} = await getClaimConfiguration("KYCProvider");
        crypto2 = crypto;

        const issuanceDate = new Date().toISOString();
        await api.createClaim(
            "KYC-Location",
            issuerProfile.id,
            issuanceDate,
            year_plus_1,
            profile.id,
            {country: 'US'});

        await api.createClaim(
            "KYC-Investor",
            issuerProfile.id,
            issuanceDate,
            year_plus_1,
            profile.id,
            {accredited: true});

        assetProfile = await api.createProfileForAsset(
            {
                recipientRules: [
                    [
                        {type: 'KYC-Location', key: 'country', value: 'US'},
                        {type: 'KYC-Investor', key: 'accredited', value: true}
                    ]
                ],
                recipientClaimProviders: [issuerProfile.id]
            },
            ['RecipientClaimVerification'] // enabled regulation apps
        );
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
            await api.issueToken(assetProfile.id, crypto1.public, quantity);
            await delay(5 * 1000);

            const startBalance1 = await api.balanceToken(assetProfile.id, crypto1.public);
            const startBalance2 = await api.balanceToken(assetProfile.id, crypto2.public);

            await api.transferTokens(assetProfile.id, crypto1.private, crypto1.public, crypto2.public, quantity);

            await delay(5 * 1000);

            const endBalance1 = await api.balanceToken(assetProfile.id, crypto1.public);
            const endBalance2 = await api.balanceToken(assetProfile.id, crypto2.public);

            expect(endBalance2.balance - startBalance2.balance).toBe(quantity);
            expect(startBalance1.balance - endBalance1.balance).toBe(quantity);
        })


    test(`
    Scenario: fail to transfer tokens, claim not approved
    Given     2 owners, asset, RecipientClaimVerification
    | profile  | information                                             |
    | -------- | ------------------------------------------------------- |
    | owner1   |          -                                              |
    | owner2   | claims: [KYC-Investor, KYC-Location]                    |
    | asset    | require: [KYC-Investor, KYC-Location]                   |
    |            regulationApp: RecipientClaimVerification               |
    
    When       transfer token from owner2 to owner1
    Then       claim will be approved
    And        owner1, owner2 balance will be updated
    `,
        async () => {
            expect.assertions(3);
            await api.issueToken(assetProfile.id, crypto2.public, quantity);
            await delay(5 * 1000);

            const startBalance1 = await api.balanceToken(assetProfile.id, crypto1.public);
            const startBalance2 = await api.balanceToken(assetProfile.id, crypto2.public);

            await api.transferTokens(assetProfile.id, crypto2.private, crypto2.public, crypto1.public, quantity)
                .catch(errMsg => {
                    expect(errMsg.indexOf('RecipientClaimVerification failed')).toBeGreaterThan(0);
                });

            await delay(5 * 1000);

            const endBalance1 = await api.balanceToken(assetProfile.id, crypto1.public);
            const endBalance2 = await api.balanceToken(assetProfile.id, crypto2.public);

            expect(endBalance2.balance).toBe(startBalance2.balance);
            expect(startBalance1.balance).toBe(endBalance1.balance);
        })
});