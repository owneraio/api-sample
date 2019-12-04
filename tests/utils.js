
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
const validateProfileStructure = (profile, type) => {
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


exports.validateProfileStructure = validateProfileStructure;