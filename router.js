const express = require('express');
const app = express();
const handler = require('./handler');
const bodyParser = require('body-parser');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

app.get('/block/:uid', handler.HandlerBlock_GET);

app.post('/block', handler.HandlerBlock_POST);

app.post('/requestValidation', handler.HandlerValidationRequest_POST);

app.post('/message-signature/validate', handler.HandlerValidateSignature_POST);

app.post('/block', handler.HandlerStarBlock_POST);

app.listen(8000, () => console.log('Example app listening on port 8000!'));


