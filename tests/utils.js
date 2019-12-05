const api = require('../src/api');

` profile structure:
    {
        id: string,
        name: string,
        config: string,
        publicKey: [{
            publicKey: string,
            type: string
        }],
        claimIssuerIDs : []
    }
`
exports.validateProfileStructure = (profile, type) => {
    expect(profile).toEqual(
        expect.objectContaining({
            id: expect.any(String),
            name: expect.any(String),
            config: expect.any(String),
            publicKey: expect.any(Array),
            claimIssuerIDs: expect.any(Array),
        })
    );

    const onwerProfilePublicKey = profile.publicKey[0];
    expect(onwerProfilePublicKey).toEqual(
        expect.objectContaining({
            publicKey: expect.any(String),
            type: expect.any(String),
        })
    );

    expect(onwerProfilePublicKey.type).toMatch(type);
};


exports.delay = (time) => new Promise(resolve => {
    setTimeout(resolve, time);
});

exports.getClaimConfiguration = async (providerName) => {
    if (!providerName) {
        console.warn('getClaimConfiguration: providerName is missing');
    }
    const crypto = api.createCrypto();
    const profile = await api.createOwnerProfile(crypto.private, crypto.public);
    const issuerProfile = await api.createProfileForProvider(providerName);
    const year_plus_1 = new Date();
    year_plus_1.setFullYear(year_plus_1.getFullYear() + 1);
    return {issuerProfile, profile, year_plus_1: year_plus_1.toISOString(), crypto}
};