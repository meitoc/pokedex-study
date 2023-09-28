const fs = require("fs");
const csv = require("csvtojson");

var express = require('express');
var router = express.Router();
//CONST AND INITIAL VALUE

const baseUrl = process.env.BACK_END_BASEURL;

const csvFilePath = 'archive/pokemon.csv';
const newJsonPath = 'archive/pokemons.json';
const imagePath = 'public/images';
const pokemonTypes = [
  "bug", "dragon", "fairy", "fire", "ghost", 
  "ground", "normal", "psychic", "steel", "dark", 
  "electric", "fighting", "flyingText", "grass", "ice", 
  "poison", "rock", "water"
]
//COMMON COMMANDS
//Load and process json

router.use('/', (req,res,next)=>{
  console.log(req.headers.referer);
  try{
    const file =  fs.readFileSync(newJsonPath,'utf-8');
    req.jsonFile=JSON.parse(file);
    next();
  }catch (error) {
    req.jsonFile=false
    next();
  }
});
//Load and process csv

router.use('/', (req,res,next)=>{
  const jsonFile=req.jsonFile;
  if(jsonFile===false){
    try{
      const file =  fs.readdirSync(imagePath,'utf-8');
      req.file=file;
      next();
    }catch (error) {
      console.error(error);
      const err = new Error('Error when load images folder');
      err.statusCode=403;
      next(err);
    }
  }else next();
});

router.use('/',async (req,res,next)=>{
  const file=req.file;
  const jsonFile=req.jsonFile;
  if(jsonFile===false){
    try {
      const pokemonArray = await csv().fromFile(csvFilePath);
      const filterredPokemonArray=pokemonArray.map((e,index)=>(
        file.includes(`${e.Name}.png`)?{
          id:           index+1,
          name:         e.Name,
          types:        e.Type2?[e.Type1, e.Type2]:[e.Type1],
          url:     e.url?e.url:`${baseUrl}images/${e.Name}.png`,
          description:  e.description?e.description:null,
          height:       e.height?e.height:null,
          weight:       e.weight?e.weight:null,
          categpry:     e.categpry?e.categpry:null,
          abilities:    e.abilities?e.abilities:null,
        }:null
      )).filter(e=>e!=null);

      req.json={
        data: filterredPokemonArray,
        totalPokemons: filterredPokemonArray.length,
      };
      next();
    } catch (error) {
      console.error(error);
      const err = new Error('Error when load csv');
      err.statusCode=403;
      next(err);
    }
  }else{
    req.json=jsonFile;
    next();
  }
});

//API SEARCH
//Search Pokémons by Type
router.get('/pokemons', function(req, res, next) {
  const type=req.query.type?.toLowerCase();
  console.log(type)
  if(type){
    const pokemonArray=req.json;
    req.json.data = pokemonArray.data.filter(e=>(e.types[0]?.toLowerCase()===type || e.types[1]?.toLowerCase()===type));
    // console.log(pokemonArray.data.length)
    // res.status(200).send(filterredPokemonArray);
  }
  next();
});

//Search Pokémons by name

router.get('/pokemons', function(req, res, next) {
  const search=req.query.search?.toLowerCase();
  console.log(search)
  if(search){
    req.json.data = req.json.data.filter(e=>e.name.includes(search));
    // console.log(req.json.data.length)
    // res.status(200).send(filterredPokemonArray);
  }
  next();
});


//ALL POKEMON JSON

router.get('/pokemons', function(req, res, next) {
  const page=req.query.page;
  const limit=req.query.limit;
  const jsonFile = req.json;
  console.log("page:",page,"limit:",limit);
  if(page && limit){
    if((page-1)*limit<=jsonFile.data.length){
      jsonFile.totalPokemons=jsonFile.data.length;
      jsonFile.data=jsonFile.data.filter((e,i)=>i>=(page-1)*limit && i<page*limit);
      console.log("json length",jsonFile.data.length)
      console.log(jsonFile)
      res.status(200).send(jsonFile);
    } else {
      jsonFile.data=[];
      jsonFile.totalPokemons=0;
      res.status(200).send(jsonFile);
      // const err = new Error('Wrong page and limit');
      // err.statusCode=403;
      // next(err);
    }
  } else{
    res.status(200).send(jsonFile);
  }
});

// this for testing

router.get('/pokemons.json', function(req, res, next) {
  const jsonFile = req.json;
  res.status(200).send(jsonFile);
  // const jsonFile = fs.readFileSync(newJsonPath,'utf-8');
  // res.status(200).send(JSON.parse(jsonFile));
});


// API POKEMON

// this for testing

router.get('/pokemons/:id', async function(req, res, next) {
    const id=parseInt(req.params.id);
    const pokemonArray=req.json.data;
    const arrayLength=pokemonArray.length;
    if (isNaN(id) || id<1 || id>arrayLength) {
      const err = new Error('Wrong url');
      err.statusCode=403;
      next(err);
    } else{
      const filterredPokemonArray = {data:{
        pokemon: pokemonArray[id-1],
        previousPokemon: id===1?pokemonArray[arrayLength-1]:pokemonArray[id-2],
        nextPokemon: id===arrayLength?pokemonArray[0]:pokemonArray[id]
      }};
      res.status(200).send(filterredPokemonArray);
    }
  });

// Create new Pokemon

router.post('/pokemons', async function(req, res, next) {
  const {
    id,
    name,
    types,
    url,
    description,
    height,
    weight,
    categpry,
    abilities
  }= req.body;
  const numberId=parseInt(id);
  console.log(req.body);
  const pokemonData=req.json.data;
  const totalPokemons=req.json.totalPokemons;
  if(name && types && url && id){
    if(
      pokemonTypes.includes(types[0].toLowerCase()) 
      && (types[1]===null || types[1]===undefined || pokemonTypes.includes(types[1].toLowerCase())) 
      && types[0] !== types[1]
    ){
      console.log(name)
      if(!pokemonData.some(e=>e.name===name)){
        if(numberId>0 && numberId<=(totalPokemons+1)){
          const newPokemon={
            id: numberId,
            name:name?name:"",
            types:types[1]?types:[types[0]],
            url:url?url:"",
            description:description?description:"",
            height:height?height:"",
            weight:weight?weight:"",
            categpry:categpry?categpry:"",
            abilities:abilities?abilities:"",
          };

          const newJson = {
            data: pokemonData,
            totalPokemons,
          };
          if(numberId===(totalPokemons+1)){
            newJson.data=[...newJson.data,newPokemon];
            newJson.totalPokemons++;
          } else{
            newJson.data[numberId-1]=newPokemon;
          }
          fs.writeFileSync(newJsonPath, JSON.stringify(newJson))
          const filterredPokemonArray = {data:{
            pokemon: newPokemon,
            previousPokemon: newPokemon.id===1?pokemonData[newJson.totalPokemons-1]:pokemonData[newPokemon.id-2],
            nextPokemon: newPokemon.id===newJson.totalPokemons?pokemonData[0]:pokemonData[newPokemon.id]
          }};
          res.status(200).send(filterredPokemonArray);
        } else{
          const err = new Error('Wrong id');
          err.statusCode=403;
          next(err);
        }
      } else {
        const err = new Error('Existing pokemon name');
        err.statusCode=403;
        next(err);
      }
    } else{
      const err = new Error('Wrong type');
      err.statusCode=403;
      next(err);
    }
  } else{
    const err = new Error('Miss infomation');
      err.statusCode=403;
      next(err);
  }
});

// Update new Pokemon

router.post('/update/', async function(req, res, next) {
  const {
    id,
    name,
    types,
    url,
    description,
    height,
    weight,
    categpry,
    abilities
  }= req.body;
  const pokemonData=req.json.data;
  const totalPokemons=req.json.totalPokemons;
  if(!isNaN(id) &&  id>0 && id<=totalPokemons){
    if(name && types && url){
      if(pokemonTypes.includes(types[0]) && (types[1]===undefined || pokemonTypes.includes(types[1])) && types[1] !== types[2]){
        if(!pokemonData.some(e=>e.name===name)){
          pokemonData[id-1] = {
            id: id,
            name:name?name:"",
            types:types?types:"",
            url:url?url:"",
            description:description?description:"",
            height:height?height:"",
            weight:weight?weight:"",
            categpry:categpry?categpry:"",
            abilities:abilities?abilities:"",
          }
          const newJson = {
            data: pokemonData,
            totalPokemons: totalPokemons,
          };
          fs.writeFileSync(newJsonPath, JSON.stringify(newJson))
          res.status(200).send("done");
        }else{
          const err = new Error('Existing name');
          err.statusCode=403;
          next(err);
        }
      } else{
        const err = new Error('Wrong type');
        err.statusCode=403;
        next(err);
      }
    } else{
      const err = new Error('Miss infomation');
        err.statusCode=403;
        next(err);
    }
  } else{
    const err = new Error('Wrong id');
      err.statusCode=403;
      next(err);
  }
});

// Delete new Pokemon

router.get('/delete/:id', async function(req, res, next) {
  const id=parseInt(req.params.id);
  const pokemonData=req.json.data;
  const totalPokemons=req.json.totalPokemons;
  if(!isNaN(id)&&id>0&&id<=totalPokemons){
    pokemonData.splice(id-1, 1);
    pokemonData.forEach((e,i) => { if(i>=id-1) e.id--;})
    const newJson = {
      data: pokemonData,
      totalPokemons: totalPokemons-1,
    };
    fs.writeFileSync(newJsonPath, JSON.stringify(newJson))
    res.status(200).send("done");
  } else {
    const err = new Error('Wrong id');
    err.statusCode=403;
    next(err);
  }
});

// RESET ALL CHANGE

router.get('/reset', async function(req, res, next) {
  fs.unlink(newJsonPath, (err) => {
    if (err) {
      const err = new Error('Error when reset');
      err.statusCode=403;
      next(err);
    } else {
      res.status(200).send("done");
    }
  });
});

module.exports = router;