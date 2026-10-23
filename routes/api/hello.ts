import { defineHandler } from "void";

export const GET = defineHandler((): { message: string } => {
  return {
    message: "Hello from Void",
  };
});
