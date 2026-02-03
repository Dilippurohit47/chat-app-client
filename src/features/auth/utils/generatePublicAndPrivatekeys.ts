import { keyPair } from "../types";

 export const generateKeys =  async():Promise<keyPair> =>{
    try {
      const keyPair = await window.crypto.subtle.generateKey(
  {
    name: "RSA-OAEP",
    modulusLength: 4096,
    publicExponent: new Uint8Array([1, 0, 1]), 
    hash: "SHA-256", 
  },
  true, 
  ["encrypt", "decrypt"]
);

const publicKeyExported = await crypto.subtle.exportKey("spki", keyPair.publicKey);
const privateKeyExported = await crypto.subtle.exportKey("pkcs8", keyPair.privateKey);

const publicKeyString = btoa(String.fromCharCode(...new Uint8Array(publicKeyExported)));
const privateKeyString = btoa(String.fromCharCode(...new Uint8Array(privateKeyExported)));

return {publicKey:publicKeyString  , privateKey : privateKeyString}

    } catch (error) {
      console.log("error in generating private public keys ",error)
      throw error
    }
  }