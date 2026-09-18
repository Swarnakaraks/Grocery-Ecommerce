import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Store, Heart, MapPin, Phone, Users, Calendar, ShoppingBag } from "lucide-react";
import { storeApi } from "@/api/store.api";
import { productApi } from "@/api/product.api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RatingStars } from "@/components/product/RatingStars";
import { Spinner } from "@/components/ui/spinner";
import { formatDate } from "@/lib/utils";

export default function StorePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, openAuthModal } = useAuth();

  const [store, setStore] = useState(null);
  const [storeProducts, setStoreProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [following, setFollowing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);

  // load store
  useEffect(() => {
    loadStore();
  }, [id]);

  // load catalog
  useEffect(() => {
    if (id) loadStoreProducts();
  }, [id]);

  // load products
  useEffect(() => {
    if (id) loadProducts();
  }, [id, selectedCategory, selectedSubcategory]);

  // store details
  const loadStore = async () => {
    try {
      setLoading(true);
      const { data } = await storeApi.getStoreById(id);
      setStore(data.store);
    } catch (error) {
      console.error("Load store error:", error);
      toast.error(error?.response?.data?.message || "Failed to load store");
    } finally {
      setLoading(false);
    }
  };

  // store catalog
  const loadStoreProducts = async () => {
    try {
      const { data } = await productApi.getProducts({ store: id, limit: 50 });
      setStoreProducts(data.products || []);
    } catch (error) {
      console.error("Load store catalog error:", error);
      setStoreProducts([]);
    }
  };

  // filtered products
  const loadProducts = async () => {
    try {
      setProductsLoading(true);

      const params = { store: id, limit: 50 };
      if (selectedCategory) params.category = selectedCategory._id;
      if (selectedSubcategory) params.subcategory = selectedSubcategory._id;

      const { data } = await productApi.getProducts(params);
      setProducts(data.products || []);
    } catch (error) {
      console.error("Load store products error:", error);
      toast.error(error?.response?.data?.message || "Failed to load store products");
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  };

  // categories
  const categories = useMemo(() => {
    const categoryMap = new Map();

    storeProducts.forEach((product) => {
      const category = product.category;
      if (!category?._id) return;
      if (!categoryMap.has(category._id)) categoryMap.set(category._id, category);
    });

    return Array.from(categoryMap.values());
  }, [storeProducts]);

  // subcategories
  const subcategories = useMemo(() => {
    if (!selectedCategory) return [];

    const subcategoryMap = new Map();

    storeProducts.forEach((product) => {
      const subcategory = product.subcategory;
      if (!subcategory?._id) return;

      if (subcategory.parent && String(subcategory.parent) !== String(selectedCategory._id)) return;
      if (!subcategoryMap.has(subcategory._id)) subcategoryMap.set(subcategory._id, subcategory);
    });

    return Array.from(subcategoryMap.values());
  }, [storeProducts, selectedCategory]);

  // follow store
  const toggleFollow = async () => {
    if (!isAuthenticated) {
      openAuthModal("login");
      return;
    }

    setBusy(true);

    try {
      if (following) {
        await storeApi.unfollowStore(id);
        setFollowing(false);
        toast.success("Unfollowed store");
      } else {
        await storeApi.followStore(id);
        setFollowing(true);
        toast.success("Following store");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Action failed");
    } finally {
      setBusy(false);
    }
  };

  // category filter
  const handleCategoryClick = (category) => {
    if (selectedCategory?._id === category._id) {
      setSelectedCategory(null);
      setSelectedSubcategory(null);
      return;
    }

    setSelectedCategory(category);
    setSelectedSubcategory(null);
  };

  // subcategory filter
  const handleSubcategoryClick = (subcategory) => {
    if (selectedSubcategory?._id === subcategory._id) {
      setSelectedSubcategory(null);
      return;
    }

    setSelectedSubcategory(subcategory);
  };

  // all categories
  const handleAllCategories = () => {
    setSelectedCategory(null);
    setSelectedSubcategory(null);
  };

  // image url
  const getImageUrl = (image) => {
    if (!image) return null;
    if (typeof image === "string") return image;
    return image.url || image.secure_url || null;
  };

  // product image
  const getProductImage = (product) => {
    if (!product?.images?.length) return null;

    const image = product.images[0];
    if (typeof image === "string") return image;

    return image?.url || image?.secure_url || null;
  };

  // product price
  const getProductPrice = (product) => product?.discountPrice ?? product?.price ?? 0;

  // open product
  const openProduct = (product) => {
    if (!product?.slug) return;
    navigate(`/products/${product.slug}`);
  };

  if (loading) return <Spinner />;

  if (!store) {
    return (
      <div className="container py-24 text-center">
        <h2 className="text-2xl font-bold">Store not found</h2>
      </div>
    );
  }

  return (
    <div>
      {/* store banner */}
      <div className="h-48 w-full bg-gradient-to-br from-brand-600 to-brand-400 sm:h-64" style={store.banner?.url ? { backgroundImage: `url(${store.banner.url})`, backgroundSize: "cover", backgroundPosition: "center" } : {}} />

      <div className="container -mt-14 pb-10">
        {/* store header */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-border bg-white p-6 shadow-md">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-end">
            <Avatar className="h-24 w-24 border-4 border-white shadow-lg -mt-16 sm:-mt-20">
              <AvatarImage src={store.logo?.url} />
              <AvatarFallback className="text-2xl"><Store /></AvatarFallback>
            </Avatar>

            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl font-bold">{store.storeName}</h1>

              <div className="mt-1 flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground sm:justify-start">
                <RatingStars rating={store.rating?.average || 0} size={14} />
                <span className="flex items-center gap-1"><Users size={13} /> {store.followerCount} followers</span>
                <span className="flex items-center gap-1"><Calendar size={13} /> Since {formatDate(store.createdAt)}</span>
              </div>
            </div>

            <Button onClick={toggleFollow} disabled={busy} variant={following ? "outline" : "default"}>
              <Heart size={15} className={following ? "fill-red-500 text-red-500" : ""} />
              {following ? "Following" : "Follow Store"}
            </Button>
          </div>

          {store.storeDescription && <p className="mt-5 max-w-2xl text-sm text-foreground/80">{store.storeDescription}</p>}

          <div className="mt-5 flex flex-wrap gap-4 border-t border-border pt-4 text-sm text-muted-foreground">
            {store.address && <span className="flex items-center gap-1.5"><MapPin size={14} /> {store.address}</span>}
            {store.phone && <span className="flex items-center gap-1.5"><Phone size={14} /> {store.phone}</span>}
          </div>
        </motion.div>

        {/* categories */}
        <div className="mt-10">
          <div className="mb-5">
            <h2 className="text-2xl font-bold">Shop by Category</h2>
            <p className="mt-1 text-sm text-muted-foreground">Explore products from {store.storeName}</p>
          </div>

          {categories.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border py-12 text-center">
              <ShoppingBag className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
              <p className="font-medium text-muted-foreground">No categories available</p>
            </div>
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-3">
              {/* all products */}
              <button type="button" onClick={handleAllCategories} className={`group flex min-w-[90px] shrink-0 flex-col items-center gap-1.5 rounded-xl border p-2 transition ${!selectedCategory ? "border-brand-500 bg-brand-50 shadow-sm" : "border-border bg-white hover:border-brand-300 hover:shadow-sm"}`}>
                <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-lg bg-slate-100"><ShoppingBag className="h-6 w-6 text-muted-foreground" /></div>
                <span className="line-clamp-1 max-w-[78px] text-center text-xs font-medium">All Products</span>
              </button>

              {categories.map((category) => (
                <button type="button" key={category._id} onClick={() => handleCategoryClick(category)} className={`group flex min-w-[90px] shrink-0 flex-col items-center gap-1.5 rounded-xl border p-2 transition ${selectedCategory?._id === category._id ? "border-brand-500 bg-brand-50 shadow-sm" : "border-border bg-white hover:border-brand-300 hover:shadow-sm"}`}>
                  <div className="h-14 w-14 overflow-hidden rounded-lg bg-slate-100">
                    {getImageUrl(category.image) ? <img src={getImageUrl(category.image)} alt={category.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" /> : <div className="flex h-full w-full items-center justify-center"><ShoppingBag className="h-6 w-6 text-muted-foreground/50" /></div>}
                  </div>
                  <span className="line-clamp-1 max-w-[78px] text-center text-xs font-medium">{category.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* subcategories */}
        {selectedCategory && subcategories.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
            <div className="mb-3">
              <h3 className="text-lg font-semibold">{selectedCategory.name} Subcategories</h3>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-3">
              {subcategories.map((subcategory) => (
                <button type="button" key={subcategory._id} onClick={() => handleSubcategoryClick(subcategory)} className={`group flex min-w-[82px] shrink-0 flex-col items-center gap-1.5 rounded-xl border p-2 transition ${selectedSubcategory?._id === subcategory._id ? "border-brand-500 bg-brand-50 shadow-sm" : "border-border bg-white hover:border-brand-300 hover:shadow-sm"}`}>
                  <div className="h-12 w-12 overflow-hidden rounded-lg bg-slate-100">
                    {getImageUrl(subcategory.image) ? <img src={getImageUrl(subcategory.image)} alt={subcategory.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" /> : <div className="flex h-full w-full items-center justify-center"><ShoppingBag className="h-5 w-5 text-muted-foreground/50" /></div>}
                  </div>
                  <span className="line-clamp-1 max-w-[70px] text-center text-[11px] font-medium">{subcategory.name}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* store products */}
        <div className="mt-10">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-2xl font-bold"><ShoppingBag size={22} /> Store Products</h2>
              <p className="mt-1 text-sm text-muted-foreground">{selectedSubcategory ? `Showing ${selectedSubcategory.name} products` : selectedCategory ? `Showing ${selectedCategory.name} products` : `All products from ${store.storeName}`}</p>
            </div>
          </div>

          {productsLoading ? (
            <div className="flex min-h-60 items-center justify-center"><Spinner /></div>
          ) : products.length === 0 ? (
            <div className="flex min-h-60 flex-col items-center justify-center rounded-2xl border border-dashed border-border text-center">
              <ShoppingBag className="mb-3 h-12 w-12 text-muted-foreground/40" />
              <h3 className="font-semibold">No products found</h3>
              <p className="mt-1 text-sm text-muted-foreground">This store does not have products in this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {products.map((product) => {
                const image = getProductImage(product);

                return (
                  <motion.button type="button" key={product._id} onClick={() => openProduct(product)} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="group overflow-hidden rounded-2xl border border-border bg-white text-left shadow-sm transition-shadow hover:shadow-md">
                    <div className="aspect-square overflow-hidden bg-slate-100">
                      {image ? <img src={image} alt={product.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" /> : <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">No Image</div>}
                    </div>

                    <div className="p-3">
                      <h3 className="line-clamp-2 min-h-10 text-sm font-semibold">{product.name}</h3>

                      <div className="mt-2 flex items-center justify-between gap-2">
                        <span className="text-base font-bold">Rs. {getProductPrice(product)}</span>
                        <RatingStars rating={product.rating?.average || 0} size={12} />
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}