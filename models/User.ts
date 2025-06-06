import mongoose, { model, models, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser{
    _id?: mongoose.Types.ObjectId ;
    username : string ;
    email: string ;
    password: string ;
    avatar : string ;
    createdAt?: Date ;
    updatedAt?: Date ;
}

const userSchema = new Schema<IUser>(
    {
        username:{
            type: String,
            required: true ,
            unique: true ,
            trim: true ,
        },
        email:{
            type: String, 
            required: true ,
            unique : true ,
        },
        password:{
            type:String ,
            required: true ,
        },
        avatar:{
            type: String ,
            default: null ,
        }
    },
    {
        timestamps: true,
    }
);

userSchema.pre("save", async function(next){
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password ,10) ;
    }
    next() ;
})

const User = models?.User || model<IUser>("User" , userSchema) ;

export default User ;
