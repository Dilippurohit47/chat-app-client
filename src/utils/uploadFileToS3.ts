import axios from "axios";
import { fetchPresignedUrl } from "../api/cloudStorageApi";

export async function uploadFileToS3(file: File): Promise<string> {
  const signedUrl = await fetchPresignedUrl();

  await axios.put(signedUrl, file, {
    headers: { "Content-Type": file.type },
  });

  return signedUrl.split("?")[0];
}
 