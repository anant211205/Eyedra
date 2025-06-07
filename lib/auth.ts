import { NextAuthOptions } from "next-auth";
import CredentialsProvider  from "next-auth/providers/credentials";
import { connectToDatabase } from "./db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export const authOptions : NextAuthOptions = {
    providers: [
        CredentialsProvider({
            id: "credentials",
            name: "Credentials",
            credentials: {
                identifier:{
                    label: "Email or Username", 
                    type: "text",
                },
                password: {
                    label: "Password" , type: "password",
                }
            },
            async authorize(credentials: any): Promise<any> {
                await connectToDatabase();

                const identifier = credentials.identifier;
                const password = credentials.password;

                try {
                    const user = await User.findOne({
                        $or: [
                            { email: identifier },
                            { username: identifier }
                        ]
                    });

                    if (!user) {
                        return null
                    }

                    const isPasswordCorrect = await bcrypt.compare(password, user.password);

                    if (!isPasswordCorrect) {
                        return null
                    }

                    return {
                        _id: user._id.toString(),
                        email: user.email,
                        username: user.username,
                        avatar: user.avatar || "",
                    };

                }catch (error: any) {
                    console.error("Error in authorize:", error);
                    return null;
                }
            }

        })
    ],
    callbacks:{
        async session({session, token}){
            if(token){
                session.user._id = token._id;
                session.user.email = token.email;
                session.user.username = token.username;
                session.user.avatar = token.avatar;
            }
            return session;
        },

        async jwt({token, user}){
            if(user){
                token._id = user._id;
                token.email = user.email;
                token.username = user.username;
                token.avatar = user.avatar;
            }
            return token;
        },
    },
    pages:{
        signIn: "/signin",
        error: "/signin",
    },
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60,
    },
    secret: process.env.NEXTAUTH_SECRET,
}

