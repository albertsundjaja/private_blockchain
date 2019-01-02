const myChain = require('./simpleChain');

let blockChain = new myChain.Blockchain();

// create 10 test blocks
(function theLoop (i) {
    setTimeout(function () {
        let blockTest = new myChain.Block("Test Block - " + (i + 1));
        blockChain.addBlock(blockTest).then((result) => {
            console.log(result);
            i++;
            if (i < 10) theLoop(i);
        });
    }, 5000);
})(0);

