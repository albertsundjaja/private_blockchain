/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|  =========================================================*/

const SHA256 = require('crypto-js/sha256');
const level = require('level');
const chainDB = './chaindata';
const db = level(chainDB);


/* ===== Block Class ==============================
|  Class with a constructor for block 			   |
|  ===============================================*/

class Block {
    constructor(data) {
        this.hash = "",
            this.height = 0,
            this.body = data,
            this.time = 0,
            this.previousBlockHash = ""
    }
}

/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/


class Blockchain {
    constructor() {
        // check if genesis block has been created, if not create one
        checkForGenBlock();
    }

    // Add new block
    addBlock(newBlock) {
        const self = this;

        return new Promise((resolve, reject) => {
            // UTC timestamp
            newBlock.time = new Date().getTime().toString().slice(0, -3);
            // Block height
            self.getBlockHeight().then((height) => {
                newBlock.height = height + 1;
                // get prev block hash
                self.getBlock(newBlock.height - 1).then((block) => {
                    newBlock.previousBlockHash = block.hash;
                    // Block hash with SHA256 using newBlock and converting to a string
                    newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
                    // save block to level db
                    addLevelDBData(newBlock.height, newBlock);
                    resolve(("Block height %s has been added").replace("%s", newBlock.height));
                }).catch((err) => {
                    console.log("error getting block", err);
                    reject("Adding block failed");
                });
            }).catch((err) => {
                console.log("error getting block height", err);
                reject("Adding block failed");
            });
        });

    }

    // Get block height
    getBlockHeight() {
        let i = 0;
        return new Promise((resolve, reject) => {
            db.createReadStream().on('data', (data) => {
                i++;
            }).on('error', (err) => {
                reject(err);
            }).on('close', () => {
                resolve(i - 1);
            })
        });
    }

    // get block
    getBlock(blockHeight) {
        return new Promise((resolve, reject) => {
            db.get(blockHeight, (err, val) => {
                if (err) {
                    if (err.notFound) {
                        reject(err);
                    } else {
                        reject(err);
                    }
                } else {
                    resolve(JSON.parse(val));
                }
            })
        });
    }

    // validate block
    validateBlock(blockHeight) {
        const self = this;
        return new Promise((resolve, reject) => {
            self.getBlock(blockHeight).then((block) => {
                // get block hash
                let blockHash = block.hash;
                // remove block hash to test block integrity
                block.hash = '';
                // generate block hash
                let validBlockHash = SHA256(JSON.stringify(block)).toString();
                // Compare
                if (blockHash === validBlockHash) {
                    resolve(true);
                } else {
                    console.log('Block #' + blockHeight + ' invalid hash:\n' + blockHash + '<>' + validBlockHash);
                    resolve(false);
                }
            }).catch((err) => {
                reject(err);
            });
        });
    }

    // Validate blockchain
    validateChain() {
        const self = this;
        let promises = [];
        let i = 0;
        return new Promise((resolve, reject) => {
            db.createReadStream().on('data', (data) => {
                let block = JSON.parse(data.value);
                // generate promise to validate for each block
                promises.push(new Promise((resolve, reject) => {
                    self.validateBlock(block.height).then((result) => {
                        // skip checking prev hash for genesis block
                        if (block.height !== 0 && result === true) {
                            let currentBlock = self.getBlock(block.height);
                            let prevBlock = self.getBlock(block.height - 1);
                            if (currentBlock.previousBlockHash === prevBlock.hash) {
                                resolve(true)
                            } else {
                                resolve(false)
                            }
                        }
                        // for genesis block, we only care for its hash which is returned by validateBlock
                        resolve(result)
                    }).catch((err) => {
                        console.log("error validate blok", err);
                        reject(err);
                    })
                }));
            }).on('error', (err) => {
                console.log('error', err);
                reject(err);
            }).on('close', () => {
                Promise.all(promises).then((results) => {
                    // check if all promises return true
                    if (results.every(v => v === true)) {
                        resolve(true)
                    } else {
                        resolve(false)
                    }
                }).catch((err) => {
                    reject(err);
                    console.log(err)
                })
            });
        })
    }

    // method to update block value for testing purpose
    updateBlock(blockHeight, value) {
        return new Promise((resolve,reject) =>{
            db.put(blockHeight, JSON.stringify(value), function (err) {
                if (err) {
                    console.log('Block update failed', err);
                    reject(err);
                } else {
                    resolve("success");
                }
            });
        });

    }
}

/* ===== Helpers ==========================
|  helper functions                     		|
|  ================================================*/

function createGenesisBlock() {
    let genBlock = new Block("First block in the chain - Genesis block");
    genBlock.time = new Date().getTime().toString().slice(0, -3);
    genBlock.hash = SHA256(JSON.stringify(genBlock)).toString();
    addLevelDBData(0, genBlock);
}

function checkForGenBlock() {
    let i = 0;
    db.createReadStream().on('data', (data) => {
        i++;
    }).on('error', (err) => {
        console.log(err);
    }).on('close', () => {
        if (i === 0) createGenesisBlock();
    })
}

function addLevelDBData(key, value) {
    return new Promise((resolve, reject) => {
        db.put(key, JSON.stringify(value), function (err) {
            if (err) {
                console.log('Block ' + key + ' submission failed', err);
                reject(err);
            }
        });
    })
}

module.exports = {
    Block: Block,
    Blockchain: Blockchain
};