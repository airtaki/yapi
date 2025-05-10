import "express";
import { PublicUser } from "./user";

declare global {
  namespace Express {
    export interface Request {
      // Locale string
      locale: string;
      // Validated arguments by the validator
      validArguments: Map<string, any>;
      setValidArguments: (key: string, value: any) => void;
      getValidArguments: (key: string) => any;
      getIp: () => string;
      user?: PublicUser;
    }
    export interface Response {
      success: (status: number, message: string, data?: any) => void;
      error: (
        status: number,
        error: string,
        message?: string | null,
        details?: any,
        stack?: any
      ) => void;
    }
  }
}
