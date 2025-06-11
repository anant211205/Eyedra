import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Claim, { ClaimStatus } from "@/models/Claim";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?._id) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const url = new URL(request.url);
        const status = url.searchParams.get('status');
        const page = parseInt(url.searchParams.get('page') || '1');
        const limit = parseInt(url.searchParams.get('limit') || '10');
        const skip = (page - 1) * limit;

        await connectToDatabase();

        const filters: any = { claimant_id: session.user._id };
        if (status && Object.values(ClaimStatus).includes(status as ClaimStatus)) {
            filters.status = status;
        }

        const totalClaims = await Claim.countDocuments(filters);

        const myClaims = await Claim.find(filters)
            .populate({
                path: 'post_id',
                select: 'type description location date status user_id',
                populate: {
                    path: 'user_id',
                    select: 'username'
                }
            })
            .sort({ createdAt: -1 }) // Fixed: use createdAt instead of created_at
            .skip(skip)
            .limit(limit);

        return NextResponse.json({
            success: true,
            claims: myClaims,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalClaims / limit),
                totalClaims,
                hasNextPage: page * limit < totalClaims,
                hasPrevPage: page > 1
            }
        });

    } catch (error) {
        console.error("Error fetching my claims:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
