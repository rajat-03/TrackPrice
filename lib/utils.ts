import { PriceHistoryItem, Product } from "../types"

const Notification = {
  WELCOME: 'WELCOME',
  CHANGE_OF_STOCK: 'CHANGE_OF_STOCK',
  LOWEST_PRICE: 'LOWEST_PRICE',
  THRESHOLD_MET: 'THRESHOLD_MET',
}

const THRESHOLD_PERCENTAGE = 40;

export function extractPrice(...elements: any) {
  for (const element of elements) {
    // Ensure that the element is not empty and contains text
    const priceText = element.text().trim();

    if (priceText) {
      // Remove non-numeric characters except the decimal point
      const cleanPrice = priceText.replace(/[^\d.,]/g, '');

      // Handle cases where prices contain commas, by removing commas
      const priceWithDot = cleanPrice.replace(/,/g, '');

      // Try to extract a valid price format with two decimal points if present
      let firstPrice = priceWithDot.match(/\d+\.\d{2}/)?.[0];

      // If no valid decimal price found, extract only digits
      if (!firstPrice) {
        firstPrice = priceWithDot.match(/\d+/)?.[0]; // Extract just the numeric part if no decimal
      }

      // Return the first valid price found
      if (firstPrice) {
        return firstPrice;
      }
    }
  }
  // Return empty string if no valid price is found
  return '';
}

// Extracts and returns the currency symbol from an element.
export function extractCurrency(element: any) {
  const currencyText = element.text().trim().slice(0, 1);
  return currencyText ? currencyText : "";
}

//Extracts and returns the number of reviews from an element.
export function extractReviewsCount(element: any): number {
  const reviewsCountText = element.text().replace(/,/g, '');
  return Number(reviewsCountText.match(/\d+/)?.[0]) || 0;
}

export function extractStarRating($: any){
  const starRatingText = $('.a-declarative .a-size-base.a-color-base').text().trim();
  const starRatingMatch = starRatingText.match(/\d+(\.\d+)?/);
  const starRating = starRatingMatch ? parseFloat(starRatingMatch[0]) : 0;
  return Number(starRating);
}

// Extracts description from two possible elements from amazon
export async function extractDescription($: any) {
  const data = $('#feature-bullets ul.a-unordered-list.a-vertical.a-spacing-mini li')
    .map(function(this: any) {
      return ' • ' + $(this).text().trim() + '\n';
    })
    .get().join('');

  return data;
}

export function getHighestPrice(priceList: PriceHistoryItem[]) {
  let highestPrice = priceList[0];

  for (let i = 0; i < priceList.length; i++) {
    if (priceList[i].price > highestPrice.price) {
      highestPrice = priceList[i];
    }
  }

  return highestPrice.price;
}

export function getLowestPrice(priceList: PriceHistoryItem[]) {
  let lowestPrice = priceList[0];

  for (let i = 0; i < priceList.length; i++) {
    if (priceList[i].price < lowestPrice.price) {
      lowestPrice = priceList[i];
    }
  }

  return lowestPrice.price;
}

export function getAveragePrice(priceList: PriceHistoryItem[]) {
  const sumOfPrices = priceList.reduce((acc, curr) => acc + curr.price, 0);
  const averagePrice = sumOfPrices / priceList.length || 0;

  return averagePrice;
}

export const getEmailNotifType = (
  scrapedProduct: Product,
  currentProduct: Product
) => {
  const lowestPrice = getLowestPrice(currentProduct.priceHistory);

  if (scrapedProduct.currentPrice < lowestPrice) {
    return Notification.LOWEST_PRICE as keyof typeof Notification;
  }
  if (!scrapedProduct.isOutOfStock && currentProduct.isOutOfStock) {
    return Notification.CHANGE_OF_STOCK as keyof typeof Notification;
  }
  if (scrapedProduct.discountRate >= THRESHOLD_PERCENTAGE) {
    return Notification.THRESHOLD_MET as keyof typeof Notification;
  }

  return null;
};

export const formatNumber = (num: number = 0) => {
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};