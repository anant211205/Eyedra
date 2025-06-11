import { NextRequest, NextResponse } from 'next/server';
import Post from '@/models/Posts'; 
import Media from '@/models/Media'; 
import { connectToDatabase } from '@/lib/db'; 
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth'; 

export async function GET(request: NextRequest) {
    try {
        await connectToDatabase();

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = 5; 
        const skip = (page - 1) * limit;

        const session = await getServerSession(authOptions);

        const filters: any = {};
        const type = searchParams.get('type');
        if (type && (type === 'FOUND' || type === 'LOST')){
            filters.type = type.toLowerCase(); 
        }


        const category = searchParams.get('category');
        if(category){
            filters.category_id = category;
        }

        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        if (startDate || endDate) {
            filters.date = {};
            if(startDate){
                filters.date.$gte = new Date(startDate);
            }
            if(endDate){
                filters.date.$lte = new Date(endDate);
            }
        }
        const keyword = searchParams.get('keyword');
        if(keyword){
            filters.$or = [
                { description: { $regex: keyword, $options: 'i' } },
                { location: { $regex: keyword, $options: 'i' } },
                { customCategory: { $regex: keyword, $options: 'i' } }
            ];
        }
        const onlyMine = searchParams.get('onlyMine');
        if(onlyMine === 'true'){
            if(session?.user?._id){
                filters.user_id = session.user._id;
            }else if(session?.user?._id){
                filters.user_id = session.user._id;
            }else{
                return NextResponse.json({
                    posts: [],
                    totalPages: 0,
                    currentPage: page,
                    totalPosts: 0
                });
            }
        }

        console.log(filters); 
        const totalPosts = await Post.countDocuments(filters);
        const totalPages = Math.ceil(totalPosts / limit);

        const posts = await Post.find(filters)
            .populate('user_id', 'username avatar email')
            .populate('category_id', 'name')
            .populate('claimed_by', 'username')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const postsWithMedia = await Promise.all(
            posts.map(async (post: any) => {
                const media = await Media.findOne({ post_id: post._id }).lean();
                return {
                    ...post,
                    media: media && !Array.isArray(media) && media.postImageUrl ? { postImageUrl: media.postImageUrl } : null
                };
            })
        );

        return NextResponse.json({
            posts: postsWithMedia,
            totalPages,
            currentPage: page,
            totalPosts,
            debug: {
                filtersApplied: filters,
                sessionUserId: session?.user?._id || session?.user?._id || null,
                onlyMineRequested: onlyMine === 'true'
            }
        });

    } catch (error) {
        console.error('Error fetching posts:', error);
        return NextResponse.json(
            { error: 'Failed to fetch posts' },
            { status: 500 }
        );
    }
}