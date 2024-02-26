"use client"

import { scrapeAndStoreProduct } from "@/lib/actions";
import { FormEvent, useState } from "react"

//function to check if the link is a valid amazon link
const isValidAmazonUrl = (url: string) => {
    try {
        const parsedUrl = new URL(url);
        const hostname = parsedUrl.hostname;

        if (hostname.includes('amazon.com') ||
            hostname.includes('amazon.') ||
            hostname.endsWith('amazon')) {
            return true;
        }

    } catch (error) {
        console.error("Link is not valid", error);
        return false;
    }
    return false;
}

const Searchbar = () => {
    //store link given in input
    const [searchPrompt, setSearchPrompt] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        //check if the link is valid
        const isValidLink = isValidAmazonUrl(searchPrompt);

        if (!isValidLink) {
            return alert("Please enter a valid Amazon link")
        }

        //if the link is valid
        try {
            setIsLoading(true);

            //Scrape the data from product page
            //logic coded in lib/actions/index.ts
            const product = await scrapeAndStoreProduct(searchPrompt);


        } catch (error) {
            console.log("Error in fetching data from link", error);
        } finally {
            setIsLoading(false);
        }

    }

    return (
        <form
            className='flex flex-wrap gap-4 mt-12'
            onSubmit={handleSubmit}
        >

            <input
                type="text"
                value={searchPrompt}
                onChange={(e) => setSearchPrompt(e.target.value)}
                placeholder="Enter product link"
                className="searchbar-input"
            />

            <button
                type="submit"
                className="searchbar-btn"
                disabled={searchPrompt === '' || isLoading} //if inputBox is empty then button is disabled
            >
                {isLoading ? 'Searching...' : 'Search'}
            </button>
        </form>
    )
}

export default Searchbar