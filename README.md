# Useful commands

### Test

```sh
$ npx hardhat test --show-stack-traces
```

### Deploy

```sh
$ cp receivers.example.json receivers.json
# Update args.json with actual addresses and amounts
$ npx hardhat compile
$ npx hardhat deploy --receivers args.json --network <network_name>
```

## Contract Verification

```sh
$ cp args.json.template args.json
# Update args.json with actual addresses
$ npx hardhat verify --contract contracts/SuperProtocol.sol:SuperProtocol --network <network_name> --constructor-args args.json <contract address>
```
