const HASHAlgo = require('crypto-js/sha256')
const {performance} = require('perf_hooks');

class KSRTransaction{
    constructor (seller, buyer, chocolates){
        this.seller = seller;
        this.buyer = buyer;
        this.chocolates = chocolates;
    }
}

class KSRBlock{
    constructor (transactions, prevHash){
        this.nonce = 0;
        this.timestamp = new Date();
        this.transactions = transactions;
        this.prevHash = prevHash;
        this.hash = this.hashBlock();
    }

    hashBlock() {
        return HASHAlgo(JSON.stringify(this.transactions) + this.nonce + this.timestamp + this.prevHash).toString();
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
        this.puzzleComplexity = 1;
        this.chain = [];
        this.chain.push(this.genBlockZero());
        this.pendingTransactions = [];
        this.reward = 1;
    }

    genBlockZero() {
        return new KSRBlock([new KSRTransaction(null, 'Vivek', 100)], "");
    }

    getActiveBlock() {
        return this.chain[this.chain.length - 1];
    }

    minePendingTransactions(minerAddress) {
        var block = new KSRBlock(this.pendingTransactions);
        block.prevHash = this.getActiveBlock().hash;
        block.mineBlock(this.puzzleComplexity);
        this.chain.push(block);
        this.pendingTransactions = [
            new KSRTransaction(null, minerAddress, this.reward)
        ];
    }

    addNewTransaction(transaction) {
        this.pendingTransactions.push(transaction);
    }

    walletBalance(walletAddreess) {
        var chocolatesInHand = 0;
        this.chain.forEach(block => {
            block.transactions.forEach(transaction => {
                if(transaction.buyer === walletAddreess)
                    chocolatesInHand += transaction.chocolates;
                if(transaction.seller === walletAddreess)
                    chocolatesInHand -= transaction.chocolates;
            });
        });
        return chocolatesInHand;
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
ksrBlkChn.addNewTransaction( {seller: 'Vivek', buyer: 'Rakesh',  chocolates: 10} );
ksrBlkChn.addNewTransaction( {seller: 'Vivek', buyer: 'Karthik',  chocolates: 5} );

ksrBlkChn.minePendingTransactions('Santosh');


var t1 = performance.now();

console.log(JSON.stringify(ksrBlkChn, null, 1));

console.log('Chain is Valid : ' + ksrBlkChn.validateChain());

console.log("Call to Mine Blocks took " + (t1 - t0) + " milliseconds.");

console.log('Balance of Vivek: ' + ksrBlkChn.walletBalance('Vivek'));
console.log('Balance of Rakesh: ' + ksrBlkChn.walletBalance('Rakesh'));
console.log('Balance of Karthik: ' + ksrBlkChn.walletBalance('Karthik'));
console.log('Balance of Santosh: ' + ksrBlkChn.walletBalance('Santosh'));
