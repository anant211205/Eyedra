import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import Claim, { ClaimStatus, ClaimType } from "@/models/Claim";
import Post, { PostStatus } from "@/models/Posts";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ claimid: string }>  }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?._id) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { claimid } = await params;
        if (!mongoose.Types.ObjectId.isValid(claimid)) {
            return NextResponse.json(
                { message: "Invalid claim ID" },
                { status: 400 }
            );
        }

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
        
        if (claim.claim_type === ClaimType.OWNERSHIP_CLAIM) {
            if (claim.post_id.user_id.toString() !== session.user._id) {
                return NextResponse.json(
                    { message: "You can only approve ownership claims for your own posts" },
                    { status: 403 }
                );
            }

            await Claim.findByIdAndUpdate(claimid, {
                status: ClaimStatus.APPROVED,
                approved_at: new Date()
            });

            await Post.findByIdAndUpdate(claim.post_id._id, {
                status: PostStatus.CLAIMED,
                claimed_by: claim.claimant_id,
                claimed_at: new Date()
            });

            await Claim.updateMany(
                {
                    post_id: claim.post_id._id,
                    _id: { $ne: claimid },
                    claim_type: ClaimType.OWNERSHIP_CLAIM,
                    status: ClaimStatus.PENDING
                },
                {
                    status: ClaimStatus.DENIED,
                    denied_at: new Date()
                }
            );

        } else if (claim.claim_type === ClaimType.FINDER_CLAIM) {
            if (claim.post_id.user_id.toString() !== session.user._id) {
                return NextResponse.json(
                    { message: "You can only approve finder claims for your own posts" },
                    { status: 403 }
                );
            }
            await Claim.findByIdAndUpdate(claimid, {
                status: ClaimStatus.APPROVED,
                approved_at: new Date()
            });
            await Post.findByIdAndUpdate(claim.post_id._id, {
                status: PostStatus.CLAIMED,
                found_by: claim.claimant_id,
                claimed_at: new Date()
            });
            await Claim.updateMany(
                {
                    post_id: claim.post_id._id,
                    _id: { $ne: claimid },
                    claim_type: ClaimType.FINDER_CLAIM,
                    status: ClaimStatus.PENDING
                },
                {
                    status: ClaimStatus.DENIED,
                    denied_at: new Date()
                }
            );

        } else {
            return NextResponse.json(
                { message: "Invalid claim type for approval" },
                { status: 400 }
            );
        }

        const updatedClaim = await Claim.findById(claimid)
            .populate('claimant_id', 'username email phone')
            .populate('post_id', 'title description');

        return NextResponse.json({
            message: "Claim approved successfully",
            claim: updatedClaim
        });

    } catch (error) {
        console.error("Error approving claim:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
