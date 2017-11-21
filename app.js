var aes = require('aes-js');

window.onload = () => {

    console.log(web3);

    //output from solc compiler. it includes the contract address, the ABI, and the compiled bytecode
    let contractInfoJson = '{"address":"0xe78a0f7e598cc8b0bb87894b0f60dd2a88d6a8ab","abi":[{"constant":false,"inputs":[{"name":"_blob","type":"string"}],"name":"set","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"get","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"}],"bytecode":"6060604052341561000f57600080fd5b60018054600160a060020a03191633600160a060020a0316179055610322806100396000396000f30060606040526004361061004b5763ffffffff7c01000000000000000000000000000000000000000000000000000000006000350416634ed3885e81146100505780636d4ce63c146100a3575b600080fd5b341561005b57600080fd5b6100a160046024813581810190830135806020601f8201819004810201604051908101604052818152929190602084018383808284375094965061012d95505050505050565b005b34156100ae57600080fd5b6100b6610167565b60405160208082528190810183818151815260200191508051906020019080838360005b838110156100f25780820151838201526020016100da565b50505050905090810190601f16801561011f5780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b73ffffffffffffffffffffffffffffffffffffffff3316600090815260208190526040902081805161016392916020019061024c565b5050565b61016f6102ca565b6000803373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000208054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156102415780601f1061021657610100808354040283529160200191610241565b820191906000526020600020905b81548152906001019060200180831161022457829003601f168201915b505050505090505b90565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f1061028d57805160ff19168380011785556102ba565b828001600101855582156102ba579182015b828111156102ba57825182559160200191906001019061029f565b506102c69291506102dc565b5090565b60206040519081016040526000815290565b61024991905b808211156102c657600081556001016102e25600a165627a7a72305820cb70b62979c18eea0bb069955ca44ddcdb7856f99ede02c65b92e1c1f97a96d80029"}';

    let contractInfo = JSON.parse(contractInfoJson);

    let Contract = web3.eth.contract(contractInfo.abi);

    window.ContractInst = Contract.at(contractInfo.address);

    setTimeout(() => {
        //console.log(window.ContractInst);
        //loadPasswords();
    }, 200);
}

addPassword = () => {
    let c = window.ContractInst;

    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;

    let passwordA = [];
    c.get((err, result) => {
        console.log(err, result);
        if (!err) {
            let passwordA = [];

            try {
                passwordA = JSON.parse(result);
            }
            catch (e) { }

            passwordA.push([username, password]);

            let payload = JSON.stringify(passwordA);
            //todo, encryption goes here
            //todo, compression

            c.set(payload, (err1, result1) => {
                //cool, we did it mostly. now just mash the 'load passwords' button
                //todo, add a 'password added' event so that we can load it automatically
            });
        }
    });
}

loadPasswords = () => {
    let c = window.ContractInst;

    c.get((err, result) => {
        console.log(err, result);
        if (!err) {
            let passwordA = null;
            try {
                //todo, decryption goes here
                passwordA = JSON.parse(result);
            } catch (err) {
                passwordA = [];
            }

            console.log(passwordA);
            renderPasswords(passwordA);
        }
    });
}

//passwordA should be in the form of:
//[['username', 'password'], ...]
renderPasswords = (passwordA) => {

    let passwordsE = document.getElementById('passwords');
    while(passwordsE.firstChild) {
        passwordsE.removeChild(passwordsE.firstChild);
    }

    for(let i = 0; i < passwordA.length; i++) {
        let li = document.createElement('li');
        li.innerHTML = passwordA[i][0] + ' ' + passwordA[i][1];
        
        passwordsE.appendChild(li);
    }
}

encryptData = (utf8_text) => {
    return new Promise((resolve, reject) => {
        let utf8key = 'Authorize metamask to encrypt/decrypt password. Click sign.';
        web3.personal.sign(web3.fromUtf8(utf8key), web3.eth.accounts[0], (e, r) => {

            if (e) {
                reject(e);
                return;
            }

            let pk = r.substring(2, 34);

            let keyBytes =  aes.utils.utf8.toBytes(pk);
            let textBytes = aes.utils.utf8.toBytes(utf8_text);

            let aesCtr = new aes.ModeOfOperation.ctr(keyBytes);
            let encryptedBytes = aesCtr.encrypt(textBytes);

            let encryptedHex = aes.utils.hex.fromBytes(encryptedBytes);
            resolve(encryptedHex);
        });
    });
}

decryptData = (encryptedHex) => {
    return new Promise((resolve, reject) => {
        let utf8key = 'Authorize metamask to encrypt/decrypt password. Click sign.';
        web3.personal.sign(web3.fromUtf8(utf8key), web3.eth.accounts[0], (e, r) => {

            if (e) {
                reject(e);
                return;
            }

            let pk = r.substring(2, 34);
            let keyBytes = aes.utils.utf8.toBytes(pk);

            let encryptedBytes = aes.utils.hex.toBytes(encryptedHex);
            aesCtr = new aes.ModeOfOperation.ctr(keyBytes);
            let decryptedBytes = aesCtr.decrypt(encryptedBytes);
            let decryptedText = aes.utils.utf8.fromBytes(decryptedBytes);

            resolve(decryptedText);
        });
    });
}
