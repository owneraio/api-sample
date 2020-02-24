const {validateProfileStructure} = require('./utils');
const api = require('../src/api');

describe(`update profiles`, () => {
    const config = {a: 5};
    let assetProfileC;
    const name = 'tempAssetName';
    const type = 'tempAssetType';

    beforeAll(async () => {
        assetProfileC = await api.createProfileForAsset({config, name, type});
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
        const assetProfileU = await api.updateProfileForAsset({id: assetProfileC.id, config: updateConfig, name, type});

        validateProfileStructure(assetProfileU, 'MSPID');
        console.log('assetProfileU', assetProfileU)
        expect(JSON.parse(assetProfileU.config)).toMatchObject({
            ...JSON.parse(assetProfileC.config),
            ...updateConfig
        });

        const assetInfoById = await api.readProfile(assetProfileU.id);
        expect(assetInfoById).toMatchObject(assetProfileU);
    })
});