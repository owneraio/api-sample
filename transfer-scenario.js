const api = require('./api');

(async function() {

    // Creating Owner profile 1
    const crypto1 = api.createCrypto();
    const owner1 = await api.createOwnerProfile(crypto1.private, crypto1.public);
  
    // Creating Owner profile 2
    const crypto2 = api.createCrypto();
    const owner2 = await api.createOwnerProfile(crypto2.private, crypto2.public);
  
    // Creating Owner profile 3
    const crypto3 = api.createCrypto();
    const owner3 = await api.createOwnerProfile(crypto3.private, crypto3.public);
  
    // Creating a Provider for KYC service
    const claimProvider = await api.createProfileForProvider("Institution X");
  
    // Write Claims for Owner 2
    const year_plus_1 = new Date(); year_plus_1.setFullYear(year_plus_1.getFullYear() + 1);
    await api.createClaim("KYC-Location",
      claimProvider.id, 
      new Date().toISOString(), 
      year_plus_1.toISOString(),
      owner2.id,
      { country: 'US'});
  
    await api.createClaim("Accreditation",
      claimProvider.id, 
      new Date().toISOString(), 
      year_plus_1.toISOString(),
      owner2.id,
      { accredited: false});
  
      //Write Claims for Owner 3
      await api.createClaim("KYC-Location",
      claimProvider.id, 
      new Date().toISOString(), 
      year_plus_1.toISOString(),
      owner3.id,
      { country: 'US'});
  
    await api.createClaim("Accreditation",
      claimProvider.id, 
      new Date().toISOString(), 
      year_plus_1.toISOString(),
      owner3.id,
      { accredited: true});
  

    // Create a profile for an Asset representing Shares in Company Y  
    const assetProfile = await api.createProfileForAsset(
      {
        recipientRules: [
          [
            {type: 'KYC-Location', key: 'country', value: 'US'},
            {type: 'Accreditation', key: 'accredited', value: true}
          ]
        ],
        recipientClaimProviders: [claimProvider.id]
      },
      ['RecipientClaimVerification'] // enabled regulation apps
    );
  
    // Primary Issuance for Owner 1
    await api.issueToken(assetProfile.id, crypto1.public, 150);

    setTimeout(async () => {

            // Owner 1 Balance
      await api.balanceToken(assetProfile.id, crypto1.public);
      // Owner 2 Balance
      await api.balanceToken(assetProfile.id, crypto2.public);
      // Owner 3 Balance
      await api.balanceToken(assetProfile.id, crypto3.public);

      // Transfer tokens from Owner 1 to Owner 2 - should fail
      await api.transferTokens(assetProfile.id, crypto1.private, crypto1.public, crypto2.public, 50).catch(e => {});

      // Owner 1 Balance
      await api.balanceToken(assetProfile.id, crypto1.public);
      // Owner 2 Balance
      await api.balanceToken(assetProfile.id, crypto2.public);
      // Owner 3 Balance
      await api.balanceToken(assetProfile.id, crypto3.public);
      
      // Transfer tokens from Owner 1 to Owner 3
      await api.transferTokens(assetProfile.id, crypto1.private, crypto1.public, crypto3.public, 50).catch(e => {});;

      setTimeout(async () => {

        // Owner 1 Balance
        await api.balanceToken(assetProfile.id, crypto1.public);
        // Owner 2 Balance
        await api.balanceToken(assetProfile.id, crypto2.public);
        // Owner 3 Balance
        await api.balanceToken(assetProfile.id, crypto3.public);

      }, 4000);

    }, 2000);

})();

