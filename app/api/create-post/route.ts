import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Post, { PostType } from '@/models/Posts';
import Category from '@/models/Category';
import Media from '@/models/Media';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { User } from 'next-auth';
import { uploadToCloudinary } from '@/lib/cloudinary';

export async function POST(request: Request) {
    await connectToDatabase();
    const session = await getServerSession(authOptions);
    const user = session?.user as User | null;
    console.log('Session user:', user);
    
    if (!session || !session.user) {
        return NextResponse.json(
            { error: 'Unauthenticated User' }, 
            { status: 401 }
        );
    }
    
    try {
        if (!request.headers.get('content-type')?.includes('multipart/form-data')) {
            return NextResponse.json(
                { error: 'Invalid Content-Type' }, 
                { status: 400 }
            );
        }


        const formData = await request.formData();

        const type = formData.get('type') as PostType;
        const categoryInput = formData.get('category') as string;
        const location = formData.get('location') as string;
        const dateString = formData.get('date') as string;
        const description = (formData.get('description') as string)?.trim();
        const postPhoto = formData.get('postPhoto') as File | null;

        const date = new Date(dateString);

        if(!type || !categoryInput || !location || !dateString || !description || !postPhoto){
            console.error('Missing required fields:', {
                type, categoryInput, location, dateString, description, postPhoto
            });
            return NextResponse.json(
                { error: 'All fields are required' }, 
                { status: 400 }
            );
        }

        if(!Object.values(PostType).includes(type)){
            return NextResponse.json(
                { error: 'Invalid post type' }, 
                { status: 400 }
            );
        }


        if(isNaN(date.getTime())){
            return NextResponse.json(
                { error: 'Invalid date format' }, 
                { status: 400 }
            );
        }

        const category = await Category.findOne({
            name: { 
                $regex: new RegExp(`^${categoryInput}$`, 'i') 
            },
        });

        const newPostData : any = {
            user_id: user?._id,
            type,
            location,
            date,
            description,
            status: 'unclaimed',
            claimed_by: null,
        }

        
        if(category){
            newPostData.category_id = category._id ;
            newPostData.customCategory = null ;
        }else{
            newPostData.category_id = null ;
            newPostData.customCategory = categoryInput.trim();
        }
        
        const newPost = await Post.create(newPostData);
        console.log('New post created:', newPost);
        
        let mediaEntry = null ;
        if(postPhoto && postPhoto.size > 0){
            const arrayBuffer = await postPhoto.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const result = await uploadToCloudinary(buffer, postPhoto.name, postPhoto.type);
            console.log('Cloudinary upload result:', result);
            mediaEntry = await Media.create({
                post_id: newPost._id,
                postImageUrl: result.secure_url,
            });
        }

        console.log(mediaEntry);

        return NextResponse.json(
            {message: 'Post created successfully', post: newPost}, 
            { status: 201 }
        );

        }catch(error){
            console.error('Error creating post:', error);
            return NextResponse.json(
                { error: 'Something went wrong while creating the post' }, 
                { status: 500 }
            );
        }
}
