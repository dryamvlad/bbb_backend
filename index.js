const express = require('express'),
  path = require('path'),
  cors = require('cors'),
  Web3 = require('web3'),
  mongoose = require('mongoose'),
  ethers = require('ethers'),

  JSONdb = require('simple-json-db'),

  dbIpfsHashes = new JSONdb('./db/ipfs_hashes.json'),
  dbIpfsHashesShrooms = new JSONdb('./db/ipfs_hashes_shrooms.json'),

  dbTraitsBots = new JSONdb('./db/traits_bots.json'),
  dbTraitsShrooms = new JSONdb('./db/traits_shrooms.json'),

  dbStatsBots = new JSONdb('./db/stats_bots.json'),
  dbStatsShrooms = new JSONdb('./db/stats_shrooms.json'),

  dbResistanceBots = new JSONdb('./db/resistance_bots.json'),
  dbResistanceShrooms = new JSONdb('./db/resistance_shrooms.json'),

  dbIpfsHashesPrizes = new JSONdb('./db/ipfs_hashes_prizes.json'),
  dbIpfsHashesPrizesPreviews = new JSONdb('./db/ipfs_hashes_prizes_previews.json'),
  dbWinnerCategories = new JSONdb('./db/winner_categories.json'),
  dbWalletAddresses = new JSONdb('./db/wallet_addresses.json'),

  revealIsActive = true,
  placeholderIpfsHash = 'QmchQaQQ9CMwV3nDLBvcgqn1td3mAd4gf3hzqwPB3Q9hyP',

  PORT = process.env.PORT || 5000,

  app = express()
    .set('port', PORT)
    .set('views', path.join(__dirname, 'views'))
    .set('view engine', 'ejs')


// Static public files
//app.use(express.static(path.join(__dirname, 'public')))
mongoose.connect("mongodb+srv://VictorSoltan:Password1!@cluster0.dc7dp.mongodb.net/myFirstDatabase?retryWrites=true&w=majority", (err) => {
  if(!err) console.log('db connected')
  else console.log('db error')
})

const User = new mongoose.Schema({
  wallets: String,
  name: String,
  avatar: String,
  description: String,
  email: String,
  discord: String
})

const NewModel = new mongoose.model("Gamers", User)

// async function check(){

// }

// check()



app.use(cors());
app.use(express.json())

app.get('/', function (req, res) {
  res.send('All_is up');
})


function getStat(db, type, traits) {
  result = false;
  statsAll = db.get(type);

  traits.forEach(trait => {
    foundStat = statsAll.find(function(stat, index){
      if(trait.trait_type == type && stat.item == trait.value)
        return true;
    });

    if(typeof foundStat !== 'undefined')
      result = foundStat;
  });

  return result ? result.power : -1;
}

app.get('/bot/:token_id', function (req, res) {
  const tokenId = parseInt(req.params.token_id).toString();
  const ipfsHash = dbIpfsHashes.get(tokenId);
  traits = dbTraitsBots.get(tokenId);

  weaponPower = getStat(dbStatsBots, "Weapon", traits);
  toyPower = getStat(dbStatsBots, "Toy", traits)
  
  traits.push({"display_type": "boost_number", "trait_type": "Attack", "value": weaponPower});
  traits.push({"display_type": "boost_number", "trait_type": "Defence", "value": toyPower});
  
  let resist = dbResistanceBots.storage.Resistance
  let toyResist
  let traitForResist

  let traitHead 

  let traitHealth = -50

  traits.forEach(trait => {
    if(trait.trait_type == "Toy"){
      traitForResist = trait.value
    }
  })
  
  traits.forEach(trait => {
    if(trait.trait_type == "Head"){
      traitHead = trait.value
    }
  })

  resist.forEach(elem => {
    if(traitForResist===elem.item){
      toyResist = elem.values
    }
  })

  let dbBotsHead = dbStatsBots.get('Head')
  
  dbBotsHead.forEach(elem => {
    if(traitHead === elem.head){
      traits.push({"display_type": "boost_number", "trait_type": "Trick", "value": elem.force});
    }
  })

  traits.forEach(trait => {
    if(trait.trait_type === "Attack"){
      traitHealth += trait.value
    }
    if(trait.trait_type === "Defence"){
      traitHealth += trait.value
    }
    if(trait.trait_type === "Trick"){
      traitHealth += trait.value
    }        
  })

  traits.push({"trait_type": "Health", "value": traitHealth});

  let tokenDetails = {
    description: "Baby Combat Bots is a collection of cute and deadly procedurally generated robots. Own a Bot. Battle other Bots. Earn Eth.",
    image: 'https://ipfs.io/ipfs/' + placeholderIpfsHash,
    name: 'Baby Combat Bot #' + tokenId,
    attributes: {
      'Ready To Battle': 'Soon',
    },
    alpha_125: 'https://battleverse.storage.googleapis.com/bots_alpha_125/a_'+tokenId+'.png',
    alpha_500: 'https://battleverse.storage.googleapis.com/bots_alpha_500/a_'+tokenId+'.png',
    resistance: toyResist
  };

  if (revealIsActive) {
    tokenDetails.image = 'https://ipfs.io/ipfs/' + ipfsHash;
    tokenDetails.ipfs_image = 'https://ipfs.io/ipfs/' + ipfsHash;
    tokenDetails.attributes = traits;
  }

  res.send(tokenDetails);

  traits.pop();
  traits.pop();
  traits.pop();
  traits.pop();
})

app.get('/shroom/:token_id', function (req, res) {
  const tokenId = parseInt(req.params.token_id).toString();
  const ipfsHash = dbIpfsHashesShrooms.get(tokenId);
  traits = dbTraitsShrooms.get(tokenId);

  weaponPower = getStat(dbStatsShrooms, "Weapon", traits);
  toolPower = getStat(dbStatsShrooms, "Tools", traits)

  traits.push({"display_type": "boost_number", "trait_type": "Attack", "value": weaponPower});
  traits.push({"display_type": "boost_number", "trait_type": "Defence", "value": toolPower});

  let resist = dbResistanceShrooms.storage.Resistance
  let toyResist
  let traitForResist

  let traitHead 
  let traitHealth = -50

  traits.forEach(trait => {
    if(trait.trait_type == "Tools"){
      traitForResist = trait.value
    }
  })
  
  traits.forEach(trait => {
    if(trait.trait_type == "Head"){
      traitHead = trait.value
    }
  })
  
  resist.forEach(elem => {
    if(traitForResist===elem.item){
      toyResist = elem.values
    }
  })

  let dbShroomHead =  dbStatsShrooms.get('Head')

  dbShroomHead.forEach(elem => {
    if(traitHead === elem.head){
      traits.push({"display_type": "boost_number", "trait_type": "Trick", "value": elem.force});
    }
  })

  traits.forEach(trait => {
    if(trait.trait_type === "Attack"){
      traitHealth += trait.value
    }
    if(trait.trait_type === "Defence"){
      traitHealth += trait.value
    }
    if(trait.trait_type === "Trick"){
      traitHealth += trait.value
    }        
  })

  traits.push({"trait_type": "Health", "value": traitHealth});

  let tokenDetails = {
    description: "First generation of Battle Shrooms — a collection of procedurally generated mushrooms race ready to fight in BattleVerse!",
    image: 'https://ipfs.io/ipfs/' + placeholderIpfsHash,
    name: 'Battle Shroom #' + tokenId,
    attributes: {
      'Ready To Battle': 'Soon'
    },
    alpha_125: 'https://battleverse.storage.googleapis.com/shrooms_alpha_125/a_'+tokenId+'.png',
    alpha_500: 'https://battleverse.storage.googleapis.com/shrooms_alpha_500/a_'+tokenId+'.png',
    resistance: toyResist
  };

  if (revealIsActive) {
    tokenDetails.image = 'https://ipfs.io/ipfs/' + ipfsHash;
    tokenDetails.ipfs_image = 'https://ipfs.io/ipfs/' + ipfsHash;
    tokenDetails.attributes = traits;
  }

  res.send(tokenDetails);

  traits.pop();
  traits.pop();
  traits.pop();
  traits.pop();
})

// app.get('/resistance_bots/', function (req, res) {
//   res.send(dbResistanceBots);
// })

// app.get('/resistance_shrooms/', function (req, res) {
//   res.send(dbResistanceShrooms);
// })

app.get('/prize/:token_id', function (req, res) {
  const tokenId = parseInt(req.params.token_id).toString();
  const winnerCategory = dbWinnerCategories.get(tokenId).toString();
  const ipfsAnimationHash = dbIpfsHashesPrizes.get(winnerCategory);
  const ipfsPreviewHash = dbIpfsHashesPrizesPreviews.get(winnerCategory);
  const traitType = {
    "non_owner": "Iridescent",
    "owner_1": "White Carbon",
    "owner_2": "Purple",
    "owner_3": "Gold",
    "owner_5": "Gem",
    "first": "Hexagon Awesomness"
  }

  let tokenDetails = {
    description: "Baby Combat Bots is a collection of cute and deadly procedurally generated robots. Own a Bot. Battle other Bots. Earn Eth.",
    image: 'https://ipfs.io/ipfs/' + ipfsPreviewHash,
    animation_url: 'https://gateway.pinata.cloud/ipfs/' + ipfsAnimationHash,
    name: 'Puzzle Prize #' + tokenId,
    attributes: {
      'Type': traitType[winnerCategory]
    }
  };

  res.send(tokenDetails);
})

let messageHash

app.get('/verification', (req, res) => {
  messageHash = Web3.utils.sha3((Math.random() + 1).toString(36).substring(7))
  res.send(messageHash);
})

app.get('/get_user', async(req, res) => {
  const user = await NewModel.findOne({ wallets: req.query.account });
  if (user) res.send(user)
  else res.send('No such user')
})

app.post('/create_user', async(req, res) => {

  const signerAddr = await ethers.utils.verifyMessage(messageHash, req.body.signature)
  if(req.body.account === signerAddr.toLowerCase()){
    
    const user = await NewModel.findOne({ wallets: req.body.account });
    if (user) {
      console.log(user)
    }else{
      console.log(req.body.account)
      const data = NewModel({
        wallets: req.body.account, 
        name: req.body.name, 
        avatar: req.body.avatar,
        description: req.body.description,
        email: req.body.email,
        discord: req.body.discord
      })
      data.save()
      res.end("new user successfully created")
    }
    console.log('passed')    

  }else{
    console.log('not passed')    
    res.end("wallet doesn't mutch")
  } 
})

app.post('/change_user_data', async(req, res) => {
  try {
    const signerAddr = await ethers.utils.verifyMessage(messageHash, req.body.signature)
    if(req.body.account === signerAddr.toLowerCase()){
      const user = await NewModel.findOne({ wallets: req.body.account });
      if (user) {
        user.name = req.body.name
        if(req.body.avatar!==''){
          user.avatar = req.body.avatar
        }
        user.description = req.body.description
        user.email = req.body.email
        user.discord = req.body.discord      
        user.save()
        res.end('data successfully updated')
      }else{
        res.end('no such user')
      }
    }else {
      res.end("wallet don't mutch")
    }    
  }catch (err){
    console.log(err)
  }
})

app.use(function onError(err, req, res, next) {
  // The error id is attached to `res.sentry` to be returned
  // and optionally displayed to the user for support.
  res.statusCode = 500;
  res.end(res.sentry + "");
});

app.listen(app.get('port'), function () {
  console.log('Node app is running on port', app.get('port'));
})