import mongoose, { model, models, Schema, Document } from "mongoose";

export interface ICategory {
    _id?: mongoose.Types.ObjectId;
    name: string;
}

const categorySchema = new Schema<ICategory>({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
}, {
    timestamps: true,
});

const Category = models?.Category || model<ICategory>("Category", categorySchema);

export default Category;
