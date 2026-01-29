import { helmetConfig } from "../config/helmet.config";
import { globalLimiter } from "../config/rateLimit.config";

export const applySecurityMiddleware = (app: any) => {
  app.use(helmetConfig);      // Helmet
  app.use(globalLimiter);     // Rate Limit
};
