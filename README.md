# Useful commands

### Test

```sh
$ npx hardhat test --show-stack-traces
```

### Deploy

```sh
$ cp receivers.example.json receivers.json
# Update receivers.json with actual addresses
$ npx hardhat deploy --receivers receivers.json --network ethereum
```

## Contract Verification

```sh
$ cp constructor-args.json.template args.json
# Update args.json with actual addresses
$ npx hardhat verify --contract contracts/SuperProtocol.sol:SuperProtocol --network ethereum --constructor-args args.json <contract address>
```
