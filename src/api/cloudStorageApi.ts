import {axios} from "../apiClient";
export async function fetchPresignedUrl(): Promise<string> {
  const res = await axios.post(`/aws/get-presigned-url-s3-media`);
  if (res.status !== 200 || !res.data?.url) {
    throw new Error("Failed to fetch presigned url");
  }

  return res.data.url;
}