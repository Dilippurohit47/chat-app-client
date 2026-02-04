// auth/crypto/encryptMessage.ts
import { importPublicKey } from "./importPublicKey";

export async function encryptMessage(
{  text,
  publicKeyPem
}:{text:string , publicKeyPem:string}): Promise<string> {
  const data = new TextEncoder().encode(text);
  const cryptoKey = await importPublicKey(publicKeyPem);

  const encrypted = await crypto.subtle.encrypt(
    { name: "RSA-OAEP" },
    cryptoKey,
    data
  );

  return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
}
