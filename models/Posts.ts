import mongoose, {model , models , Schema} from "mongoose";

export enum PostStatus{
    UNCLAIMED = "unclaimed",
    CLAIM_IN_PROGRESS = "claim_in_progress", 
    CLAIMED = "claimed",
}

export enum PostType{
    LOST = "lost",
    FOUND = "found",
}

export interface IPosts{
    _id?: mongoose.Types.ObjectId;
    user_id: mongoose.Types.ObjectId;
    type: PostType; 
    category_id?: mongoose.Types.ObjectId;
    customCategory?:string;
    location: string;
    date: Date ;
    description: string ;
    status: PostStatus | "unclaimed";
    claimed_by?: mongoose.Types.ObjectId;
    found_by?: mongoose.Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}

const postSchema = new Schema<IPosts>(
    {
        user_id:{
            type: Schema.Types.ObjectId,
            required: true,
            ref: "User",
        },
        type:{
            type: String ,
            required: true,
            enum: Object.values(PostType),
        },
        category_id: {
            type: Schema.Types.ObjectId,
            ref: "Category",
            required: false,
        },
        customCategory: {
            type: String,
            required: false,
            trim: true,
        },
        location:{
            type: String,
            required: true,
            trim: true,
        },
        date:{
            type: Date,
            required: true,
        },
        description:{
            type: String,
            required: true,
            trim: true,
        },
        status:{
            type: String,
            required: true,
            enum: Object.values(PostStatus),
            default: PostStatus.UNCLAIMED,
        },
        claimed_by:{
            type: Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        found_by:{
            type: Schema.Types.ObjectId,
            ref: "User",
            default: null,
        }
    },{
        timestamps: true,
    }
)

postSchema.index({ type: 1 });
postSchema.index({ category_id: 1 });
postSchema.index({ user_id: 1 });
postSchema.index({ date: 1 });
postSchema.index({ status: 1 });
postSchema.index({ createdAt: -1 });

postSchema.index({ 
    description: "text", 
    location: "text", 
    customCategory: "text" 
});

const Post = models?.Posts || model<IPosts>("Posts", postSchema);

export default Post;