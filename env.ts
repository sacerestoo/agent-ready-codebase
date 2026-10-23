import { defineEnv, number, string, url } from 'void/env';

export default defineEnv({
  DATABASE_URL: url(),
});