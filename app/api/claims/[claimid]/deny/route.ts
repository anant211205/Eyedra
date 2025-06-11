import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Claim, { ClaimStatus } from "@/models/Claim";
import Post, { PostStatus } from "@/models/Posts";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

export async function POST(
    request: NextRequest,
    { params }: { params: { claimid: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?._id) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { claimid } = params;
        if (!mongoose.Types.ObjectId.isValid(claimid)) {
            return NextResponse.json(
                { message: "Invalid claim ID" },
                { status: 400 }
            );
        }

        const body = await request.json().catch(() => ({}));
        const denialReason = body.reason || "";

        await connectToDatabase();
        const claim = await Claim.findById(claimid).populate('post_id');
        
        if (!claim) {
            return NextResponse.json(
                { message: "Claim not found" },
                { status: 404 }
            );
        }

        if (claim.status !== ClaimStatus.PENDING) {
            return NextResponse.json(
                { message: "Claim has already been processed" },
                { status: 400 }
            );
        }

        if (claim.post_id.user_id.toString() !== session.user._id) {
            return NextResponse.json(
                { message: "You can only deny claims for your own posts" },
                { status: 403 }
            );
        }

        await Claim.findByIdAndUpdate(claimid, {
            status: ClaimStatus.DENIED,
            denied_at: new Date(),
            denial_reason: denialReason
        });

        const remainingPendingClaims = await Claim.countDocuments({
            post_id: claim.post_id._id,
            status: ClaimStatus.PENDING
        });

        if (remainingPendingClaims === 0) {
            await Post.findByIdAndUpdate(claim.post_id._id, {
                status: PostStatus.UNCLAIMED
            });
        }

        return NextResponse.json({
            message: "Claim denied successfully"
        });

    } catch (error) {
        console.error("Error denying claim:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}