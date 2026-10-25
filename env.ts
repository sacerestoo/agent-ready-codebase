import { boolean, defineEnv, string, url } from "void/env";

export default defineEnv({
  DATABASE_URL: url(),
  CREEM_API_KEY: string().optional(),
  CREEM_WEBHOOK_SECRET: string().optional(),
  CREEM_TEST_MODE: boolean().default(true),
  CREEM_SUBSCRIPTIONS_ENABLED: boolean().default(false),
  CREEM_SUBSCRIPTION_PRODUCT_ID: string().optional(),
  CREEM_WEBHOOK_HOST: string().optional(),
});
