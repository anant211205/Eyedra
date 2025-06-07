import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Category from '@/models/Category';

export async function GET() {
    try {
        await connectToDatabase();
        const categories = await Category.find({}).select('name').sort({ name: 1 });
        
        return NextResponse.json(
            { categories }, 
            { status: 200 }
        );
    } catch (error) {
        console.error('Error fetching categories:', error);
        return NextResponse.json(
            { error: 'Failed to fetch categories' }, 
            { status: 500 }
        );
    }
}