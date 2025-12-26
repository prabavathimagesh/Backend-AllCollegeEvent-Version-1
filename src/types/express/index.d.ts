import "express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        identity: string;
        role?: string;
      };
    }
  }
}

export {};
