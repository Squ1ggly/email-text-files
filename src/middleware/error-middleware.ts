import { NextFunction, Request, Response } from "express";

export default function errorMiddleware(error: string, req: Request, res: Response, next: NextFunction) {
  const obj = {
    status: 500,
    message: "Unexpected Error has occurred",
    date: new Date().toISOString()
  };
  if (res.headersSent) {
    console.error(error);
    return;
  }
  if (!error) {
    res.status(500).send(obj);
    return;
  }
  obj.message = error;
  res.status(500).send(obj);
  console.error(error);
  return;
}
