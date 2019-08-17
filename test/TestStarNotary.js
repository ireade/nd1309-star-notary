const StarNotary = artifacts.require("StarNotary");

let accounts;
let owner;
let instance;

contract('StarNotary', (accs) => {
    accounts = accs;
    owner = accounts[0];
});

beforeEach(async () => {
    instance = await StarNotary.deployed();
});

it('can Create a Star', async() => {
    let tokenId = 1;
    await instance.createStar('Awesome Star!', tokenId, {from: accounts[0]});
    const star = await instance.tokenIdToStarInfo.call(tokenId);
    assert.equal(star, 'Awesome Star!')
});

it('lets user1 put up their star for sale', async() => {
    let user1 = accounts[1];
    let starId = 2;
    let starPrice = web3.utils.toWei(".01", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it('lets user1 get the funds after the sale', async() => {
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 3;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
    await instance.buyStar(starId, {from: user2, value: balance});
    let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
    let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
    let value2 = Number(balanceOfUser1AfterTransaction);
    assert.equal(value1, value2);
});

it('lets user2 buy a star, if it is put up for sale', async() => {
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 4;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance});
    assert.equal(await instance.ownerOf.call(starId), user2);
});

it('lets user2 buy a star and decreases its balance in ether', async() => {
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 5;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance, gasPrice:0});
    const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
    let value = Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
    assert.equal(value, starPrice);
});


it('can add the star name and star symbol properly', async() => {
    const name = "IreStars";
    const symbol = "IST";

    assert.equal(await instance.name.call(), name);
    assert.equal(await instance.symbol.call(), symbol);
});


it('lets 2 users exchange stars', async() => {
    const owner1 = accounts[0];
    const owner2 = accounts[1];

    const star1Id = 21;
    const star2Id = 22;

    await instance.createStar('Star 1', star1Id, {from: owner1});
    await instance.createStar('Star 2', star2Id, {from: owner2});

    await instance.exchangeStars(star1Id, star2Id, { from: owner1 });

    assert.equal(await instance.ownerOf(star1Id), owner2);
    assert.equal(await instance.ownerOf(star2Id), owner1);
});


it('lets a user transfer a star', async() => {
    const owner1 = accounts[3];
    const owner2 = accounts[4];

    const starId = 24;

    await instance.createStar('Star 1', starId, { from: owner1 });

    await instance.transferStar(owner2, starId, { from: owner1 });

    assert.equal(await instance.ownerOf(starId), owner2);
});


it('lookUptokenIdToStarInfo test', async() => {
    const tokenId = 25;
    const newStarName = "Ire Star!";

    await instance.createStar(newStarName, tokenId, {from: accounts[0]});

    assert.equal(await instance.lookUptokenIdToStarInfo(tokenId), newStarName);
});
