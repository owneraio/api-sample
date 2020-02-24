
jest.setTimeout(30000);

const api = require('../../src/api');
const {delay} = require('../utils');

describe('basic transfer operation', () => {
    const quantity = 100;
    let crypto1;
    let crypto2;
    let assetProfile;

    beforeAll(async () => {
        // Create 2 owners & 1 asset
        crypto1 = api.createCrypto();
        await api.createOwnerProfile(crypto1.private, crypto1.public);
        crypto2 = api.createCrypto();
        await api.createOwnerProfile(crypto2.private, crypto2.public);
        assetProfile = await api.createProfileForAsset({config:{a: 5}, name:'test', type:'test'});
    });

    test(`
    Scenario: issue token to owner
    Given     owners public key, asset id, quantity
    When      call issueToken with the given values
    And       call balanceToken with the assetId and owner public key
    Then      balance will change
    `, async () => {
        expect.assertions(1);

        const startBalance = await api.balanceToken(assetProfile.id, crypto1.public);
        await api.issueToken(assetProfile.id, crypto1.public, quantity);
        await delay(5000);
        const endBalance = await api.balanceToken(assetProfile.id, crypto1.public);
        expect(endBalance.balance - startBalance.balance).toBe(quantity);
    });

    test(`
    Scenario: Transfer tokens between owners
    Given     2 owners public keys and asset id
    When      call issueToken with assetId, owner publicKey and quantity
    Then      token balance will change
    `, async () => {
        expect.assertions(2);

        await api.issueToken(assetProfile.id, crypto1.public, quantity);
        await delay(5 * 1000);
        const balanceOwner1Start = await api.balanceToken(assetProfile.id, crypto1.public);
        const balanceOwner2Start = await api.balanceToken(assetProfile.id, crypto2.public);
        await api.transferTokens(assetProfile.id, crypto1.private, crypto1.public, crypto2.public, quantity);
        await delay(5 * 1000);
        const balanceOwner1End = await api.balanceToken(assetProfile.id, crypto1.public);
        const balanceOwner2End = await api.balanceToken(assetProfile.id, crypto2.public);

        expect(balanceOwner2End.balance - balanceOwner2Start.balance).toBe(quantity);
        expect(balanceOwner1Start.balance - balanceOwner1End.balance).toBe(quantity);
    });
});
