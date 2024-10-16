
import { getAllProducts } from "../lib/actions/index"
import Image from "next/image"
import Searchbar from "../components/Searchbar";
import HeroCarousel from "../components/HeroCarousel";
import ProductCard from "../components/ProductCard";


const Home = async () => {

  const allProducts = await getAllProducts();

  return (
    <>
      {/* first section */}
      <section className="px-6 md:px-20 py-24">
        <div className="flex max-xl:flex-col gap-16">
          <div className="flex flex-col justify-center">

            <p className="small-text">
              Smart Shopping Starts Here:
              <Image
                src="/assets/icons/arrow-right.svg"
                alt="arrow-right"
                width={16}
                height={16}
              />
            </p>

            <h1 className="head-text">
              Unleash the Power of
              <span className="text-primary"> TrackPrice</span>
            </h1>

            <p className="mt-6">
              Powerful, self-serve product and growth analytics to help you convert, engage, and retain more.
            </p>

            <Searchbar />

          </div>

          <HeroCarousel />

        </div>
      </section>

      {/* Trending section */}
      <section className="trending-section">
        <h2 className="section-text">Items You May Like</h2>

        <div className="flex flex-wrap gap-x-8 gap-y-16">

          {allProducts?.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}


        </div>

      </section>
    </>
  )
}

export default Home