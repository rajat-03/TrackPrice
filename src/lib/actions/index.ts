"use server"

import { scrapeAmazonProduct } from "../scraper";

//Product page scraping logic
export const scrapeAndStoreProduct = async (productUrl: string) => {
    if (!productUrl) return;

    try {
        //Scrape is done by the function scrapeAmazonProduct in lib/scraper/index.ts
        const scrapedProduct = await scrapeAmazonProduct(productUrl);

        if(!scrapedProduct) return;
        

    } catch (error: any) {
        throw new Error(`Failed to create/update product: ${error.message}`)
    }
}