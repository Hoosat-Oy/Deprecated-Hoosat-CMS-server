import { stat, appendFile, rm } from 'node:fs/promises';

export const rateLimitByIP = async (ip: string | string[] | undefined, rateInMillis: number): Promise<Boolean> => {
  if(ip === undefined) {
    return false;
  }
  if(Array.isArray(ip) === true) {
    return false;
  }
  const filepath = `/tmp/${ip}`;
  const stats = await stat(filepath);
  if(stats.isFile() === true) {
    const diffInMillis = Math.floor(Date.now() - stats.atimeMs);
    if(diffInMillis > rateInMillis) {
      await rm(filepath);
      await appendFile(filepath, "API rate limit file for the IP");
      return true;
    }
  } else {
    const file = await appendFile(filepath, "API rate limit file for the IP");
    return true;
  }
  return false;
} 