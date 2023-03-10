import express from 'express';
import originSchema from '../schemas/originSchema';


const getOrigins = async (): Promise<string[]> => {
  const dbOrigins = (await originSchema.find({}).exec()).map((origin: { address: any; }) => {
    return origin.address;
  });
  const envOrigins: string[] | undefined = process.env.ORIGINS?.split(",");
  
  if(dbOrigins.length > 0) {
    return dbOrigins;
  } else if(envOrigins !== undefined && envOrigins.length > 0) {
    return envOrigins;
  } else {
    return ["http://localhost:3000"]
  }
}

export {
  getOrigins
}