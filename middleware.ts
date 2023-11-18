export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/home", "/api/upload", "/api/download", "/api/list"],
};
