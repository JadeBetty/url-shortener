import {Schema, model} from "mongoose";

const link = new Schema({
    shorturl: String,
    exp: Date,
    longurl: String
});

export default model("Links_data", link);