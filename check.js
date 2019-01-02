const myChain = require('./simpleChain');

let blockChain = new myChain.Blockchain();

function test1() {
    // check last block height
    blockChain.getBlockHeight().then((result) => {
        console.log("----- checking block height -----");
        console.log("** Block height: " + result);
        test2()
    }).catch((err) => {
        console.log(err);
    });

}

function test2() {
    // check block with height 5 for validity
    blockChain.validateBlock(5).then((result) => {
        console.log("----- checking block 5 validity -----");
        console.log("** Block with height 5 valid: " + result);
        test3()
    }).catch((err) => {
        console.log(err);
    });
}

function test3() {
    // check chain validity
    blockChain.validateChain().then((result) => {
        console.log("----- checking blockchain validity -----");
        console.log("** Blockchain valid: " + result);
        test4();
    }).catch((err) => {
        console.log(err);
    });
}

function test4() {
// check by invalidating block 5
    console.log("----- invalidating block 5 for checking -----");
// store block 5 to restore it back later
    let blockTemp;
    blockChain.getBlock(5).then((block) => {
        blockTemp = block;
        // modify block with height 5 to invalidate it
        let fakeBlock = new myChain.Block("fake block");
        fakeBlock.height = 5;
        blockChain.updateBlock(5, fakeBlock).then((res) => {
            // check block with height 5 for validity
            blockChain.validateBlock(5).then((result) => {
                console.log("** After invalidation, Block with height 5 valid: " + result);
                // check chain validity
                blockChain.validateChain().then((result) => {
                    console.log("** After invalidation, Blockchain valid: " + result);
                    // restore block 5
                    blockChain.updateBlock(5, blockTemp);
                    console.log("----- restoring back block 5 -----")
                }).catch((err) => {
                    console.log(err);
                });
            }).catch((err) => {
                console.log(err);
            });
        });
    }).catch((err) => {
        console.log(err);
    });
}

// run all the test in sequence
test1();


