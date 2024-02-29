import axios from "axios";
import * as cheerio from "cheerio"; // used to parse the HTML and extract data from it
import { extractCurrency, extractDescription, extractPrice, extractReviewsCount, extractStarRating } from "../utils";

export async function scrapeAmazonProduct(productUrl: string) {
    if (!productUrl) return;

    // BrighData proxy configuration
    const username = String(process.env.BRIGHT_DATA_USERNAME);
    const password = String(process.env.BRIGHT_DATA_PASSWORD);
    const port = 22225;
    const session_id = (Math.random() * 1000000) | 0; // random session ID

    // Options used for the request to the proxy server
    const options = {
        auth: {
            username: `${username}-session-${session_id}`, // session based username
            password,
        },
        host: 'brd.superproxy.io',
        port,
        rejectUnauthorized: false,
    }

    try {
        //fetch the product page
        const response = await axios.get(productUrl, options);
        const $ = cheerio.load(response.data); // parse the HTML using cheerio

        // Extract the data from the HTML
        const title = $('#productTitle').text().trim();
        const currentPrice = extractPrice(
            $('.priceToPay span.a-price-whole'),
            $('a.size.base.a-color-price'),
            $('.a-button-selected .a-color-base'),
            $('.a-price.a-text-price')
            // these are the selectors for the price on the Amazon product page
        );
        const originialPrice = extractPrice(
            $('#priceblock_ourprice'),
            $('.a-price.a-text-price span.a-offscreen'),
            $('#listPrice'),
            $('#priceblock_dealprice'),
            $('.a-size-base.a-color-base')
            // these are the selectors for the original price on the Amazon product page
        )

        // check if the product is out of stock
        const outOfStock = $('#availability span').text().trim() === 'Currently unavailable.'; 

        const images = $('#landingImage').attr('data-a-dynamic-image') ||
        $('#imgBlkFront').attr('data-a-dynamic-image') || '{}';

        // parse the JSON and extract the image URLs
        const imageUrls = Object.keys(JSON.parse(images)); 

        const currency = extractCurrency($('.a-price-symbol')); // code written in lib/utils.ts

        const discountRate = $('.savingsPercentage').text().replace(/[-%]/g, '');

        //console.log({ title, currentPrice, originialPrice, outOfStock, imageUrls,currency ,discountRate})

        const description = await extractDescription($)

        const category = $('#wayfinding-breadcrumbs_feature_div ul.a-unordered-list li:last-child a').text().trim();

        const reviewsCount = extractReviewsCount($('#acrCustomerReviewText'));

        const starRating = extractStarRating($);

        //construct data object with scraped information
        const data = {
            url: productUrl,
            title,
            currency: currency || '₹',
            image: imageUrls[0],
            currentPrice: Number(currentPrice) || Number(originialPrice),
            originalPrice: Number(originialPrice),
            priceHistory: [],
            discountRate: Number(discountRate),
            category: category|| 'category',
            reviewsCount: reviewsCount,
            stars: starRating,
            isOutOfStock: outOfStock,
            description,
            lowestPrice: Number(currentPrice) || Number(originialPrice),
            highestPrice: Number(originialPrice) || Number(currentPrice),
            averagePrice: Number(currentPrice) || Number(originialPrice),
        }

        //console.log(data);
        return data;

    } catch (error: any) {
        throw new Error(`Failed to scrape product: ${error.message}`)
    }
}