import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import Claim, { ClaimStatus, ClaimType } from "@/models/Claim";
import Post from "@/models/Posts";

export async function GET(
    request: NextRequest,
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

        await connectToDatabase();
        const post = await Post.findById(postid);
        if (!post) {
            return NextResponse.json(
                { message: "Post not found" },
                { status: 404 }
            );
        }

        if (post.user_id.toString() !== session.user._id) {
            return NextResponse.json(
                { message: "You can only view claims for your own posts" },
                { status: 403 }
            );
        }

        const url = new URL(request.url);
        const status = url.searchParams.get('status'); 
        const claimType = url.searchParams.get('claim_type'); 
        const page = parseInt(url.searchParams.get('page') || '1');
        const limit = parseInt(url.searchParams.get('limit') || '10');
        const skip = (page - 1) * limit;

        const filters: any = { post_id: postid };
        
        if (status && Object.values(ClaimStatus).includes(status as ClaimStatus)) {
            filters.status = status;
        }
        
        if (claimType && Object.values(ClaimType).includes(claimType as ClaimType)) {
            filters.claim_type = claimType;
        }

        const totalClaims = await Claim.countDocuments(filters);
        const claims = await Claim.find(filters)
            .populate('claimant_id', 'username email profile_picture phone createdAt')
            .populate('finder_id', 'username email profile_picture phone') 
            .sort({ created_at: -1 }) 
            .skip(skip)
            .limit(limit);

        const claimStats = await Claim.aggregate([
            { $match: { post_id: new mongoose.Types.ObjectId(postid) } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const stats = {
            total: totalClaims,
            pending: 0,
            approved: 0,
            denied: 0
        };

        claimStats.forEach(stat => {
            if (stat._id === ClaimStatus.PENDING) stats.pending = stat.count;
            if (stat._id === ClaimStatus.APPROVED) stats.approved = stat.count;
            if (stat._id === ClaimStatus.DENIED) stats.denied = stat.count;
        });

        return NextResponse.json({
            success: true,
            claims,
            stats,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalClaims / limit),
                totalClaims,
                hasNextPage: page * limit < totalClaims,
                hasPrevPage: page > 1
            },
            post: {
                id: post._id,
                title: post.title,
                type: post.type,
                status: post.status
            }
        });

    } catch (error) {
        console.error("Error fetching claims:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}