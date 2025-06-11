import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Post, { PostStatus, PostType } from "@/models/Posts";
import Claim, { ClaimStatus, ClaimType } from "@/models/Claim";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";
import { authOptions } from "@/lib/auth";
import { uploadToCloudinary } from "@/lib/cloudinary";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ postid: string }>  }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?._id) {
            return NextResponse.json(
                { message: "Unauthorized" }, 
                { status: 401 }
            );
        }

        const { postid } = await params;
        if (!mongoose.Types.ObjectId.isValid(postid)) {
            return NextResponse.json(
                { message: "Invalid post ID" }, 
                { status: 400 }
            );
        }
        const formData = await req.formData();
        const claim_type = formData.get("claim_type") as string;
        const message = formData.get("message") as string;
        const photo_proof = formData.get("photo_proof") as File | null;

        if (!claim_type) {
            return NextResponse.json(
                { message: "Claim type is required" }, 
                { status: 400 }
            );
        }

        await connectToDatabase();
        const post = await Post.findById(postid);
        if (!post) {
            return NextResponse.json(
                { message: "Post not found" },
                { status: 404 }
            );
        }

        if (post.status === PostStatus.CLAIMED) {
            return NextResponse.json(
                { message: "Post is already claimed" }, 
                { status: 400 }
            );
        }

        if (post.user_id.toString() === session.user._id) {
            return NextResponse.json(
                { message: "You cannot claim your own post" }, 
                { status: 400 }
            );
        }

        if (post.type === PostType.LOST && claim_type !== ClaimType.FINDER_CLAIM) {
            return NextResponse.json(
                { message: "Only finder claims are allowed for lost posts" }, 
                { status: 400 }
            );
        }

        if (post.type === PostType.FOUND && claim_type !== ClaimType.OWNERSHIP_CLAIM) {
            return NextResponse.json(
                { message: "Only ownership claims are allowed for found posts" }, 
                { status: 400 }
            );
        }

        const claimantId = new mongoose.Types.ObjectId(session.user._id);
        const postObjId = new mongoose.Types.ObjectId(postid);

        const existingClaim = await Claim.findOne({
            post_id: postObjId, 
            claimant_id: claimantId,
            claim_type: claim_type
        });

        if (existingClaim) {
            return NextResponse.json(
                { message: "You have already made a claim for this post" }, 
                { status: 400 }
            );
        }

        let photoProofUrl = "";
        if (photo_proof && photo_proof.size > 0) {
            const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
            if (!allowedTypes.includes(photo_proof.type)) {
                return NextResponse.json(
                    { message: "Only JPEG, PNG, and WebP images are allowed" }, 
                    { status: 400 }
                );
            }

            const maxSize = 5 * 1024 * 1024; 
            if (photo_proof.size > maxSize) {
                return NextResponse.json(
                    { message: "File size must be less than 5MB" }, 
                    { status: 400 }
                );
            }

            const buffer = Buffer.from(await photo_proof.arrayBuffer());
            const result = await uploadToCloudinary(buffer, photo_proof.name, photo_proof.type);
            photoProofUrl = result.secure_url;
        }

        const finalMessage = message && message.trim() 
            ? message.trim()
            : (post.type === PostType.LOST 
                ? "I found your lost item! Please contact me to arrange return."
                : "I believe this is my lost item. Please contact me to verify and arrange return.");

        const newClaim = new Claim({
            post_id: postObjId,
            claimant_id: claimantId,
            claim_type: claim_type,
            message: finalMessage,
            photo_proof: photoProofUrl || undefined,
            status: ClaimStatus.PENDING,
        });

        await newClaim.save();

        if (post.status === PostStatus.UNCLAIMED) {
            await Post.findByIdAndUpdate(
                postid, 
                { status: PostStatus.CLAIM_IN_PROGRESS }
            );
        }

        const populatedClaim = await Claim.findById(newClaim._id)
            .populate("claimant_id", "username email profile_picture")
            .populate("post_id", "title type description location");

        const responseMessage = post.type === PostType.LOST
            ? "Found item report sent to owner successfully"
            : "Ownership claim submitted successfully";

        return NextResponse.json({
            message: responseMessage, 
            claim: populatedClaim
        });

    } catch (error: unknown) {
    console.error("Error creating direct claim:", error);
    if (error && typeof error === "object" && "code" in error) {
        const err = error as { code?: number };
        if (err.code === 11000) {
            return NextResponse.json(
                { message: "You have already made a claim for this post" }, 
                { status: 400 }
            );
        }
    }
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}