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


// user?: {
//         data: {
//           id: number;
//           identity: string;
//           email: string;
//           roleId: string;
//           type: string;
//         };
//         iat: number;
//         exp: number;
//       };