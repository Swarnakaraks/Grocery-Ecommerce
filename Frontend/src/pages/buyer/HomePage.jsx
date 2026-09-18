import React, { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Truck, ShieldCheck, RotateCcw, Headphones } from "lucide-react";
import { categoryApi } from "@/api/category.api";
import { productApi } from "@/api/product.api";
import { HeroBanner } from "@/components/common/HeroBanner";
import { CategoryStrip } from "@/components/common/CategoryStrip";
import { CategorySection } from "@/components/common/CategorySection";
import { ProductGrid, LoadMoreButton } from "@/components/product/ProductGrid";

const PAGE_SIZE = 40;

const perks = [
  [Truck, "Free Delivery", "On orders above Rs. 2000"],
  [ShieldCheck, "Secure Payment", "100% secure transactions"],
  [RotateCcw, "Easy Returns", "7-day return policy"],
  [Headphones, "24/7 Support", "Dedicated customer care"],
];

export default function HomePage() {
  const [categories, setCategories] = useState([]);
  const [catLoading, setCatLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // load categories
  useEffect(() => {
    categoryApi
      .getCategories()
      .then(({ data }) => setCategories((data.categories || []).filter((c) => !c.parent)))
      .catch(() => {})
      .finally(() => setCatLoading(false));
  }, []);

  // load products
  const loadProducts = useCallback(async (pageNum) => {
    const { data } = await productApi.getProducts({
      page: pageNum,
      limit: PAGE_SIZE,
      sort: "newest",
    });

    return data;
  }, []);

  // initial products
  useEffect(() => {
    setLoading(true);

    loadProducts(1)
      .then((data) => {
        setProducts(data.products || []);
        setHasMore(data.pagination?.hasNextPage);
      })
      .finally(() => setLoading(false));
  }, [loadProducts]);

  // load more
  const handleLoadMore = async () => {
    setLoadingMore(true);

    try {
      const nextPage = page + 1;
      const data = await loadProducts(nextPage);

      setProducts((prev) => [...prev, ...(data.products || [])]);
      setHasMore(data.pagination?.hasNextPage);
      setPage(nextPage);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="pb-16 px-5 md:px-20">
      <HeroBanner />

      {/* perks */}
      <div className="hidden mt-8 flex gap-3 overflow-x-auto pb-2 scrollbar-hide sm:grid sm:grid-cols-4 sm:overflow-visible sm:pb-0">
        {perks.map(([Icon, title, desc], i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="flex min-w-[calc((100vw-2rem-0.75rem)/2)] shrink-0 items-center gap-3 rounded-2xl border border-border bg-white p-3 shadow-sm sm:min-w-0 sm:shrink sm:p-4"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-primary">
              <Icon size={19} />
            </span>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{title}</p>
              <p className="truncate text-xs text-muted-foreground">{desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <CategoryStrip categories={categories} loading={catLoading} />

      {/* category sections */}
      {categories.slice(0, 4).map((item) => (
        <CategorySection key={item._id} category={item} />
      ))}

      {/* all products */}
      <section className="container py-8">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-bold sm:text-2xl">All Products</h2>
            <p className="text-sm text-muted-foreground">Explore our full collection</p>
          </div>
        </div>

        <ProductGrid products={products} loading={loading} />
        <LoadMoreButton onClick={handleLoadMore} loading={loadingMore} hasMore={hasMore} />
      </section>
    </div>
  );
}