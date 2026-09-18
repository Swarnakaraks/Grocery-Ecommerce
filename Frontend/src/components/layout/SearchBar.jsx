import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, TrendingUp, Loader2 } from "lucide-react";
import { productApi } from "@/api/product.api";
import { cn, formatCurrency, getImageUrl, getSellingPrice } from "@/lib/utils";

const RECENT_KEY = "freshmart_recent_searches";

export function SearchBar({ className, mobile = false, onNavigate }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState([]);
  const wrapRef = useRef(null);
  const debounceRef = useRef(null);
  const navigate = useNavigate();

  // load recent searches
  useEffect(() => {
    try {
      setRecent(JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"));
    } catch {
      setRecent([]);
    }
  }, []);

  // close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // fetch suggestions
  const fetchSuggestions = useCallback((value) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!value.trim()) {
      setSuggestions([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);

      try {
        const { data } = await productApi.getProducts({
          search: value,
          limit: 7,
        });
        setSuggestions(data.products || []);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, []);

  // search input
  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    fetchSuggestions(value);
  };

  // save recent search
  const saveRecent = (term) => {
    if (!term.trim()) return;

    const next = [term, ...recent.filter((r) => r !== term)].slice(0, 6);
    setRecent(next);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  };

  // remove one recent search
  const removeRecent = (term) => {
    const next = recent.filter((r) => r !== term);

    setRecent(next);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  };

  // remove all recent searches
  const clearRecent = () => {
    setRecent([]);
    localStorage.removeItem(RECENT_KEY);
  };

  // search results
  const goToSearch = (term) => {
    const t = term ?? query;

    if (!t.trim()) return;

    saveRecent(t);
    setOpen(false);
    onNavigate?.();
    navigate(`/search?q=${encodeURIComponent(t)}`);
  };

  // product details
  const goToProduct = (product) => {
    saveRecent(product.name);
    setOpen(false);
    onNavigate?.();
    navigate(`/products/${product.slug || product._id}`);
  };

  return (
    <div ref={wrapRef} className={cn("relative w-full", className)}>
      <div className="flex items-center rounded-full border-2 border-primary/20 bg-white shadow-sm transition-all focus-within:border-primary focus-within:shadow-md">
        <Search className="ml-4 h-4 w-4 shrink-0 text-muted-foreground" />

        <input
          value={query}
          onChange={handleChange}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => e.key === "Enter" && goToSearch()}
          placeholder="Search for products, brands and more..."
          className="w-full bg-transparent px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground"
        />

        {query && (
          <button
            onClick={() => {
              setQuery("");
              setSuggestions([]);
            }}
            className="pr-2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        <button
          onClick={() => goToSearch()}
          className="mr-1 flex h-8 items-center gap-1 rounded-full bg-primary px-4 text-xs font-semibold text-white hover:bg-brand-600"
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            "Search"
          )}
        </button>
      </div>

      {open && (query.trim() || recent.length > 0) && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 max-h-[70vh] overflow-y-auto rounded-2xl border border-border bg-white p-2 shadow-2xl">
          {/* recent searches */}
          {!query.trim() && recent.length > 0 && (
            <div className="px-2 py-1.5">
              <div className="mb-1 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Recent searches
                </p>

                <button
                  type="button"
                  onClick={clearRecent}
                  className="text-xs font-medium text-primary transition-colors hover:text-brand-600"
                >
                  Remove search history
                </button>
              </div>

              {recent.map((r, i) => (
                <div
                  key={i}
                  className="group flex w-full items-center rounded-lg hover:bg-secondary"
                >
                  <button
                    type="button"
                    onClick={() => goToSearch(r)}
                    className="flex min-w-0 flex-1 items-center gap-2 px-2 py-2 text-left text-sm"
                  >
                    <TrendingUp className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span className="truncate">{r}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => removeRecent(r)}
                    className="mr-2 rounded-full p-1 text-muted-foreground opacity-70 transition-all hover:bg-white hover:text-foreground group-hover:opacity-100"
                    aria-label={`Remove ${r} from search history`}
                    title="Remove from search history"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* no results */}
          {query.trim() && suggestions.length === 0 && !loading && (
            <p className="px-3 py-4 text-center text-sm text-muted-foreground">
              No products found for "{query}"
            </p>
          )}

          {/* suggestions */}
          {suggestions.map((product) => (
            <button
              key={product._id}
              onClick={() => goToProduct(product)}
              className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left hover:bg-secondary"
            >
              <img
                src={getImageUrl(product.images)}
                alt={product.name}
                className="h-10 w-10 shrink-0 rounded-lg object-cover"
                onError={(e) =>
                  (e.currentTarget.src = "/placeholder-product.svg")
                }
              />

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{product.name}</p>
                <p className="text-xs text-muted-foreground">
                  {product.category?.name}
                </p>
              </div>

              <span className="shrink-0 text-sm font-semibold text-primary">
                {formatCurrency(getSellingPrice(product))}
              </span>
            </button>
          ))}

          {/* all results */}
          {query.trim() && (
            <button
              onClick={() => goToSearch()}
              className="mt-1 flex w-full items-center gap-2 rounded-lg border-t border-border px-2 py-2.5 text-left text-sm font-medium text-primary hover:bg-secondary"
            >
              <Search className="h-3.5 w-3.5" />
              See all results for "{query}"
            </button>
          )}
        </div>
      )}
    </div>
  );
}
