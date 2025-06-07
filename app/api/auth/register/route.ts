import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import { uploadToCloudinary } from "@/lib/cloudinary";

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        // console.log(formData);
        const username = formData.get("username") as string;
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        const avatar = formData.get("avatar") as File | null;

        if (!username || !email || !password) {
            return NextResponse.json(
                { error: "All fields are required" }, 
                { status: 400 }
            );
        }

        await connectToDatabase();

        const existingUser = await User.findOne({ 
            $or: [{ username }, { email }] 
        });

        if(existingUser){
            return NextResponse.json(
                { error: "Username or Email already exists" }, 
                { status: 400 }
            );
        }

        let imageUrl: string;

        if(avatar && avatar.size > 0){
            const arrayBuffer = await avatar.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const result = await uploadToCloudinary(buffer, avatar.name, avatar.type);
            imageUrl = result.secure_url;
        }else{
            const uiAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(username.charAt(0).toUpperCase())}`;
            const avatarRes = await fetch(uiAvatarUrl);
            const avatarBuffer = Buffer.from(await avatarRes.arrayBuffer());
            const result = await uploadToCloudinary(avatarBuffer, `${username}-default.png`, "image/png");
            imageUrl = result.secure_url;
        }

        const newUser = new User({
            username,
            email,
            password,
            avatar: imageUrl,
        });
        console.log("New user:", newUser);
        await newUser.save();

        return NextResponse.json(
            { message: "User registered successfully" },
            { status: 201 }
        );
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { error: "Internal server error" }, 
            { status: 500 }
        );
    }
}
