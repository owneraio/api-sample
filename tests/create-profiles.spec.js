const {validateProfileStructure} = require('./utils');
const api = require('../src/api');

describe(`create profiles`, () => {
    test(`
    Scenario: validate owner profile structure
    Given     private & public keys
    When      calling createOwnerProfile with the given keys
    Then      profile will be created
    `, async () => {
        expect.assertions(3);

        const {private: privateKey, public: publicKey} = api.createCrypto();
        const profile = await api.createOwnerProfile(privateKey, publicKey);

        validateProfileStructure(profile, 'ECDSA');
    });

    test(`
    Scenario: validate provider profile structure
    Given     provider name
    When      calling createProfileForProvider with the given name
    Then      profile will be created
    `, async () => {
        expect.assertions(4);

        const name = 'node1';
        const crypto = api.createCrypto();
        const profile = await api.createProfileForProvider({name, crypto});
        validateProfileStructure(profile, 'ECDSA');
        expect(profile.name).toMatch(name)
    });

    test(`
    Scenario: validate asset profile structure (no regulation app)
    Given     asset config 
    But       without array of regApps ids
    When      calling createProfileForAsset with the given config & regApps ids
    Then      profile will be created
    `, async () => {
        expect.assertions(4);
        const config = {a: 5};
        const regulationApps = [{id: 'app'}];
        const name = 'assetName';
        const type = 'assetType';
        const profile = await api.createProfileForAsset({config, regulationApps, name, type});
        validateProfileStructure(profile, 'MSPID');

        expect(JSON.parse(profile.config)).toMatchObject({...config, name, type, regulationApps})
    });
});