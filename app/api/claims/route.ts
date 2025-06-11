// File: app/api/claims/[claimid]/route.ts
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import Claim, { ClaimStatus } from "@/models/Claim";
import Post, { PostStatus } from "@/models/Posts";

export async function DELETE(
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

        await connectToDatabase();
        
        // Find the claim and populate post info
        const claim = await Claim.findById(claimid).populate('post_id');
        
        if (!claim) {
            return NextResponse.json(
                { message: "Claim not found" },
                { status: 404 }
            );
        }

        // Verify authorization - only post owner can delete claims for their posts
        if (claim.post_id.user_id.toString() !== session.user._id) {
            return NextResponse.json(
                { message: "You can only delete claims for your own posts" },
                { status: 403 }
            );
        }

        // Delete the claim
        await Claim.findByIdAndDelete(claimid);

        // Check if there are any remaining pending claims
        const remainingPendingClaims = await Claim.countDocuments({
            post_id: claim.post_id._id,
            status: ClaimStatus.PENDING
        });

        // If no pending claims remain and post was in pending status, update it back to UNCLAIMED
        if (remainingPendingClaims === 0 && claim.post_id.status === PostStatus.CLAIM_IN_PROGRESS) {
            await Post.findByIdAndUpdate(claim.post_id._id, {
                status: PostStatus.UNCLAIMED
            });
        }

        return NextResponse.json({
            message: "Claim deleted successfully"
        });

    } catch (error) {
        console.error("Error deleting claim:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}