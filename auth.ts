import { creem } from "@creem_io/better-auth";
import { emailOTP } from "better-auth/plugins/email-otp";
import { Resend } from "resend";
import { defineAuth } from "void/auth";

const createResendOtpPlugin = (
  apiKey: unknown,
  from: unknown,
  templateId: unknown,
) =>
  emailOTP({
    async sendVerificationOTP({ email, otp }) {
      if (
        typeof apiKey !== "string" ||
        typeof from !== "string" ||
        typeof templateId !== "string"
      ) {
        throw new TypeError("Resend OTP email settings are missing.");
      }
      const { error } = await new Resend(apiKey).emails.send({
        from,
        to: email,
        template: { id: templateId, variables: { OTP: otp } },
      });
      if (error)
        throw new Error(`Resend email delivery failed: ${error.message}`);
    },
  });

export default defineAuth(({ defaults, env }) => {
  const plugins = [...(defaults.plugins ?? [])];
  if (
    typeof env.CREEM_API_KEY === "string" &&
    typeof env.CREEM_WEBHOOK_SECRET === "string"
  ) {
    plugins.push(
      creem({
        apiKey: env.CREEM_API_KEY,
        webhookSecret: env.CREEM_WEBHOOK_SECRET,
        testMode: String(env.CREEM_TEST_MODE) === "true",
        persistSubscriptions: true,
        defaultSuccessUrl: "/",
      }),
    );
  }
  return {
    ...defaults,
    emailAndPassword: { enabled: false },
    plugins: [
      ...plugins,
      createResendOtpPlugin(
        env.RESEND_API_KEY,
        env.RESEND_FROM_EMAIL,
        env.RESEND_OTP_TEMPLATE_ID,
      ),
    ],
    disabledPaths: [
      ...(defaults.disabledPaths ?? []),
      "/creem/create-checkout",
      "/creem/cancel-subscription",
      "/creem/retrieve-subscription",
      "/creem/search-transactions",
    ],
  };
});
