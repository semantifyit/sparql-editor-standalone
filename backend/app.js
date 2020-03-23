#!/usr/bin/env node
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const axios = require('axios');
const rateLimit = require("express-rate-limit");
const https = require('https');
// require('dotenv').load();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//variables
let total_statements_counter = 0;

app.use(express.static('./../'));


app.use(function (req, res, next) {
  // res.header("Access-Control-Allow-Origin", "*");
  // res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/', (req, res) => {
  res.send('hello world');
});
const apiLimiter = rateLimit({
  windowMs: 1000, // 15 minutes
  max: 1
});

// only apply to requests that begin with /api/
app.use("/api/query/", apiLimiter);

app.get('/api/query/:name', (req, res) => {

  let sampleQuery;
  let yesterday_date = getYesterdaysDate();
  let PREFIX = `PREFIX : <http://schema.org/>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>`;
  switch (req.params.name) {
    case 'hotel':
      sampleQuery = `${PREFIX}
          SELECT ?hotels ?hotel_name ?url ?loc 
            from <https://graph.semantify.it/ryJfFtrYZ/${yesterday_date}>
            WHERE  {
            ?hotels rdf:type :Hotel.
            ?hotels :name ?hotel_name .
            ?hotels :url ?url .
            ?hotels :address ?address .
            ?address :streetAddress ?loc .
          }
          LIMIT 10`;
      res.send(sampleQuery);
      break;
    case 'event':
      sampleQuery = `${PREFIX}
          SELECT ?events  ?event_name ?url
            WHERE  {
            ?events rdf:type :Event.
           ?events :name ?event_name.
            ?events :url ?url .
          }
          LIMIT 10`;
      res.send(sampleQuery);
      break;
    case 'restaurants':
      sampleQuery = `#Restaurants 
        ${PREFIX}
          SELECT ?restaurants  ?restaurant_name ?url
            WHERE  {
            ?restaurants rdf:type :Restaurant.
           ?restaurants :name ?restaurant_name.
            ?restaurants :url ?url .
          }
          LIMIT 10`;
      res.send(sampleQuery);
      break;
    case 'tvi':
      sampleQuery = `#The Villages in the Mayrhofen Region 
        ${PREFIX}
        SELECT DISTINCT ?name ?street ?location ?zip WHERE{
          ?s a :LodgingBusiness;
          :name ?name;
          :address ?address.
          ?address :addressLocality ?location;
          :streetAddress ?street ;
          :postalCode ?zip.
          FILTER (regex(str(?location),"Mayerhofen") || regex(str(?location), "Ginziling") || regex(str(?location),"Ramsau") || regex(str(?location),"Schwendau") || regex (str(?location),"Hippach") || regex(str(?location), "Brandberg") )
        }`;
      res.send(sampleQuery);
      break;
  }
})
app.get('/api/statement-counter', (req, res) => {
  res.json(total_statements_counter);
})
app.get('/api/counter', async (req, res) => {
  let statementsCounter = await axios.get('https://graphdb.sti2.at/repositories/TirolGraph-Beta/size');
  total_statements_counter = statementsCounter.data;
  res.json(statementsCounter.data);
})
app.get('/api/query', function (req, res) {
  const graphUri = req.query.urival;
  let headers = {
    'Accept': 'application/sparql-results+json,*/*;q=0.9',
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
  }
  let query = req.query['?query'];
  if (typeof query == 'undefined') {
    query = req.query.query;
  }
  const path = `?query=${encodeURIComponent(query)}&infer=false`;
  axios.get(graphUri + path, {
    headers: headers
  })
    .then((response) => {
      res.json({ dataVal: response.data });
    })
    .catch((error) => {
      res.send(error);
    })
  let date = new Date();
  date.setDate(date.getDate() - 2);
  return date.getFullYear() + '-' + + (date.getMonth() + 1) + '-' + date.getDate();
});

function getYesterdaysDate() {
  var date = new Date();
  date.setDate(date.getDate()-2);
  return date.getFullYear() + '-'+  + (date.getMonth()+1) + '-' + date.getDate() ;
}

let PORT = process.env.PORT || 7000;
app.listen(PORT, () => console.log(`server start at ${PORT}`));