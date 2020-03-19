const api = require('../src/api');

exports.validateProfileStructure = (profile, type) => {
    expect(profile).toEqual(
        expect.objectContaining({
            id: expect.any(String),
            // name: expect.any(String),
            publicKey: expect.any(Array),
            // claimIssuerIDs: expect.any(Array),
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

exports.getClaimConfiguration = async (name) => {
    if (!name) {
        console.warn('getClaimConfiguration: providerName is missing');
    }
    const crypto = api.createCrypto();
    const profile = await api.createOwnerProfile(crypto.private, crypto.public, JSON.stringify({}));
    const issuerProfile = await api.createProfileForProvider({name, crypto, config: JSON.stringify({})});
    const year_plus_1 = new Date();
    year_plus_1.setFullYear(year_plus_1.getFullYear() + 1);
    return {issuerProfile, profile, year_plus_1: year_plus_1.getTime(), crypto}
};