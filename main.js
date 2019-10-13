
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

async function testClaimUpdate(){
  var claim = await claimCreationSample();
  console.log(claim);
  const year_plus_1 = new Date(); year_plus_1.setFullYear(year_plus_1.getFullYear() + 1);
  setTimeout(async ()=>{
    claim = await api.updateClaim(claim.id, 
      new Date().toISOString(), 
      year_plus_1.toISOString(),
      { blabla: 2, kuku: 1});
    console.log(claim);  
  }, 2000);
}

async function testAssetUpdate(){
  const assetProfile = await api.createProfileForAsset({a: 5});
  console.log(assetProfile);
  await api.updateProfileForAsset(assetProfile.id, {a: 6});
  const a = await api.readProfile(assetProfile.id);
  console.log(a);
}

async function basicIssueTokenSample(){
  const crypto1 = api.createCrypto();
  const owner1 = await api.createOwnerProfile(crypto1.private, crypto1.public);
  const crypto2 = api.createCrypto();
  const owner2 = await api.createOwnerProfile(crypto2.private, crypto2.public);

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


async function issueTokenSample(){
  const crypto1 = api.createCrypto();
  const owner1 = await api.createOwnerProfile(crypto1.private, crypto1.public);
  const crypto2 = api.createCrypto();
  const owner2 = await api.createOwnerProfile(crypto2.private, crypto2.public);

  const kycProvider = await api.createProfileForProvider("KYCProvider");
  const year_plus_1 = new Date(); year_plus_1.setFullYear(year_plus_1.getFullYear() + 1);

  await api.createClaim("KYC-Location",
    kycProvider.id, 
    new Date().toISOString(), 
    year_plus_1.toISOString(),
    owner2.id,
    { country: 'US'});

  await api.createClaim("KYC-Investor",
    kycProvider.id, 
    new Date().toISOString(), 
    year_plus_1.toISOString(),
    owner2.id,
    { accredited: true});

  const assetProfile = await api.createProfileForAsset(
    {
      buyerRules: [
        [
          {type: 'KYC-Location', key: 'country', value: 'US'},
          {type: 'KYC-Investor', key: 'accredited', value: true}
        ]
      ],
      buyerKYCProviders: [kycProvider.id]
    },
    ['KYCVerification'] // enabled regulation apps
  );
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
    //const {private, public} = api.createCrypto();
    //const profile = await api.createOwnerProfile(private, public);
    //const claim = await claimCreationSample();
    //await testAssetUpdate();
    //await testClaimUpdate();

    //await basicIssueTokenSample();
    await issueTokenSample();
   //  const claim = await claimCreationSample();

    /*

    const claim = await claimCreationSample();

    setTimeout(async ()=>{
      const doc = await api.uploadDocument(claim.id, '/Users/ycarmel/go/src/github.com/ownera/core/app/kyab1d1.pdf');
      const documents = await api.listDocuments(claim.id);  
      const updateDoc = await api.updateDocument(doc.id, claim.id, '/Users/ycarmel/go/src/github.com/ownera/core/app/kyab1d1.pdf');
      setTimeout(async ()=>{
        const file = documents[0];
        await api.downloadDocument(claim.id, file.id, file.name);
      }, 3000);
    }, 5000);*/
  })();

