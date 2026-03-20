import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

const githubClientId = process.env.AUTH_GITHUB_ID ?? "";
const githubClientSecret = process.env.AUTH_GITHUB_SECRET ?? "";
const authSecret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? "gitviz-development-secret";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret: authSecret,
  session: { strategy: "jwt" },
  providers: [
    GitHub({
      clientId: githubClientId,
      clientSecret: githubClientSecret,
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account?.provider === "github" && account.access_token) {
        token.accessToken = account.access_token;
      }

      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      return session;
    },
  },
});
