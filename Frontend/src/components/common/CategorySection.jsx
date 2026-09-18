import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { productApi } from "@/api/product.api";
import { ProductGrid } from "@/components/product/ProductGrid";

export function CategorySection({ category }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // load category products
  useEffect(() => {
    let active = true;
    setLoading(true);

    productApi
      .getProducts({ category: category._id, limit: 12, sort: "popular" })
      .then(({ data }) => {
        if (active) setProducts(data.products || []);
      })
      .catch(() => {})
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [category._id]);

  if (!loading && products.length === 0) return null;

  return (
    <section className="py-6">
      {/* category header */}
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h2 className="text-xl font-bold sm:text-2xl">{category.name}</h2>
          <p className="text-sm text-muted-foreground">Handpicked {category.name.toLowerCase()} just for you</p>
        </div>
        <Link to={`/category/${category.slug}`} className="flex items-center gap-1 text-sm font-semibold text-primary whitespace-nowrap hover:underline">
          View All <ArrowRight size={15} />
        </Link>
      </div>

      {/* product grid */}
      <ProductGrid products={products} loading={loading} columns="grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6" />
    </section>
  );
}