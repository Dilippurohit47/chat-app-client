import { useEffect, useState } from "react";

export  function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
 
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // cleanup on unmount
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}



//save keys in indexed db 
export const savePrivateKeyToIndexedDB = async (privateKey: string) => {
  return new Promise<void>((resolve, reject) => {
    const request = indexedDB.open("E2EE_DB", 1);

    request.onupgradeneeded = (event) => {
      const db = request.result;
      if (!db.objectStoreNames.contains("keys")) {
        db.createObjectStore("keys", { keyPath: "id" });
      }
    };

    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction("keys", "readwrite");
      const store = tx.objectStore("keys");

      store.put({ id: "privateKey", value: privateKey });

      tx.oncomplete = () => {
        db.close();96

        resolve();
      };
      tx.onerror = (err) => reject(err);
    };

    request.onerror = (err) => reject(err);
  });
};




export const getkeyFromIndexedDb = async () =>{
 return new Promise<void>((resolve, reject) => {
    const request = indexedDB.open("E2EE_DB", 1);

    request.onupgradeneeded = (event) => {
      const db = request.result;
      if (!db.objectStoreNames.contains("keys")) {
        db.createObjectStore("keys", { keyPath: "id" });
      }
    };

    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction("keys", "readwrite");
      const store = tx.objectStore("keys");

   const getReq = store.get("privateKey")

   getReq.onsuccess = () =>{
    const result = getReq.result
      resolve(result ? result.value : null); 
   }

      tx.oncomplete = () => {
        db.close();
        
        resolve();
      };
      tx.onerror = (err) => reject(err);
    };

    request.onerror = (err) => reject(err);
  });
}










export async function importPrivateKey(pem: string): Promise<CryptoKey> {
  const pemHeader = "-----BEGIN PRIVATE KEY-----";
  const pemFooter = "-----END PRIVATE KEY-----";
  const pemContents = pem
    .replace(pemHeader, "")
    .replace(pemFooter, "")
    .replace(/\s/g, "");

  const binaryDer = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0));

  return window.crypto.subtle.importKey(
    "pkcs8", // format for private keys
    binaryDer.buffer,
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    true,
    ["decrypt"] // only decrypt allowed
  );
}




// convert string public key into crypto public key
  export async function importPublicKey(pem: string): Promise<CryptoKey> {
  // Remove header/footer and newlines if present
  const pemHeader = "-----BEGIN PUBLIC KEY-----";
  const pemFooter = "-----END PUBLIC KEY-----";
  const pemContents = pem
    .replace(pemHeader, "")
    .replace(pemFooter, "")
    .replace(/\s/g, "");

  const binaryDer = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0));

  return window.crypto.subtle.importKey(
    "spki", // public key format
    binaryDer.buffer,
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    true,
    ["encrypt"]
  );
}








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
  console.log(error)
 }
}