import axios from "axios";


interface sendedFileType {
  imageId: string;
  file: File;
  url: string;
}
export const uploadMediaToS3 = async (file: sendedFileType): Promise<string> => {
  const res = await axios.post(
    `${import.meta.env.VITE_BASE_URL_HTTP}/aws/get-presigned-url-s3-media`,
    {},
    { withCredentials: true }
  );

  if (res.status !== 200) {
    throw new Error("Failed to get presigned url");
  }

  const signedInUrl = res.data.url;
  if (!signedInUrl) {
    throw new Error("Presigned url missing");
  }

  await axios.put(signedInUrl, file.file, {
    headers: { "Content-Type": file.file.type },
  });

  return signedInUrl.split("?")[0]; // ✅ return final usable url
};
