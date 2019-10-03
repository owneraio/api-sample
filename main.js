
const api = require('./api');

async function claimCreationSample(){
    const {private, public} = api.createCrypto();
    const profile = await api.createOwnerProfile(private, public);
    console.log(profile);
    const issuerProfile = await api.createProfileForProvider("node1");
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
  const assetProfile = await api.createProfileForAsset({a: 5});
  await api.issueToken(assetProfile.id, crypto1.public, 100);
  await api.issueToken(assetProfile.id, crypto1.public, 50);
  setTimeout(async ()=>{
    await api.balanceToken(assetProfile.id, crypto1.public);
    await api.balanceToken(assetProfile.id, crypto2.public);

    await api.transferTokens(assetProfile.id, crypto1.private, crypto1.public, crypto2.public, 50);

    setTimeout(async ()=>{
      await api.balanceToken(assetProfile.id, crypto1.public);
      await api.balanceToken(assetProfile.id, crypto2.public);
    }, 5*1000);
  }, 5*1000);


}


(async function() {

    //await api.readProfile('123');

  //  await issueTokenSample();
  //const {private, public} = api.createCrypto();
  //const profile = await api.createOwnerProfile(private, public);
    //console.log(profile);
    //await readProfile(profile.id);
    const {private, public} = api.createCrypto();
    const profile = await api.createOwnerProfile(private, public);

    //await issueTokenSample();

    /*const claim = await claimCreationSample();

    setTimeout(async ()=>{
      await api.putDocument(claim.id, '/Users/ycarmel/go/src/github.com/ownera/core/app/kyab1d1.pdf');
      const documents = await api.listDocuments(claim.id);  
      setTimeout(async ()=>{
        const file = documents[0];
        await api.downloadDocument('claim123', file.id, file.name);
      }, 3000);
    }, 5000);*/
  })();

