

export async function decryptMessage(encryptedBase64: string, privateKey: CryptoKey) {

  const encryptedData = Uint8Array.from(
    atob(encryptedBase64),
    (c) => c.charCodeAt(0)
  );
 try { 

   const decrypted = await window.crypto.subtle.decrypt(
    { name: "RSA-OAEP" },
    privateKey, 
    encryptedData
  );
  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
 } catch (error) {
  console.log("error in message decryption",error)
 }
}