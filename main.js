
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
}

async function issueTokenSample(){
  const {private, public} = api.createCrypto();
  console.log(public.toString('hex'));
  console.log(public.toString('hex').length);
  await api.issueToken('blabla', public, 100);
  await api.issueToken('blabla', public, 50);
  setTimeout(async ()=>{
    await api.listToken('blabla', public);
  }, 5*1000);
}


(async function() {

    await claimCreationSample();
    //await issueTokenSample();
    //const privKey = createCrypto();
    //const profile = await createProfile(privKey);
    //await readProfile(profile.id);
    //await putDocument('claim123', '/Users/ycarmel/go/src/github.com/ownera/core/app/kyab1d1.pdf');
    //const documents = await listDocuments('claim123');
    //const file = documents[0];
    //console.log(file);
    //await downloadDocument('claim123', file.id, file.name)
})();

