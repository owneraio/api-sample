jest.mock('../../src/helpers/configuration', () => {
    return {
        SERVER_BASE_URI: 'https://api.ownera.io'
    };
});
jest.setTimeout(10000);

const api = require('../../src/api');

const getClaimConfiguration = async () => {
    const {private: prvt, public: pub} = api.createCrypto();
    const profile = await api.createOwnerProfile(prvt, pub);
    const issuerProfile = await api.createProfileForProvider("node1");
    const year_plus_1 = new Date();
    year_plus_1.setFullYear(year_plus_1.getFullYear() + 1);
    return {issuerProfile, profile, year_plus_1: year_plus_1.toISOString()}
}

describe('test claims', () => {
    test(`
    Scenario: validate claim structure
    Given     type, issuerId, issuanceDate, expirationDate, subjectId, data
    When      calling createClaim with the given values
    Then      claim will be created
    `, async () => {
        const {issuerProfile, profile, year_plus_1} = await getClaimConfiguration();
        const type = 'KYC';
        const issuanceDate = new Date().toISOString();
        const data = {blabla: 1};
        const claim = await api.createClaim(
            type,
            issuerProfile.id,
            issuanceDate,
            year_plus_1,
            profile.id,
            data
        );

        expect(claim.type).toMatch(type);
        expect(claim.issuer).toMatch(issuerProfile.id);
        expect(claim.issuanceDate).toMatch(issuanceDate);
        expect(claim.expirationDate).toMatch(year_plus_1);
        expect(claim.data).toMatch(JSON.stringify(data));

        expect(typeof claim.id).toBe('string');
        expect(typeof claim.credentialSubject.id).toBe('string');
    });


    test(`
    Scenario: update claim & check it been update (readProfile)
    Given     claimId, issuanceDate, expirationDate, data
    When      calling updateClaim with the given values
    Then      claim will be updated
    When      calling readProfile with claim id
    Then      receive the updated claim info
    `, async () => {

    })
});