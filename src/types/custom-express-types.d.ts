import { Request } from "express";

export interface IRequestWthRawBody extends Request {
  rawBody: Buffer;
}

export type THttpMethods = "GET" | "PUT" | "POST" | "DELETE" | "PATCH" | "HEAD" | "OPTIONS";
