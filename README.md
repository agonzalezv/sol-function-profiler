# Solidity Function Profiler

A command line tool that generates a human readable report with contract information. This is useful during manual code review to understand what functions are made public, use which modifiers, and so on.

This version ditches the now deprecated [ConsenSys Solidity Parser](https://github.com/ConsenSys/solidity-parser) in favor of [solidity-parser-antlr](https://github.com/federicobond/solidity-parser-antlr).

Usage Example:

```
$ npm install
...

$ chmod +x cli.js

$ ./cli.js ~/contracts/mytoken.sol

You can also give a directory as an argument using the --dir flag, this will generate a report on all files ending in .sol the directory or its subdirectories.

$ ./cli.js --dir ~/contracts

```
This will produce a `.md` file on the `output` folder, for every contract scanned. e.g:

`~/output/myToken.sol.md` will have:

```

.------------------------------------------.
| pragma solidity 0.10.99 contract MyToken |
|------------------------------------------|
| ~/contracts/mytoken.sol                  |
'------------------------------------------'
.-----------------------------.
|         imports             |
|-----------------------------|
| ../import/FancyContract.sol |
'-----------------------------'
.----------------------------------------------------------------------.
|                              functions                               |
|----------------------------------------------------------------------|
|                name                | visibility | return | modifiers |
|------------------------------------|------------|--------|-----------|
| constructor(_param) payable        | public     |        |           |
| otherFunction(_param, _otherParam) | external   | bool   | onlyOwner |
| fancyPants(_pants)                 | external   |        | onlyOwner |
'----------------------------------------------------------------------'
.--------------.
|  modifiers   |
|--------------|
| onlyOwner()  |
'--------------'
.-------------------------------------.
|               events                |
|-------------------------------------|
| MySpecialEvent(_param)              |
'-------------------------------------'

```

multiple dir feature based on [this repo](https://github.com/maurelian/sol-function-profiler)
