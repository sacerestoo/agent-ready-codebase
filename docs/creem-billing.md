# Test Creem Subscriptions

Use Creem **Test Mode** first. Test keys, products, payments, and webhooks are
separate from live data.

## Setup

Create a recurring product in the Creem dashboard while Test Mode is enabled.
Set its ID as `CREEM_SUBSCRIPTION_PRODUCT_ID`, add your test API key and webhook
secret to the environment, and set `CREEM_TEST_MODE=true` and
`CREEM_SUBSCRIPTIONS_ENABLED=true`.

Send checkout and subscription events to the Test Mode webhook at
`https://<public-dev-url>/api/auth/creem/webhook`. Expose the local app through
an HTTPS tunnel.

Required environment variables:

```ini
CREEM_API_KEY=creem_test_...
CREEM_WEBHOOK_SECRET=whsec_...
CREEM_TEST_MODE=true
CREEM_SUBSCRIPTIONS_ENABLED=true
CREEM_SUBSCRIPTION_PRODUCT_ID=prod_...
```

## Test the flow

1. Add the Test Mode API key and webhook secret to the project `.env` file.
2. Apply database changes with `bunx void db migrate`. Start the app with
   `bun run dev`, then create an account or sign in.
3. Select **Subscribe / resubscribe** and complete a test payment. After the
   webhook is processed, select **Refresh status** and confirm the status is
   **Active**. Open **Manage or cancel subscription** to view or cancel it.

For test cards, follow the
[Creem Test Mode guide](https://docs.creem.io/getting-started/test-mode). For
event payloads and signature checks, use the
[Creem webhook guide](https://docs.creem.io/code/webhooks) and
[Better Auth webhook guide](https://docs.creem.io/code/sdks/better-auth/webhooks).
Do not use live keys or live product IDs for testing.
