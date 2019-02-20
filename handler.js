const myChain = require('./simpleChain');
const levelDb = require('level');
const blockchain = new myChain.Blockchain();
const mempool = require('./mempool');
const bitcoinMessage = require('bitcoinjs-message');

const paramErr = {
    error:"Parameter error"
};
const notFoundErr = {
    error:"Block Not Found"
};
const internalErr = {
    error:"Internal server error"
};

const memPool = new mempool.MemPool();

HandlerBlock_GET = (req, res) => {
    const blockId = req.params.height;
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

HandlerValidationRequest_POST = (req, res) => {
    let reqBody = req.body;
    if (!reqBody) {
        res.status(400);
        res.json(paramErr);
        return;
    }
    if (!reqBody.address) {
        res.status(400);
        res.json({"error":"Request requires address"});
        return;
    }

    const address = reqBody.address;

    // check for existing in mempool
    let existingReq = memPool.getRequest(address);
    if (existingReq) {
        let validationWindow = existingReq.calculateValidationWindow();
        // if validationWindow is -1, it means it is expired, create a new request
        if (validationWindow !== -1) {
            res.status(409);
            res.json({
                "walletAddress": existingReq.address,
                "requestTimeStamp": existingReq.requestTimestamp,
                "message": existingReq.address + ":" + existingReq.requestTimestamp.toString() + ":" + "starRegistry",
                "validationWindow": validationWindow
            });
            return;
        }
    }

    // create a temp request
    let addressReq = new mempool.AddressRequest();
    addressReq.address = address;
    addressReq.requestTimestamp = Math.round(Date.now() / 1000);

    // add to mempool
    memPool.pool.push(addressReq);

    // add to timeouts, validation_time is in seconds
    setTimeout(function(){
        memPool.deleteRequest(addressReq)
    }, mempool.VALIDATION_TIME * 1000);


    res.json({
        "walletAddress": address,
        "requestTimeStamp": addressReq.requestTimestamp,
        "message": address + ":" + addressReq.requestTimestamp.toString() + ":" + "starRegistry",
        "validationWindow": mempool.VALIDATION_TIME
    });

};

HandlerValidateSignature_POST = (req, res) => {
    let reqBody = req.body;
    if (!reqBody) {
        res.status(400);
        res.json(paramErr);
        return;
    }
    if (!reqBody.address) {
        res.status(400);
        res.json({"error":"Request requires address"});
        return;
    }
    if (!reqBody.signature) {
        res.status(400);
        res.json({"error":"Request require signature"});
        return;
    }

    const address = reqBody.address;
    // check if this request already validated
    let existingReq = memPool.getValidRequest(address);
    if (existingReq) {
        let validationWindow = existingReq.calculateValidationWindow();
        // if validationWindow is -1, it means it is expired, create a new request
        if (validationWindow !== -1) {
            existingReq.status.validationWindow = validationWindow;
            res.status(409);
            res.json({
                "registerStar": true,
                "status":existingReq.status
            });
            return;
        }
        else {
            res.status(409);
            res.json({
                "error": "Expired, please resend validation request"
            });
            return;
        }
    }

    // check for signature
    const signature = reqBody.signature;
    const addressReq = memPool.getRequest(address);
    const message = addressReq.address + ":" + addressReq.requestTimestamp.toString() + ":" + "starRegistry";
    let isValid = bitcoinMessage.verify(message, address, signature);
    if (!isValid) {
        res.status(401);
        res.json({"error": "Signature is not valid"});
        return;
    }

    // create new valid request and store in valid pool then remove from the unvalidated pool
    let validReq = new mempool.ValidRequest();
    validReq.status.address = address;
    validReq.status.requestTimestamp = Math.round(Date.now() / 1000);
    validReq.status.message = address + ":" +  validReq.status.requestTimestamp.toString() + ":" + "starRegistry";
    memPool.validPool.push(validReq);
    memPool.deleteRequest(address);

    res.status(200);
    res.json({
        "registerStar": true,
        "status": validReq.status
    });

    // add to timeouts, validation_time is in seconds
    setTimeout(function(){
        memPool.deleteValidRequest(address)
    }, mempool.VALIDATION_TIME * 1000);

};

HandlerStarBlock_POST = (req, res) => {
    let reqBody = req.body;
    if (!reqBody) {
        res.status(400);
        res.json(paramErr);
        return;
    }
    if (!reqBody.address) {
        res.status(400);
        res.json({"error":"Request requires address"});
        return;
    }
    if (!reqBody.star) {
        res.status(400);
        res.json({"error":"Request require star"});
        return;
    }

    const address = reqBody.address;

    // check if address has been validated
    let validReq = memPool.getValidRequest(address);
    if (!validReq) {
        res.status(401);
        res.json({"error": "Address has not been validated"});
        return;
    }

    const newBlock = new myChain.Block(reqBody);
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

HandlerStarLookupHash_GET = (req, res) => {
    let hash = req.params.hash;
    if (!hash) {
        res.status(400);
        res.json(paramErr);
        return;
    }

    // remove the leading :
    hash = hash.substring(1);

    blockchain.getBlockStarHash(hash)
        .then((block) => {
            res.status(200);
            res.json(block);
        })
        .catch((err)=> {
            // tell user that address cant be found
            if (err === myChain.errHashNotFound) {
                res.status(409);
                res.json(err);
                return;
            }

            res.status(500);
            res.json(internalErr);
        });
};

HandlerStarLookupAddress_GET = (req, res) => {
    let address = req.params.address;
    if (!address) {
        res.status(400);
        res.json(paramErr);
        return;
    }

    // remove the starting :
    address = address.substring(1);

    blockchain.getBlockStarAddress(address)
        .then((block) => {
            res.status(200);
            res.json(block);
        })
        .catch( (err)=> {
            // tell user that address cant be found
            if (err === myChain.errAddrNotFound) {
                res.status(409);
                res.json(err);
                return;
            }

            res.status(500);
            res.json(internalErr);
        });
};

module.exports = {
    HandlerBlock_GET: HandlerBlock_GET,
    HandlerBlock_POST: HandlerBlock_POST,
    HandlerValidationRequest_POST: HandlerValidationRequest_POST,
    HandlerValidateSignature_POST: HandlerValidateSignature_POST,
    HandlerStarBlock_POST: HandlerStarBlock_POST,
    HandlerStarLookupHash_GET: HandlerStarLookupHash_GET,
    HandlerStarLookupAddress_GET: HandlerStarLookupAddress_GET
};

// when address has been validated, should validation window reset?
// when submitting star, can a user submit unlimited number of stars after being validated?
// should the validation window be checked when user submit the star?