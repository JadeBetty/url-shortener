import mongoose from "mongoose";
const { Schema, model, models } = mongoose;
const link = new Schema(
  {
    shorturl: String,
    exp: Date,
    longurl: String,
  },
  { typeKey: "$type" }
);

export default models.Links_data || model("Links_data", link);
