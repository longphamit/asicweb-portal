import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getDb } from "@/lib/mongodb";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const db = await getDb();

        // Lấy account
        const account = await db
          .collection("account")
          .findOne({ username: credentials.username });

        if (!account) throw new Error("Username hoặc password không đúng");

        const valid = await bcrypt.compare(credentials.password, account.password);
        if (!valid) throw new Error("Username hoặc password không đúng");

        // Lấy party của account
        const party = await db
          .collection("party")
          .findOne({ accountId: account._id.toString() });

        // Trả về user object cho NextAuth
        return {
          id: account._id.toString(),
          username: account.username,
          party: party || null, // trả về null nếu không có party
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.party = user.party; // lưu party vào token
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.username = token.username;
      session.user.party = token.party; // thêm party vào session
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
