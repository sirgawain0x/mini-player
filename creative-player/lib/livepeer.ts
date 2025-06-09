import { Livepeer } from "@livepeer/ai";

export const livepeer = new Livepeer({
  serverIdx: 1,
  httpBearer: process.env.LIVEPEER_API_KEY as string,
});
