const HASHAlgo = require('crypto-js/sha256')
const {performance} = require('perf_hooks');

class KSRBlock{
    constructor (data, prevHash){
        this.nonce = 0;
        this.timestamp = new Date();
        this.data = data;
        this.prevHash = prevHash;
        this.hash = this.hashBlock();
    }

    hashBlock() {
        //console.log('hashing ' + JSON.stringify(this.data) + ' ' + this.nonce + ' ' + this.timestamp + ' ' + this.prevHash);
        return HASHAlgo(JSON.stringify(this.data) + this.nonce + this.timestamp + this.prevHash).toString();
    }

    mineBlock(puzzleComplexity) {
        this.hash = this.hashBlock();
        while(this.hash.substring(0, puzzleComplexity) !== '0'.repeat(puzzleComplexity)) {
            this.nonce = this.nonce + 1;
            this.hash = this.hashBlock();
        }
    }
}

class KSRBlockChain{
    constructor (){
        this.puzzleComplexity = 5;
        this.chain = [];
        this.chain.push(this.genBlockZero());
    }

    genBlockZero() {
        return new KSRBlock("Satoshi Nakomoto", "");
    }

    addNewBlock(newBlock) {
        newBlock.prevHash = this.getActiveBlock().hash;
        newBlock.mineBlock(this.puzzleComplexity);
        this.chain.push(newBlock);
    }

    getActiveBlock() {
        return this.chain[this.chain.length - 1];
    }

    validateChain() {
        for(var i = 1; i < this.chain.length; i ++) {
            if(this.chain[i].hash !== this.chain[i].hashBlock(true)) {
                return false;
            }
                
            if(this.chain[i - 1].hash !== this.chain[i].prevHash) {
                return false;
            }
        }
        return true;
    }
}

var t0 = performance.now();
var ksrBlkChn = new KSRBlockChain();
ksrBlkChn.addNewBlock(new KSRBlock({chocolates: 5}));
ksrBlkChn.addNewBlock(new KSRBlock({chocolates: 10}));
var t1 = performance.now();

console.log(JSON.stringify(ksrBlkChn, null, 1));

console.log('Chain is Valid : ' + ksrBlkChn.validateChain());

console.log("Call to Mine Blocks took " + (t1 - t0) + " milliseconds.");
