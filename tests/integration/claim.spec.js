jest.setTimeout(30000);

const api = require('../../src/api');
const {delay, getClaimConfiguration} = require('../utils');

describe('test claims', () => {
    test(`
    Scenario: validate claim structure
    Given     type, issuerId, issuanceDate, expirationDate, subjectId, data
    When      calling createClaim with the given values
    Then      claim will be created
    `, async () => {
        expect.assertions(7);

        const {issuerProfile, profile, year_plus_1, crypto} = await getClaimConfiguration('node1');
        const type = 'KYC';
        const issuanceDate = new Date();
        const data = JSON.stringify({blabla: 1});
        const claim = await api.createClaim({
            type,
            issuerId: issuerProfile.id,
            issuanceDate: issuanceDate.getTime(),
            expirationDate: year_plus_1,
            subjectId: profile.id,
            data,
            crypto
        });

        expect(claim.claimType).toMatch(type);
        expect(claim.issuer).toMatch(issuerProfile.id);
        expect(new Date(claim.issuanceDate).toISOString()).toMatch(issuanceDate.toISOString());
        expect(claim.expirationDate).toEqual(year_plus_1);
        expect(claim.data).toMatch(data);

        expect(typeof claim.id).toBe('string');
        expect(typeof claim.credentialSubjectId).toBe('string');
    });


    test(`
    Scenario: update claim
    Given     claimId, issuanceDate, expirationDate, data
    When      calling updateClaim with the given values
    Then      claim will be updated
    `, async () => {
        expect.assertions(1);

        const {issuerProfile, profile, year_plus_1, crypto} = await getClaimConfiguration('node1');
        const type = 'KYC';
        const issuanceDate = new Date().getTime();
        const data = JSON.stringify({blabla: 1});
        const claimC = await api.createClaim({
            type,
            issuerId: issuerProfile.id,
            issuanceDate,
            expirationDate: year_plus_1,
            subjectId: profile.id,
            data,
            crypto
        });

        const dataU = JSON.stringify({blabla: 2, kuku: 1});
        const claimU = await api.updateClaim({
            claimId: claimC.id,
            issuerId: issuerProfile.id,
            issuanceDate: new Date().getTime(),
            expirationDate:year_plus_1,
            data: dataU,
            crypto
        });

        expect(claimU.data).toMatch(dataU)
    });
});