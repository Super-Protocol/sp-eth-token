# Useful commands

### Test

```sh
$ npx hardhat test
```

### Deploy

```sh
$ cp receivers.example.json receivers.json
# Update receivers.json with actual addresses
$ npx hardhat deploy --receivers receivers.json --network ethereum
```

## Verify

```sh
$ npx hardhat verify --contract contracts/SuperproToken.sol --constructor-args receivers.json --network ethereum <contract address>
```
