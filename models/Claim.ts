import mongoose , {models , model , Schema} from "mongoose";

export enum ClaimStatus{
    PENDING = "pending",
    APPROVED = "approved",
    DENIED = "denied",
}

export enum ClaimType{
    OWNERSHIP_CLAIM = "ownership_claim",
    FINDER_CLAIM = "finder_claim",
    OWNER_REQUEST = "owner_request",
}

export interface IClaim{
    _id?: mongoose.Types.ObjectId;
    post_id: mongoose.Types.ObjectId;
    claimant_id: mongoose.Types.ObjectId;
    claim_type?: ClaimType;
    message: string;
    photo_proof?: string;
    status: ClaimStatus;
    parent_claim_id?: mongoose.Types.ObjectId;
    finder_id?: mongoose.Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}

const claimSchema = new Schema<IClaim>(
    {
        post_id: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: "Posts",
        },
        claimant_id: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: "User",
        },
        claim_type:{
            type: String,
            required: false,
            enum: Object.values(ClaimType),
        },
        message: {
            type: String,
            required: true,
            trim: true,
        },
        photo_proof: {
            type: String,
            required: false,
            trim: true,
        },
        status: {
            type: String,
            required: true,
            enum: Object.values(ClaimStatus),
            default: ClaimStatus.PENDING,
        },
        parent_claim_id:{
            type: Schema.Types.ObjectId,
            required: false,
            ref: "Claim",
        },
        finder_id:{
            type: Schema.Types.ObjectId,
            required: false,
            ref: "User",
        }
    },
    {
        timestamps: true,
    }
);

claimSchema.index({ post_id: 1 });
claimSchema.index({ claimant_id: 1 });
claimSchema.index({ status: 1 });
claimSchema.index({ claim_type: 1 });
claimSchema.index({ createdAt: -1 });
claimSchema.index({ parent_claim_id: 1 });

claimSchema.index(
    { post_id: 1, claimant_id: 1, claim_type: 1 }, 
    { unique: true }
);

const Claim = models?.Claim || model<IClaim>("Claim", claimSchema);

export default Claim;
