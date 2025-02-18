export const config = {
  PROJECT_NAME: process.env.PROJECT_NAME || 'svc-gateway-api',
  LOG_LEVEL: process.env.LOG_LEVEL || 'fatal',
  PORT: parseInt(process.env.PORT || '3030', 10),
};
