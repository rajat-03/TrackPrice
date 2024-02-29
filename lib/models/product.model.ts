import { Schema, model, models } from "mongoose"

const productSchema = new Schema({
    url: { type: String, required: true, unique: true },
    currency: { type: String, required: true },
    image: { type: String, required: true },
    title: { type: String, required: true },
    currentPrice: { type: Number, required: true },
    originalPrice: { type: Number, required: true },
    priceHistory: [
        {
            price: { type: Number, required: true },
            date: { type: Date, default: Date.now }
        },
    ],
    lowestPrice: { type: Number },
    highestPrice: { type: Number },
    averagePrice: { type: Number },
    discountRate: { type: Number },
    description: { type: String },
    category: { type: String },
    stars:{type:Number,default:0},
    reviewsCount: { type: Number },
    isOutOfStock: { type: Boolean, default: false },
    users: [
        { email: { type: String, required: true } }
    ], default: [],
}, { timestamps: true });


export const Product = models.Product || model("Product", productSchema)