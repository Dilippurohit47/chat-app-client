import { decryptMessage, getkeyFromIndexedDb, importPrivateKey } from "../../../lib/helper";
import { selectedChatType } from "../types";



export const useChatDecryption = ()=>{
  
    const chatDecrypter = async(chats:selectedChatType[],logedInUserId:string)=>{


                 const privateKeyString = await getkeyFromIndexedDb();
                  const privateKeyCrypto = await importPrivateKey(privateKeyString!);
        
                  const decryptedChats = (
                    await Promise.all(
                      chats.map(async (user) => {
                        if (user.senderId === logedInUserId) {
                          const decryptedMessage = await decryptMessage(
                            user.lastMessageForSender,
                            privateKeyCrypto
                          );
        
        
                          user.lastMessage = decryptedMessage || "";
                          return user;
                        } else {
                          if (privateKeyCrypto) {
                            const decryptedMessage = await decryptMessage(
                              user.lastMessageForReceiver,
                              privateKeyCrypto
                            );
        
                            user.lastMessage = decryptedMessage || "";
                            return user;
                          }
                        }
                      })
                    )
                  ).filter((chat) => chat !== undefined);

                  return decryptedChats
                }

    return {
chatDecrypter
    }
    
}