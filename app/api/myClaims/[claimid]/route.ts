import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Claim from "@/models/Claim";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

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

        const claimId = params.claimid;

        if (!claimId) {
            return NextResponse.json(
                { message: "Claim ID is required" },
                { status: 400 }
            );
        }

        await connectToDatabase();
        const claim = await Claim.findById(claimId);
                
        if (!claim) {
            return NextResponse.json(
                { message: "Claim not found" },
                { status: 404 }
            );
        }
        if (claim.claimant_id.toString() !== session.user._id.toString()) {
            return NextResponse.json(
                { message: "Forbidden: You can only delete your own claims" },
                { status: 403 }
            );
        }
        await Claim.findByIdAndDelete(claimId);

        return NextResponse.json({
            success: true,
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