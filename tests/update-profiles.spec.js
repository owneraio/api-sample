const {validateProfileStructure} = require('./utils');
const api = require('../src/api');

describe(`update profiles`, () => {
    const config = {a: 5};
    let assetProfileC;

    beforeAll(async () => {
        assetProfileC = await api.createProfileForAsset(config);
    });

    test(`
    Scenario: update asset profile & check it been update (readProfile)
    Given     asset profile & config
    When      calling updateProfileForAsset with the given config & asset id
    Then      profile will be updated
    When      calling readProfile with asset id
    Then      receive the updated asset profile
    `, async () => {
        expect.assertions(5);
        const updateConfig = {a: 6};
        const assetProfileU = await api.updateProfileForAsset(assetProfileC.id, updateConfig);

        validateProfileStructure(assetProfileU, 'MSPID');
        expect(assetProfileU).toMatchObject({
            ...assetProfileC,
            config: JSON.stringify(updateConfig)
        });

        const assetInfoById = await api.readProfile(assetProfileU.id);
        expect(assetInfoById).toMatchObject(assetProfileU);
    })
});