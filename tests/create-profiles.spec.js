jest.mock('../src/helpers/configuration', () => {
    return {
        SERVER_BASE_URI: 'https://api.ownera.io'
    };
});

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
        const profile = await api.createProfileForProvider(name);
        validateProfileStructure(profile, 'MSPID');
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
        const profile = await api.createProfileForAsset(config);

        validateProfileStructure(profile, 'MSPID');

        expect(profile.config).toMatch(JSON.stringify(config))
    });
});