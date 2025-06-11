import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Post from '@/models/Posts';
import Category from '@/models/Category';
import Media from '@/models/Media';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { User } from 'next-auth';
import mongoose from 'mongoose';

interface PopulatedUser {
    _id: mongoose.Types.ObjectId;
    name: string;
    email?: string;
    image?: string;
}

interface PopulatedCategory {
    _id: mongoose.Types.ObjectId;
    name: string;
    description?: string;
}

interface PopulatedPost {
    _id: mongoose.Types.ObjectId;
    user_id: PopulatedUser | mongoose.Types.ObjectId;
    type: string;
    category_id?: PopulatedCategory | mongoose.Types.ObjectId;
    customCategory?: string;
    location: string;
    date: Date;
    description: string;
    status: string;
    claimed_by?: PopulatedUser | mongoose.Types.ObjectId;
    found_by?: PopulatedUser | mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

interface MediaDocument {
    _id: mongoose.Types.ObjectId;
    post_id: mongoose.Types.ObjectId;
    postImageUrl: string;
}

export async function GET(
    request: Request,
    { params }: { params: { postid: string } }
) {
    await connectToDatabase();
    
    try {
        const { postid } = params;

        if (!mongoose.Types.ObjectId.isValid(postid)) {
            return NextResponse.json(
                { error: 'Invalid post ID format' },
                { status: 400 }
            );
        }
        const post = await Post.findById(postid)
            .populate({
                path: 'user_id',
                select: 'name email image', 
            })
            .populate({
                path: 'category_id',
                select: 'name description',
            })
            .populate({
                path: 'claimed_by',
                select: 'name email',
            })
            .populate({
                path: 'found_by',
                select: 'name email',
            })
            .lean() as PopulatedPost | null;

        if (!post) {
            return NextResponse.json(
                { error: 'Post not found' },
                { status: 404 }
            );
        }

        const media = await Media.findOne({ post_id: postid }).lean() as MediaDocument | null;

        const session = await getServerSession(authOptions);
        const currentUser = session?.user as User | null;
        
        const isUserPopulated = (user_id: any): user_id is PopulatedUser => {
            return user_id && typeof user_id === 'object' && user_id._id;
        };

        const isCategoryPopulated = (category_id: any): category_id is PopulatedCategory => {
            return category_id && typeof category_id === 'object' && category_id._id;
        };

        const postUserId = isUserPopulated(post.user_id) 
            ? post.user_id._id.toString() 
            : post.user_id.toString();
        const isOwner = currentUser?._id?.toString() === postUserId;

        const responseData = {
            id: post._id.toString(),
            type: post.type,
            location: post.location,
            date: post.date,
            description: post.description,
            status: post.status,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt,
            customCategory: post.customCategory || null,
            
            category: isCategoryPopulated(post.category_id) ? {
                id: post.category_id._id.toString(),
                name: post.category_id.name,
                description: post.category_id.description || null,
            } : null,
            
            user: isUserPopulated(post.user_id) ? {
                id: post.user_id._id.toString(),
                name: post.user_id.name,
                image: post.user_id.image || null,
            } : {
                id: post.user_id.toString(),
                name: 'Unknown User',
                image: null,
            },
            
            image: media?.postImageUrl || null,
            
            claimed_by: post.claimed_by && isUserPopulated(post.claimed_by) ? {
                id: post.claimed_by._id.toString(),
                name: post.claimed_by.name,
            } : null,
            
            found_by: post.found_by && isUserPopulated(post.found_by) ? {
                id: post.found_by._id.toString(),
                name: post.found_by.name,
            } : null,
            
            isOwner,
        };

        return NextResponse.json(
            { 
                success: true,
                post: responseData 
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('Error fetching post details:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: Request,
    { params }: { params: { postId: string } }
) {
    await connectToDatabase();
    const session = await getServerSession(authOptions);
    const user = session?.user as User | null;

    if (!session || !user) {
        return NextResponse.json(
            { error: 'Unauthenticated User' },
            { status: 401 }
        );
    }

    try {
        const { postId } = params;

        if (!mongoose.Types.ObjectId.isValid(postId)) {
            return NextResponse.json(
                { error: 'Invalid post ID format' },
                { status: 400 }
            );
        }

        const existingPost = await Post.findById(postId);
        
        if (!existingPost) {
            return NextResponse.json(
                { error: 'Post not found' },
                { status: 404 }
            );
        }

        if (existingPost.user_id.toString() !== user._id?.toString()) {
            return NextResponse.json(
                { error: 'Unauthorized: You can only update your own posts' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { status, description, location } = body;

        const updateData: Record<string, any> = {};
        
        if (status && ['unclaimed', 'claim_in_progress', 'claimed'].includes(status)) {
            updateData.status = status;
        }
        
        if (description && typeof description === 'string' && description.trim()) {
            updateData.description = description.trim();
        }
        
        if (location && typeof location === 'string' && location.trim()) {
            updateData.location = location.trim();
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json(
                { error: 'No valid update fields provided' },
                { status: 400 }
            );
        }

        const updatedPost = await Post.findByIdAndUpdate(
            postId,
            updateData,
            { new: true, runValidators: true }
        ).populate('user_id', 'name email image')
            .populate('category_id', 'name description');

        return NextResponse.json(
            { 
                success: true,
                message: 'Post updated successfully',
                post: updatedPost 
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('Error updating post:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { postid: string } }
) {
    await connectToDatabase();
    const session = await getServerSession(authOptions);
    const user = session?.user as User | null;

    if (!session || !user) {
        return NextResponse.json(
            { error: 'Unauthenticated User' },
            { status: 401 }
        );
    }

    try {
        const { postid } = params;

        if (!mongoose.Types.ObjectId.isValid(postid)) {
            return NextResponse.json(
                { error: 'Invalid post ID format' },
                { status: 400 }
            );
        }

        const existingPost = await Post.findById(postid);
        
        if (!existingPost) {
            return NextResponse.json(
                { error: 'Post not found' },
                { status: 404 }
            );
        }

        if (existingPost.user_id.toString() !== user._id?.toString()) {
            return NextResponse.json(
                { error: 'Unauthorized: You can only delete your own posts' },
                { status: 403 }
            );
        }

        await Media.deleteMany({ post_id: postid });

        await Post.findByIdAndDelete(postid);

        return NextResponse.json(
            { 
                success: true,
                message: 'Post deleted successfully' 
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('Error deleting post:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// implementation is not done 
// on frontend except for delete post