
### Steps
1. **start hardhat project**
2. **run forked node according to instructions given in Readme of that project**
3. **deploy the Aggregator Contract according to instructions given in Readme of that project**
4. **replace the PRIVATE_KEY in .env if need**
5. **replace the AGGREGATOR_ADDRESS in .env**
6. **send request to the following APIs according to your need**


## Post API for Aggregator

```
curl -X POST http://localhost:3000/ -d '{"receiver":"0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc", "totalAmount": 10}' -H "Content-Type: application/json"
```

## API to get balances

```
curl -X GET http://localhost:3000/balances/0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc
```
