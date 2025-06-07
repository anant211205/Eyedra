import 'dotenv/config';
import { connectToDatabase } from "../lib/db";
import Category, { ICategory } from "../models/Category"; 
import mongoose from "mongoose";

const CategoryModel = Category as mongoose.Model<ICategory>;

async function seedCategories() {
    await connectToDatabase();

    const predefinedCategories = [
        "Electronics",
        "Clothing",
        "Books",
        "Wallet",
        "Bag",
        "Jewelry",
        "Documents",
        "Others"
    ];

    for(const categoryName of predefinedCategories){
        const existingCategory = await CategoryModel.findOne({ 
            name: categoryName 
        }).exec();
        if(!existingCategory){
            const newCategory = await CategoryModel.create({ 
                name: categoryName 
            });
            console.log(`Category created: ${newCategory.name}`);
        }else{
            console.log(`Category already exists: ${existingCategory.name}`);
        }
    }

    process.exit(0);
}

seedCategories()
    .then(() => console.log("Seeding completed successfully"))
    .catch((error) => {
        console.error("Error during seeding:", error);
        process.exit(1);
    });
