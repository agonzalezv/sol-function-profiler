# (WIP) Solidity Function Profiler

A command line tool that generates a human-consumable report listing a contract's functions. This is useful during manual code review to understand what functions are made public, use which modifiers, and so on.

This version ditches the now deprecated [ConsenSys Solidity Parser](https://github.com/ConsenSys/solidity-parser) in favor of [solidity-parser-antlr](https://github.com/federicobond/solidity-parser-antlr).

Usage Example:

```
$ npm install
...

$ chmod +x cli.js

$ ./cli.js ~/contracts/mytoken.sol

You can also give a directory as an argument using the --dir flag, this will generate a report on all files ending in .sol the directory or its subdirectories.

$ ./cli.js --dir ~/contracts

.--------------------------------------------------------------------------------------------------------.
|                                        ~/contracts/mytoken.sol                                         |
|--------------------------------------------------------------------------------------------------------|
|   Contract    |           Function            | Visibility | Constant |  Returns  |     Modifiers      |
|---------------|-------------------------------|------------|----------|-----------|--------------------|
| MyToken       | ()                            | public     | false    |           | payable            |
| MyToken       | initTokenHolder(address,uint) | public     | false    |           | onlyOwner          |
| MyToken       | balance(address)              | public     | true     | uint      |                    |
| MyToken       | transferAll(address,address)  | external   | false    |           | onlyTokenHolder    |
| MyToken       | kill()                        | internal   | false    |           |                    |
'--------------------------------------------------------------------------------------------------------'
```

multiple dir support based on [this repo](https://github.com/maurelian/sol-function-profiler)
