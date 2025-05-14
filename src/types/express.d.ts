import "express";
import { PublicUser } from "./user";

declare global {
  namespace Express {
    interface Request {
      // Locale string
      locale: string;
      // Validated arguments by the validator
      validArguments: Map<string, unknown>;
      setValidArguments: <T>(key: string, value: T) => void;
      getValidArguments: <T>(key: string) => T;
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
