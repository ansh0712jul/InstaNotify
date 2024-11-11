import mongoose,{Schema} from "mongoose";
import { User } from "./user.model.js";
const websiteSchema=new Schema(
    {
        url:{
            type:String,
            required:true
        },
        userId:{
            type:Schema.Types.ObjectId,
            ref:User,
            required:true
        },
        isActive:{
            type:Boolean
        }

    },
    {
        timestamps:true
    }
)
export const website=mongoose.model("website",websiteSchema)