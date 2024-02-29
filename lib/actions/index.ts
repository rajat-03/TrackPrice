"use server"

import { revalidatePath } from "next/cache";
import { Product } from "../models/product.model";
import { connectToDB } from "../mongoose";
import { scrapeAmazonProduct } from "../scraper";
import { getAveragePrice, getHighestPrice, getLowestPrice } from "../utils";
import { User } from "../../types"
import { generateEmailBody, sendEmail } from "../nodemailer";


//Product page scraping logic
export const scrapeAndStoreProduct = async (productUrl: string) => {
    if (!productUrl) return;

    try {
        await connectToDB();
        //Scrape is done by the function scrapeAmazonProduct in lib/scraper/index.ts
        const scrapedProduct = await scrapeAmazonProduct(productUrl);

        if (!scrapedProduct) return;

        let product = scrapedProduct;

        const productAlreadyExists = await Product.findOne({ url: scrapedProduct.url });

        if (productAlreadyExists) {
            const updatedPriceHistory: any = [
                ...productAlreadyExists.priceHistory,
                { price: scrapedProduct.currentPrice }
            ] //Add the current price to the price history

            product = {
                ...scrapedProduct,
                priceHistory: updatedPriceHistory,
                lowestPrice: getLowestPrice(updatedPriceHistory),
                highestPrice: getHighestPrice(updatedPriceHistory),
                averagePrice: getAveragePrice(updatedPriceHistory),
            } //Update the product object with the new price history
        }


        const newProduct = await Product.findOneAndUpdate(
            { url: scrapedProduct.url },
            product,
            { upsert: true, new: true }
        );

        console.log("Product created/updated successfully");
        revalidatePath(`/products/${newProduct._id}`); //Revalidate the products API endpoint
        
    
    } catch (error: any) {
        throw new Error(`Failed to create/update product: ${error.message}`)
    }
}

export const getProductByID = async (productId: string) =>{
    try {
        await connectToDB();

        const product = await Product.findOne({_id: productId})

        if(!product) return null

        return product;

    } catch (error) {
        console.log("error in getting product by id!!", error)
    }

}

export const getAllProducts = async () => {
    try {
        await connectToDB();
        //find products and sort by the most recently updated
        const products = await Product.find().sort({updatedAt: -1}).exec();
        return products;
    } catch (error) {
        console.log("Error in getting all products!!", error)        
    }
}

export const getSimilarProducts = async (productId: string) => {
    try {
        await connectToDB();
        const currentProduct = await Product.findById(productId);

        if(!currentProduct) return null;

        const similarProducts = await Product.find({
            _id:{$ne: productId},
        }).limit(4).sort({updatedAt: -1}).exec(); //Get the 4 most recently updated products

        return similarProducts;
    } catch (error) {
        console.log("Error in getting similar products!!", error)        
    }
}

export const addUserEmailToProduct = async (productId: string, userEmail: string) =>{

    try {
        //Add the user email to the product's user list
        const product = await Product.findById(productId);

        if(!product) return;

        //check for the user that if the user is already in the list of tracking the product
        const userAlreadyTracking = product.users.some((user: User) => user.email === userEmail);

        if(!userAlreadyTracking) {
            product.users.push({email: userEmail});
            await product.save();
            
            // this function is used to generate the email body that will be sent to the userfunc
            const emailContent = await generateEmailBody(product, 'WELCOME');

            // this function is used to send the email to the user using nodemailer
            await sendEmail(emailContent,[userEmail])

        }
        
    } catch (error) {
        console.log("Error in adding user email to product!!", error)
    }

}