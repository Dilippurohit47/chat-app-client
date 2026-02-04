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



// get key from indexed db
export const getkeyFromIndexedDb = async () =>{
 return new Promise<string | null>((resolve, reject) => {
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
    
        resolve(null);
      };
      tx.onerror = (err) => reject(err);
    };

    request.onerror = (err) => reject(err);
  });
}