
const api = require('./api');

async function claimCreationSample(){
    const {private, public} = api.createCrypto();
    const profile = await api.createProfile(private);
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
    return claim;
}

async function issueTokenSample(){
  const crypto1 = api.createCrypto();
  const crypto2 = api.createCrypto();
  await api.issueToken('blabla', crypto1.public, 100);
  await api.issueToken('blabla', crypto1.public, 50);
  setTimeout(async ()=>{
    await api.balanceToken('blabla', crypto1.public);
    await api.balanceToken('blabla', crypto2.public);

    await api.transferTokens('blabla', crypto1.private, crypto1.public, crypto2.public, 50);

    setTimeout(async ()=>{
      await api.balanceToken('blabla', crypto1.public);
      await api.balanceToken('blabla', crypto2.public);
    }, 5*1000);
  }, 5*1000);


}


(async function() {

    //const claim = await claimCreationSample();
    //await api.readProfile('123');

    await issueTokenSample();
    //const privKey = createCrypto();
    //const profile = await createProfile(privKey);
    //await readProfile(profile.id);
    /*setTimeout(async ()=>{
      await api.readClaim(claim.id);
      await api.putDocument(claim.id, '/Users/ycarmel/go/src/github.com/ownera/core/app/kyab1d1.pdf');
      const documents = await api.listDocuments(claim.id);  
    }, 5000);*/
    //const file = documents[0];
    //console.log(file);
    //await downloadDocument('claim123', file.id, file.name)
})();

