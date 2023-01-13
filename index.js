require('dotenv').config()
const express = require('express');
const { ethers } = require('ethers');
const abi = require('./abi.json');
const erc20Abi = require('./erc20.json');
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


const port = 3000;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const RPC_URL = process.env.RPC_URL;
const AGGREGATOR_ADDRESS = process.env.AGGREGATOR_ADDRESS;
const WETH = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
const USDC = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
const DAI = '0x6B175474E89094C44Da98b954EedeAC495271d0F';

const routerInterface = new ethers.utils.Interface([
    'function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) returns (uint[] memory amounts)',
    'function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) returns (uint[] memory amounts)'
]);

const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
const signer = new ethers.Wallet(PRIVATE_KEY, provider);
// signer.connect(provider);
const contract = new ethers.Contract(AGGREGATOR_ADDRESS, abi, signer);

// provider.getBalance(signer.address).then(console.log)


app.get('/balances/:address', async (req, res) => {
    const { address } = req.params;
    const usdc = new ethers.Contract(USDC, erc20Abi, provider);
    const dai = new ethers.Contract(DAI, erc20Abi, provider);
    const balances = await Promise.all([usdc.balanceOf(address), dai.balanceOf(address)]);
    res.send({usdc: balances[0].toString(), dai: balances[1].toString()})
})


app.post('/', async (req, res) => {
  const { receiver, totalAmount } = req.body;

  if(!ethers.utils.isAddress(receiver) ||
      ethers.constants.AddressZero === receiver) {
    res.statusMessage = 'Invalid Receiver Address';
    res.status(400).end();
  }

  const val = ethers.utils.parseEther(totalAmount.toString());
  const deadline = Math.ceil(Number(new Date() / 1000)) + 10 * 60;

  const encoded1 = routerInterface.encodeFunctionData("swapExactETHForTokens", [
    0,
    [WETH, USDC],
    receiver,
    deadline
  ]);
  const encoded2 = routerInterface.encodeFunctionData("swapExactETHForTokens", [
    0,
    [WETH, DAI],
    receiver,
    deadline
  ]);
  console.log('encoded1', encoded1)
  console.log('encoded2', encoded2)
  contract.execute([encoded1, encoded2], {value: val, from: signer.address})
    .then((resp) => {
        console.log('resp', resp);
        resp.wait()
            .then((waitResp) => res.send(waitResp))
    })
    .catch((e) => {
        console.log('error in transaction', e);
        res.statusMessage = 'Error in Transaction';
        res.status(400).end();
    } );
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});