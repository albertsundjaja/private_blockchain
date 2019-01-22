const express = require('express');
const app = express();
const handler = require('./handler');
const bodyParser = require('body-parser');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

app.get('/', (req, res) => res.send('Hello World!'));

app.get('/block/:uid', handler.HandlerBlock_GET);

app.post('/block', handler.HandlerBlock_POST);

app.listen(3000, () => console.log('Example app listening on port 3000!'));


