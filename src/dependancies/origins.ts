import express from 'express';
import originSchema from '../schemas/originSchema';


const getOrigins = async (): Promise<string[]> => {
  const dbOrigins = (await originSchema.find({}).exec()).map((origin) => {
    return origin.address;
  });
  if(dbOrigins.length > 0) {
    return dbOrigins;
  } else if((process.env.ORIGINS !== undefined) && Array.isArray(process.env.ORIGINS) && process.env.ORIGINS.length > 0) {
    return process.env.ORIGINS;
  } else {
    return ["http://localhost:3000"]
  }
}

export {
  getOrigins
}