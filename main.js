
const api = require('./api');

async function claimCreationSample(){
    const privKey = api.createCrypto();
    const profile = await api.createProfile(privKey);
    console.log(profile);
    const issuerProfile = await api.createProfileForMSP("issuer1");
    console.log(issuerProfile);
    const year_plus_1 = new Date(); year_plus_1.setFullYear(year_plus_1.getFullYear() + 1);
    const claim = await api.createClaim("KYC",
      issuerProfile.id, 
      new Date().toISOString(), 
      year_plus_1.toISOString(),
      profile.id,
      { blabla: 1});
      console.log(claim);
}


(async function() {

    await claimCreationSample();
    //const privKey = createCrypto();
    //const profile = await createProfile(privKey);
    //await readProfile(profile.id);
    //await putDocument('claim123', '/Users/ycarmel/go/src/github.com/ownera/core/app/kyab1d1.pdf');
    //const documents = await listDocuments('claim123');
    //const file = documents[0];
    //console.log(file);
    //await downloadDocument('claim123', file.id, file.name)
})();

