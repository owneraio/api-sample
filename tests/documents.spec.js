jest.setTimeout(30000);

const {getClaimConfiguration} = require('./utils');
const api = require('../src/api');
const path = require('path');

describe(`upload files`, () => {
    test(`
        Scenario: upload file to a claim
        Given     claim 
        And       file
        When      uploadDocument(claim.id, file)
        Then      the file will be attached to the claim
    `, async (done) => {
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
        const uploadResponse = await api.uploadDocument({
            claimId: claim.id,
            filePath: path.resolve(__dirname, 'test.txt'),
            crypto,
            mimetype: 'text',
            name: 'test'
        });

        const doc = JSON.parse(uploadResponse);

        expect(doc).toEqual(
            expect.objectContaining({
                id: expect.any(String),
            })
        );

        console.log('uploadDocument response ', doc);
        const documents = await api.listDocuments(claim.id);
        const updateDoc = await api.updateDocument({
            docId: doc.id,
            claimId: claim.id,
            filePath: path.resolve(__dirname, 'test.txt'),
            crypto,
            mimetype: 'text',
            name: 'test'
        });

        const file = documents[0];

        expect(file.id).toMatch(doc.id);

        await api.downloadDocument(claim.id, file.id, file.name);
        done();
    })
});