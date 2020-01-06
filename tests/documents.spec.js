jest.setTimeout(30000);

const {getClaimConfiguration, delay} = require('./utils');
const api = require('../src/api');

describe(`upload files`, () => {
    test(`
        Scenario: upload file to a claim
        Given     claim 
        And       file
        When      uploadDocument(claim.id, file)
        Then      the file will be attached to the claim
    `, async (done) => {
        const {issuerProfile, profile, year_plus_1} = await getClaimConfiguration('node1');
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
        await delay(5000);
        const doc = await api.uploadDocument(claim.id, __dirname +'/test.txt');

        expect(doc).toEqual(
            expect.objectContaining({
                id: expect.any(String),
            })
        );

        console.log('uploadDocument response ', doc);
        const documents = await api.listDocuments(claim.id);
        const updateDoc = await api.updateDocument(doc.id, claim.id, __dirname +'/test.txt');

        await delay(3000);

        const file = documents[0];

        expect(file.id).toMatch(doc.id);

        await api.downloadDocument(claim.id, file.id, file.name);
        done();
    })
});