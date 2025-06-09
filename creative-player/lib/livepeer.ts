import { Livepeer } from "@livepeer/ai";

export const livepeer = new Livepeer({
  httpBearer: `Bearer ${process.env.LIVEPEER_API_KEY}`,
});
