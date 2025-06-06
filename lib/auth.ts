import { NextAuthOptions } from "next-auth";
import CredentialsProvider  from "next-auth/providers/credentials";
import { connectToDatabase } from "./db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export const authOptions : NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email :{
                    label : "Email" , type: "text" ,
                },
                password: {
                    label: "Password" , type: "password",
                }
            },
            async authorize(credentials : any): Promise<any> {
                await connectToDatabase() ;
                try{
                    const user = await User.findOne({
                        $or:[
                            {email : credentials.identifier},
                            {username : credentials.identifier}
                        ]
                    });

                    if(!user){
                        throw new Error("No user found with this email");
                    }

                    const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);

                    if(!isPasswordCorrect){
                        throw new Error("Incorrect password");
                    }
                    return {
                            _id: user._id.toString(),
                            email: user.email,
                            username: user.username,
                            avatar: user.avatar || "",
                        };

                }catch(error:any){
                    console.error("Error in authorize:", error);
                    throw new Error(error.message || "Authorization failed");
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
        signIn: "/auth/login",
        error: "/auth/login",
    },
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60,
    },
    secret: process.env.NEXTAUTH_SECRET,
}
