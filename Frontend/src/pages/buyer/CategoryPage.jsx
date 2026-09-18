import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { SlidersHorizontal } from "lucide-react";
import { categoryApi } from "@/api/category.api";
import { productApi } from "@/api/product.api";
import { FilterSidebar } from "@/components/product/FilterSidebar";
import { LoadMoreButton, ProductGrid } from "@/components/product/ProductGrid";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";

const LIMIT = 20;

export default function CategoryPage() {
  const { slug } = useParams();
  const [category, setCategory] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [initializing, setInitializing] = useState(true);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({ sort: "newest" });
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // load category
  useEffect(() => {
    setInitializing(true);
    setFilters({ sort: "newest" });

    categoryApi
      .getCategories()
      .then(({ data }) => {
        const found = (data.categories || []).find((c) => c.slug === slug);
        setCategory(found || null);

        if (found) {
          categoryApi
            .getSubcategories(found._id)
            .then(({ data: subData }) => {
              setSubcategories(subData.subcategories || []);
            })
            .catch(() => setSubcategories([]));
        }
      })
      .finally(() => setInitializing(false));
  }, [slug]);

  // fetch products
  const fetchProducts = useCallback(
    async (pageNum) => {
      if (!category) return null;

      const { data } = await productApi.getProducts({
        category: category._id,
        subcategory: filters.subcategory,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        sort: filters.sort,
        page: pageNum,
        limit: LIMIT,
      });

      return data;
    },
    [category, filters]
  );

  // load products
  useEffect(() => {
    if (!category) return;

    setLoading(true);
    setPage(1);

    fetchProducts(1)
      .then((data) => {
        setProducts(data.products || []);
        setHasMore(data.pagination?.hasNextPage);
        setTotal(data.pagination?.totalProducts || 0);
      })
      .finally(() => setLoading(false));

    // eslint-disable-next-line
  }, [category, filters]);

  // load more
  const handleLoadMore = async () => {
    setLoadingMore(true);

    try {
      const nextPage = page + 1;
      const data = await fetchProducts(nextPage);

      setProducts((prev) => [...prev, ...(data.products || [])]);
      setHasMore(data.pagination?.hasNextPage);
      setPage(nextPage);
    } finally {
      setLoadingMore(false);
    }
  };

  const updateFilters = (partial) => setFilters((prev) => ({ ...prev, ...partial }));
  const resetFilters = () => setFilters({ sort: "newest" });

  if (initializing) return <Spinner />;

  if (!category) {
    return (
      <div className="px-4 md:px-20 py-24 text-center">
        <h2 className="text-2xl font-bold">Category not found</h2>
      </div>
    );
  }

  return (
    <div className="py-8 px-4 md:px-20">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">{category.name}</h1>
          <p className="text-sm text-muted-foreground">{total} products found</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="lg:hidden" onClick={() => setMobileFiltersOpen(true)}>
            <SlidersHorizontal size={14} /> Filters
          </Button>

          <Select value={filters.sort} onValueChange={(v) => updateFilters({ sort: v })}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="rating">Top Rated</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-6">
        <FilterSidebar
          subcategories={subcategories}
          filters={filters}
          onChange={updateFilters}
          onReset={resetFilters}
          open={mobileFiltersOpen}
          onClose={() => setMobileFiltersOpen(false)}
        />

        <div className="flex-1">
          <ProductGrid products={products} loading={loading} columns="grid-cols-2 sm:grid-cols-3 xl:grid-cols-4" />
          <LoadMoreButton onClick={handleLoadMore} loading={loadingMore} hasMore={hasMore} />
        </div>
      </div>
    </div>
  );
}