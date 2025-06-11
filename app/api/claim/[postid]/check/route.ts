import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Claim from '@/models/Claim';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ postid: string }>  }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?._id) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { postid } = await params;
        
        const body = await request.json();
        const userId = body.userId || session.user._id;

        await connectToDatabase();

        const existingClaim = await Claim.findOne({
            post_id: postid,
            claimant_id: userId  
        });

        const totalClaims = await Claim.countDocuments({ post_id: postid });

        return NextResponse.json({
            hasClaimed: !!existingClaim,
            totalClaims: totalClaims,
            message: existingClaim 
                ? 'You have already claimed this post.' 
                : 'You can claim this post.'
        }, { status: 200 });

    } catch (error) {
        console.error('Error checking claim:', error);
        return NextResponse.json(
            { message: 'Internal Server Error' },
            { status: 500 }
        );
    }
}