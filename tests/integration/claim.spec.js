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
        const issuanceDate = new Date().toISOString();
        const data = {blabla: 1};
        const claim = await api.createClaim({
            type,
            issuerId: issuerProfile.id,
            issuanceDate,
            expirationDate: year_plus_1,
            subjectId: profile.id,
            data,
            crypto
        });

        expect(claim.type).toMatch(type);
        expect(claim.issuer).toMatch(issuerProfile.id);
        expect(claim.issuanceDate).toMatch(issuanceDate);
        expect(claim.expirationDate).toMatch(year_plus_1);
        expect(claim.data).toMatch(JSON.stringify(data));

        expect(typeof claim.id).toBe('string');
        expect(typeof claim.credentialSubject.id).toBe('string');
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
        const issuanceDate = new Date().toISOString();
        const data = {blabla: 1};
        const claimC = await api.createClaim({
            type,
            issuerId: issuerProfile.id,
            issuanceDate,
            expirationDate: year_plus_1,
            subjectId: profile.id,
            data,
            crypto
        });

        const dataU = {blabla: 2, kuku: 1};
        const claimU = await api.updateClaim({
            claimId: claimC.id,
            issuerId: issuerProfile.id,
            issuanceDate: new Date().toISOString(),
            expirationDate:year_plus_1,
            data: dataU,
            crypto
        });

        expect(claimU.data).toMatch(JSON.stringify(dataU))
    });
});