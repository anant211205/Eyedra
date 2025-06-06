import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import { NextResponse } from "next/server";
import {z} from "zod";

const usernameSchema = z.object({
    username: z.string().min(1, "Username is required").max(20, "Username must be less than 20 characters")
});

export async function GET(request: Request){
    try{
        await connectToDatabase();
        const {searchParams} = new URL(request.url);

        const queryParam = {
            username : searchParams.get("username") || "" ,
        }

        const result = usernameSchema.safeParse(queryParam) ;

        if(!result.success){
            const usernameError = result.error.format().username?._errors || [] ;
            return NextResponse.json(
                    {
                        message : usernameError.length > 0 ? usernameError.join(", ") : "Invalid username"
                    },{
                    status: 400
                }
            )
        }

        const {username} = result.data;
        const existingUser = await User.findOne({username}) ;

        if(existingUser){
            return NextResponse.json(
                {
                    message: "Username already exists"
                },{
                    status: 400
                }
            )
        }
        console.log("Username is unique:", username);
        return NextResponse.json(
            {
                message: "Username is available"
            },{
                status: 200
            }
        )

    }catch(error){
        console.error("Error checking username uniqueness:", error);
        return NextResponse.json(
            {
                message: "Internal server error"
            },{
                status: 500
            }
        );
    }
}