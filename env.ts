import { boolean, defineEnv, string, url } from "void/env";

export default defineEnv({
  DATABASE_URL: url(),
  CREEM_API_KEY: string().optional(),
  CREEM_WEBHOOK_SECRET: string().optional(),
  CREEM_TEST_MODE: boolean().default(true),
  CREEM_SUBSCRIPTIONS_ENABLED: boolean().default(false),
  CREEM_SUBSCRIPTION_PRODUCT_ID: string().optional(),
  CREEM_WEBHOOK_HOST: string().optional(),
  AUTH_GOOGLE_CLIENT_ID: string().optional(),
  AUTH_GOOGLE_CLIENT_SECRET: string().optional(),
  RESEND_API_KEY: string().optional(),
  RESEND_FROM_EMAIL: string().optional(),
  RESEND_OTP_TEMPLATE_ID: string().optional(),
});
