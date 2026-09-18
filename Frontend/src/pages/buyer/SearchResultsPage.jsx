import React, { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, Search } from "lucide-react";
import { productApi } from "@/api/product.api";
import { FilterSidebar } from "@/components/product/FilterSidebar";
import { ProductGrid, LoadMoreButton } from "@/components/product/ProductGrid";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const LIMIT = 20;

export default function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({ sort: "newest" });
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // reset filters
  useEffect(() => {
    setFilters({ sort: "newest" });
  }, [query]);

  // fetch products
  const fetchProducts = useCallback(
    async (pageNum) => {
      const { data } = await productApi.getProducts({
        search: query,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        sort: filters.sort,
        page: pageNum,
        limit: LIMIT,
      });

      return data;
    },
    [query, filters]
  );

  // load products
  useEffect(() => {
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
  }, [query, filters]);

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

  // update filters
  const updateFilters = (partial) => setFilters((prev) => ({ ...prev, ...partial }));

  // reset filters
  const resetFilters = () => setFilters({ sort: "newest" });

  return (
    <div className="py-8 px-4 md:px-20">
      {/* header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold sm:text-3xl">
            <Search size={22} className="text-primary" /> Results for "{query}"
          </h1>
          <p className="text-sm text-muted-foreground">{total} products found</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="lg:hidden" onClick={() => setMobileFiltersOpen(true)}>
            <SlidersHorizontal size={14} /> Filters
          </Button>

          <Select value={filters.sort} onValueChange={(value) => updateFilters({ sort: value })}>
            <SelectTrigger className="w-44"><SelectValue placeholder="Sort by" /></SelectTrigger>
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
        {/* filters */}
        <FilterSidebar
          subcategories={[]}
          filters={filters}
          onChange={updateFilters}
          onReset={resetFilters}
          open={mobileFiltersOpen}
          onClose={() => setMobileFiltersOpen(false)}
        />

        {/* products */}
        <div className="flex-1">
          <ProductGrid products={products} loading={loading} columns="grid-cols-2 sm:grid-cols-3 xl:grid-cols-4" />
          <LoadMoreButton onClick={handleLoadMore} loading={loadingMore} hasMore={hasMore} />
        </div>
      </div>
    </div>
  );
}