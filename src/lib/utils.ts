//extract price from product page
export const extractPrice = (...elements: any) => { // ...elements is a rest parameter which is used to accept any number of arguments and store them in an array
    
    for (const element of elements) { // iterate through all the elements and return the price if found   
        const priceText = element.text().trim();

        if (priceText) return priceText.replace(/[^\d.]/g, ''); // remove all non-numeric characters from the price
    }
    return '';
}

//extract currency symbol from product page
export const extractCurrency = (element: any) => {

    const currenyText = element.text().trim().slice(0, 1);
    return currenyText? currenyText : '';
}