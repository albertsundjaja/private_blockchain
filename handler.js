const myChain = require('./simpleChain');
const levelDb = require('level');
const blockchain = new myChain.Blockchain();

const paramErr = {
    error:"Parameter error"
};
const notFoundErr = {
    error:"Block Not Found"
};
const internalErr = {
    error:"Internal server error"
};

HandlerBlock_GET = (req, res) => {
    const blockId = req.params.uid;
    if (!blockId) {
        res.status(400);
        res.json(paramErr);
        return;
    }

    blockchain.getBlock(parseInt(blockId))
        .then((block) => {
            res.status(200);
            res.json(block);
        })
        .catch( (err)=> {
            console.log(err);
            if (err.notFound) {
                res.status(404);
                res.json(notFoundErr);
            } else {
                res.status(500);
                res.json(internalErr);
            }

        });
};

HandlerBlock_POST = (req, res) => {
    let reqBody = req.body;
    console.log(reqBody);
    if (!reqBody) {
        res.status(400);
        res.json(paramErr);
        return;
    }
    if (!reqBody.body) {
        res.status(400);
        res.json({"error":"Block requires a body"});
        return;
    }

    const newBlock = new myChain.Block(reqBody.body);
    blockchain.addBlock(newBlock)
        .then((addedBlock) => {
            res.status(200);
            res.json(addedBlock);
        })
        .catch((err) => {
            console.log(err);
            res.status(500);
            res.json(internalErr);
        })
};

module.exports = {
    HandlerBlock_GET: HandlerBlock_GET,
    HandlerBlock_POST: HandlerBlock_POST
};