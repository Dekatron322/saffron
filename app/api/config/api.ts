// src/config/api.ts
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://saffronwellcare.com",
  AUTH_ENDPOINT: "/framework-service/dapi/auth/authenticateUser",
}
