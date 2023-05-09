
import express from 'express';
import { Response } from 'express-serve-static-core';

export const ErrorHandler = (res: Response<any, Record<string, any>, number>, error: unknown) => {
  console.log(error);
  if (typeof error === "object" && error !== null) {
    return res.status(500).json({ result: "error", message: error.toString() });
  } else {
    return res.status(500).json({ result: "error", message: "Unknown error" });
  }
} 