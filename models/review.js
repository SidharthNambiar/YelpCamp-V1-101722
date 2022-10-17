const mongoose = require("mongoose")
const { Schema } = mongoose;

const reviewSchema = new Schema({
    body: String,
    rating: Number,
    author: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
})

// 1 campground will have Many reviews

module.exports = mongoose.model("Review", reviewSchema)
