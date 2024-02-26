"use server"

import { revalidatePath } from "next/cache";
import { Product } from "../models/product.model";
import { connectToDB } from "../mongoose";
import { scrapeAmazonProduct } from "../scraper";
import { getAveragePrice, getHighestPrice, getLowestPrice } from "../utils";

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
          )


        if (newProduct) {
            console.log("Product created/updated successfully")
            revalidatePath(`/products/${newProduct._id}`); //Revalidate the products API endpoint
        }

    } catch (error: any) {
        throw new Error(`Failed to create/update product: ${error.message}`)
    }
}