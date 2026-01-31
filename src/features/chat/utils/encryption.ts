import { importPublicKey } from "../../../lib/helper";


// it will encrypt the message which the reciver will see
interface encryptReceiverMsgTypes {
    text:string,
    publickey:string   //receiver public key
}
export const getReceiverMessage = async({text , publickey}:encryptReceiverMsgTypes) =>{
  try {
       const encoder = new TextEncoder();
const data = encoder.encode(text);
const receiverCryptoKey = await importPublicKey(publickey);
const encrypted = await window.crypto.subtle.encrypt(
  {
    name: "RSA-OAEP",
  },
  receiverCryptoKey, 
  data
);

const  receiverContent = btoa(
  String.fromCharCode(...new Uint8Array(encrypted))

);
return receiverContent
  } catch (error) {
    console.log(error)
  }
}


// it will encrypt the message which the sender  will see after fetching
interface encryptSenderMsgTypes {
    text:string,
    publickey:string   //sender public key
}

export const getSenderMessage = async({text , publickey}:encryptSenderMsgTypes) =>{
  try {
       const encoder = new TextEncoder();
const data = encoder.encode(text);
const receiverCryptoKey = await importPublicKey(publickey);
const encrypted = await window.crypto.subtle.encrypt(
  {
    name: "RSA-OAEP",
  },
  receiverCryptoKey, 
  data
);

const  senderContent = btoa(
  String.fromCharCode(...new Uint8Array(encrypted))

);
return senderContent
  } catch (error) {
    console.log(error)
    
  }
}