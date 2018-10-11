pragma solidity ^0.4.11;

contract XID {
    function balanceOf(address _address) public view returns(uint);
    function transfer(address to, uint amount) public;
}

contract MediatorWallet {
    address public xidAddress;
    mapping(address => uint) public balances;
    mapping(address => uint) public lastPaymentReceived;
    uint public debt;
    address public owner;
    uint public EXPIRATION_TIME;

    constructor(address _xidAddress, uint _expiration_time) public {
        xidAddress = _xidAddress;
        owner = msg.sender;
        EXPIRATION_TIME = _expiration_time;
    }

    event Sent(address to, address from, uint amount);

    modifier onlyOwner() {
        require(owner == msg.sender, "Only owner can do it");
        _;
    }

    function replenish(address to, uint amount) public onlyOwner {
        //checking for sufficient funds
        require(contractBalance() - debt >= amount);

        balances[to] += amount;
        debt += amount;
        lastPaymentReceived[to] = now;
        emit Sent(to, owner, amount);
    }

    function updateOwner(address newOwner) public onlyOwner {
        owner = newOwner;
    }

    function updateXIDAddress(address newXIDAddress) public onlyOwner {
        xidAddress = newXIDAddress;
    }

    function contractBalance() public view returns (uint _myBalanceXID) {
        XID xidContract = XID(xidAddress);
        _myBalanceXID = xidContract.balanceOf(this);
    }

    //transferring tokens to inside original XID contract
    function withdraw(address to, uint amount) public {
        require(balances[to] >= amount);

        XID xidContract = XID(xidAddress);
        xidContract.transfer(to, amount);
        debt -= amount;
        balances[to] -= amount;
    }

    //transferring tokens inside mediator contract
    function send(address to, uint amount) public {
        require(balances[msg.sender] >= amount);
        balances[to] += amount;
        balances[msg.sender] -= amount;
        lastPaymentReceived[to] = now;
        emit Sent(to, msg.sender, amount);
    }

    //transferring tokens from unactive account inside smart contract
    function transferExpiredFrom(address from, address to, uint amount) public onlyOwner {
        require(now > lastPaymentReceived[from] + EXPIRATION_TIME);
        require(amount <= balances[from]);
        balances[to] += amount;
        balances[from] -= amount;
    }
}