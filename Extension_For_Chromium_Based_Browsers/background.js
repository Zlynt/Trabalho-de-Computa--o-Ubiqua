const storage = {
    loadData: async () => {
        return await new Promise((resolve, reject) => {
            chrome.storage.local.get(['keys'], function(result) {
                resolve(result);
            });
        })
        
    },
    saveData: async (data) => {
        return await new Promise((resolve, reject) => {
            chrome.storage.local.set({keys: data}, function() {
                resolve(true);
            });
        });
    }
}

//Crypto Keys API
const crypto_functions = {
    //Is key created and saved on the internal storage?
    isKeyCreated: async () => {
        return (await storage.loadData()) !== "{}";
    },
    //Create new keys
    generateKeyPair: async () => {
        let keys = await window.crypto.subtle.generateKey(
            {
                name: "ECDSA",
                namedCurve: "P-256", //can be "P-256", "P-384", or "P-521"
            },
            true, //whether the key is extractable (i.e. can be used in exportKey)
            ["sign", "verify"] //can be any combination of "sign" and "verify"
        );
        let extracted_keys = {
            public: await window.crypto.subtle.exportKey(
                        "jwk", //can be "jwk" (public or private), "spki" (public only), or "pkcs8" (private only)
                        keys.publicKey //can be a publicKey or privateKey, as long as extractable was true
                    ),
            private: await window.crypto.subtle.exportKey(
                        "jwk", //can be "jwk" (public or private), "spki" (public only), or "pkcs8" (private only)
                        keys.privateKey //can be a publicKey or privateKey, as long as extractable was true
                    ),
        };
        await storage.saveData(extracted_keys);
        console.log("[NCAS] New Keys Generated!");
        console.log(JSON.stringify(await storage.loadData()));
        return extracted_keys;
    },
    getPublicExtractedKey: async () => {
        if(!(await crypto_functions.isKeyCreated()))
            return false;
        if((await storage.loadData()).keys === undefined)
            await crypto_functions.generateKeyPair();
        return (await storage.loadData()).keys.public;
    },
    getPrivateExtractedKey: async () => {
        if(!(await crypto_functions.isKeyCreated()))
            return false;
        return (await storage.loadData()).keys.private;
    },
    //Load Extracted Keys From a File
    loadExtractedKeysFromFile: async () => {
        if(!(await isKeyCreated()))
            return false;
        
        /*
            IT NEEDS THE CODE TO GET A FILE HERE
        */
    },
    signData: async (data) => {
        if( !(await crypto_functions.isKeyCreated()) ){
            alert("Create or load an Identity first!");
            return false;
        }
        var enc = new TextEncoder(); // always utf-8
        let stores_privateKey = await crypto_functions.getPrivateExtractedKey();
        let privateKey =        await window.crypto.subtle.importKey(
            "jwk", //can be "jwk" (public or private), "spki" (public only), or "pkcs8" (private only)
            stores_privateKey,
            {   //these are the algorithm options
                name: "ECDSA",
                namedCurve: stores_privateKey.crv, //can be "P-256", "P-384", or "P-521"
            },
            false, //whether the key is extractable (i.e. can be used in exportKey)
            ["sign"] //"verify" for public key import, "sign" for private key imports
        );

        return new Uint8Array(await window.crypto.subtle.sign(
            {
                name: "ECDSA",
                hash: {name: "SHA-256"}, //can be "SHA-1", "SHA-256", "SHA-384", or "SHA-512"
            },
            privateKey, //from generateKey or importKey above
            enc.encode(data) //ArrayBuffer of data you want to sign
        ));
    },
    verifySignature: async (data, signature) => {
        let keys = await storage.loadData();
        var enc = new TextEncoder(); // always utf-8
        
        let stores_publicKey = await crypto_functions.getPublicExtractedKey();
        let publicKey =        await window.crypto.subtle.importKey(
            "jwk", //can be "jwk" (public or private), "spki" (public only), or "pkcs8" (private only)
            stores_publicKey,
            {   //these are the algorithm options
                name: "ECDSA",
                namedCurve: stores_publicKey.crv, //can be "P-256", "P-384", or "P-521"
            },
            false, //whether the key is extractable (i.e. can be used in exportKey)
            ["verify"] //"verify" for public key import, "sign" for private key imports
        );

        return await window.crypto.subtle.verify(
            {
                name: "ECDSA",
                hash: {name: "SHA-256"}, //can be "SHA-1", "SHA-256", "SHA-384", or "SHA-512"
            },
            publicKey, //from generateKey or importKey above
            signature, //ArrayBuffer of the signature
            enc.encode(data) //ArrayBuffer of the data
        );

    }
}

const startNCAS = async () => {
    //Garantee that a key is on storage
    if(await crypto_functions.isKeyCreated())
        console.log("[NCAS] User has keys saved!");
    else{
        console.log("User does not have any keys");
        await crypto_functions.generateKeyPair();
        if(await crypto_functions.isKeyCreated())
            console.log("Keys have been created for the user");
    }
    console.log("[NCAS] Finished the startup sequence.");    
}
startNCAS();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch(request){
        case "ncas_get_identity":
        const tmp4 = async () => {
            let data = await storage.loadData();
            data = JSON.stringify(data);
            let filename = "key";
            let type = "key";

            var file = new Blob([data], {type: type});
            if (window.navigator.msSaveOrOpenBlob) // IE10+
                window.navigator.msSaveOrOpenBlob(file, filename);
            else { // Others
                var a = document.createElement("a"),
                        url = URL.createObjectURL(file);
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                setTimeout(function() {
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);  
                }, 0); 
            }
        }
        tmp4();
        break;

        case "ncas_generate_new_identity":
            const tmp2 = async (sendResponse) => {
                let keyPair = await crypto_functions.generateKeyPair();
                alert("You have now a new Identity!");
                sendResponse("true");
            }
            tmp2(sendResponse);
            break;
        case "ncas_state":
            sendResponse("ok");
            break;
        case "ncas_login":
            const tmp = async (sendResponse) => {
                const timestamp = new Date().valueOf()+"";
                let publicKey = await crypto_functions.getPublicExtractedKey();
                
                let signature = await crypto_functions.signData(timestamp);
                let signature_size = signature.byteLength;

                console.log(new TextDecoder("utf-8").decode(signature));


                sendResponse(JSON.stringify({
                    data: timestamp,
                    signature: signature,
                    identity: publicKey
                }));
                };
                tmp(sendResponse);
                break;
        default:
            const tmp3 = async (sendResponse) => {
                await storage.saveData(JSON.parse(request).keys);
                console.log(JSON.stringify(await storage.loadData()));
                sendResponse("true");
            }
            tmp3(sendResponse);
            break;
    }
    return true; //Indicar que a resposta é assincrona
  });