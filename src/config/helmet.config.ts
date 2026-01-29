import helmet from "helmet";

export const helmetConfig = helmet({
  contentSecurityPolicy: false, // disable if using external CDN/frontend
  crossOriginEmbedderPolicy: false,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
});
