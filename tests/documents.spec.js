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
        const {profile, year_plus_1, crypto} = await getClaimConfiguration('node1');
        const type = 'KYC';
        const issuanceDate = new Date().getTime();
        const data = JSON.stringify({blabla: 1});
        const claim = await api.createClaim({
            type,
            issuanceDate,
            expirationDate: year_plus_1,
            subjectId: profile.id,
            data,
        });
        const uploadResponse = await api.uploadDocument({
            profileId: profile.id,
            certificateId: claim.id,
            file: path.resolve(__dirname, 'test.txt'),
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
            profileId: profile.id,
            docId: doc.id,
            certificateId: claim.id,
            file: path.resolve(__dirname, 'test.txt'),
        });

        const file = documents[0];

        expect(file.id).toMatch(doc.id);

        await api.getDocument({docUri: doc.uri, file: file.name});
        done();
    })
});
