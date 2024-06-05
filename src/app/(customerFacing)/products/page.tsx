import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard";
import db from "@/db/db";
import { cache } from "@/lib/cache";
import { Suspense } from "react";

export default function ProductsPage() {
    return (
        <div className="grid grid-cols-1 md:grid-locs-2 lg:grid-cols-3 gap-4">
                <Suspense fallback={
                    <>
                    <ProductCardSkeleton />
                    <ProductCardSkeleton />
                    <ProductCardSkeleton />
                    </>

                }>
                    <ProductsSuspense/>    
                </Suspense>
            </div>
    )
}


 async function ProductsSuspense () {
    const products = await getProducts()
    return products.map(product => <ProductCard key={product.id} {...product} />)

}

const  getProducts = cache(() => {

    return db.product.findMany( { where : {isAvailableForPurchase : true
    }, orderBy : {name : "asc" }}) 

}, ["/products", "getProducts"])