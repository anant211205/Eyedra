import mongoose , {model , models, Schema} from "mongoose";

export interface IMedia{
    _id?: mongoose.Types.ObjectId;
    post_id: mongoose.Types.ObjectId;
    postImageUrl: string;
}

const mediaSchema = new Schema<IMedia>(
    {
        post_id: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: "Posts",
        },
        postImageUrl: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const Media = models?.Media || model<IMedia>("Media", mediaSchema);

export default Media;

