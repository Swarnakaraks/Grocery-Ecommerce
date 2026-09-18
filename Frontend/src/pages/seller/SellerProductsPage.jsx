import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import {
  Package,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  ImagePlus,
  X,
  Loader2,
  UploadCloud,
  Image as ImageIcon,
  CheckCircle2,
} from "lucide-react";

import { productApi } from "@/api/product.api";
import { categoryApi } from "@/api/category.api";
import { useAuth } from "@/context/AuthContext";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/common/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { formatCurrency, slugify } from "@/lib/utils";

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  category: "",
  subcategory: "",
  price: "",
  discountPrice: "",
  stock: "",
  unit: "",
  brand: "",
};

const MAX_IMAGES = 6;

export default function SellerProductsPage() {
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploadingId, setUploadingId] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  // load products
  const loadMyProducts = async () => {
    if (!user?._id) return;

    setLoading(true);

    try {
      let all = [];

      for (let page = 1; page <= 5; page++) {
        const { data } = await productApi.getAllProducts({ page, limit: 50 });

        all = all.concat(data.products || []);

        if (!data.pagination?.hasNextPage) break;
      }

      const myProducts = all.filter(
        (p) =>
          String(p.seller) === String(user._id) ||
          String(p.seller?._id) === String(user._id)
      );

      setProducts(myProducts);
    } catch (err) {
      console.error("Load products error:", err);
      toast.error(err?.response?.data?.message || "Could not load products");
    } finally {
      setLoading(false);
    }
  };

  // load categories
  const loadCategories = async () => {
    try {
      const { data } = await categoryApi.getCategories();
      setCategories(data.categories || []);
    } catch (err) {
      console.error("Load categories error:", err);
      toast.error(err?.response?.data?.message || "Could not load categories");
    }
  };

  // initial load
  useEffect(() => {
    if (!user?._id) return;

    loadMyProducts();
    loadCategories();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]);

  // load subcategories
  useEffect(() => {
    if (!form.category) {
      setSubcategories([]);
      return;
    }

    const loadSubcategories = async () => {
      try {
        const { data } = await categoryApi.getSubcategories(form.category);
        setSubcategories(data.subcategories || []);
      } catch (err) {
        console.error("Load subcategories error:", err);
        setSubcategories([]);
        toast.error(
          err?.response?.data?.message || "Could not load subcategories"
        );
      }
    };

    loadSubcategories();
  }, [form.category]);

  // create previews
  const createPreviewImages = (files) =>
    Array.from(files).map((file) => ({
      id: `${file.name}-${file.size}-${file.lastModified}-${Math.random()}`,
      file,
      preview: URL.createObjectURL(file),
    }));

  // revoke previews
  const revokePreviewUrls = (images) => {
    images.forEach((image) => {
      if (image.preview) URL.revokeObjectURL(image.preview);
    });
  };

  // create product
  const openCreate = () => {
    revokePreviewUrls(selectedImages);
    setForm({ ...emptyForm });
    setSubcategories([]);
    setEditingProduct(null);
    setSelectedImages([]);
    setExistingImages([]);
    setDialogOpen(true);
  };

  // edit product
  const openEdit = (p) => {
    revokePreviewUrls(selectedImages);

    const categoryId = p.category?._id || p.category || "";
    const subcategoryId = p.subcategory?._id || p.subcategory || "";

    setForm({
      name: p.name || "",
      slug: p.slug || "",
      description: p.description || "",
      category: categoryId,
      subcategory: subcategoryId,
      price: p.price ?? "",
      discountPrice: p.discountPrice ?? "",
      stock: p.stock ?? "",
      unit: p.unit || "",
      brand: p.brand || "",
    });

    setExistingImages(p.images || []);
    setSelectedImages([]);
    setEditingProduct(p);
    setDialogOpen(true);
  };

  // close dialog
  const handleDialogChange = (open) => {
    if (!open && !saving) {
      revokePreviewUrls(selectedImages);
      setSelectedImages([]);
      setExistingImages([]);
      setEditingProduct(null);
      setForm({ ...emptyForm });
    }

    setDialogOpen(open);
  };

  // name to slug
  const handleNameChange = (name) => {
    setForm((f) => ({
      ...f,
      name,
      slug: editingProduct ? f.slug : slugify(name),
    }));
  };

  // category change
  const handleCategoryChange = (categoryId) => {
    setForm((prev) => ({
      ...prev,
      category: categoryId,
      subcategory: "",
    }));

    setSubcategories([]);
  };

  // subcategory change
  const handleSubcategoryChange = (subcategoryId) => {
    setForm((prev) => ({
      ...prev,
      subcategory: subcategoryId,
    }));
  };

  // image selection
  const handleImageSelect = (files) => {
    if (!files?.length) return;

    const availableSlots =
      MAX_IMAGES - existingImages.length - selectedImages.length;

    if (availableSlots <= 0) {
      toast.error(`Maximum ${MAX_IMAGES} images allowed`);
      return;
    }

    const incomingFiles = Array.from(files);

    const validFiles = incomingFiles.filter((file) =>
      file.type.startsWith("image/")
    );

    if (validFiles.length !== incomingFiles.length) {
      toast.error("Only image files are allowed");
    }

    const limitedFiles = validFiles.slice(0, availableSlots);

    if (limitedFiles.length < validFiles.length) {
      toast.error(
        `You can add only ${availableSlots} more image${
          availableSlots > 1 ? "s" : ""
        }`
      );
    }

    const previews = createPreviewImages(limitedFiles);

    setSelectedImages((prev) => [...prev, ...previews]);
  };

  // remove selected image
  const removeSelectedImage = (id) => {
    setSelectedImages((prev) => {
      const image = prev.find((item) => item.id === id);

      if (image?.preview) URL.revokeObjectURL(image.preview);

      return prev.filter((item) => item.id !== id);
    });
  };

  // delete existing image
  const handleDeleteExistingImage = async (productId, imageId) => {
    try {
      const { data } = await productApi.deleteImage(productId, imageId);

      setExistingImages(data.images || []);

      setProducts((prev) =>
        prev.map((p) =>
          p._id === productId
            ? { ...p, images: data.images || [] }
            : p
        )
      );

      toast.success("Image removed");
    } catch (err) {
      console.error("Delete image error:", err);
      toast.error(
        err?.response?.data?.message || "Could not remove image"
      );
    }
  };

  // upload selected images
  const uploadSelectedImages = async (productId) => {
    if (!selectedImages.length) return null;

    const files = selectedImages.map((image) => image.file);

    setUploadingId(productId);

    try {
      const { data } = await productApi.uploadImages(productId, files);
      return data.images || [];
    } finally {
      setUploadingId(null);
    }
  };

  // create or update product
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.error("Please enter product name");
      return;
    }

    if (!form.category) {
      toast.error("Please select a category");
      return;
    }

    if (!form.price) {
      toast.error("Please enter product price");
      return;
    }

    if (
      form.stock === "" ||
      form.stock === null ||
      form.stock === undefined
    ) {
      toast.error("Please enter product stock");
      return;
    }

    const totalImages = existingImages.length + selectedImages.length;

    if (totalImages > MAX_IMAGES) {
      toast.error(`Maximum ${MAX_IMAGES} images allowed`);
      return;
    }

    setSaving(true);

    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      description: form.description.trim(),
      category: form.category,
      price: Number(form.price),
      stock: Number(form.stock),
      unit: form.unit.trim(),
      brand: form.brand.trim(),
      discountPrice:
        form.discountPrice === "" ? null : Number(form.discountPrice),
    };

    if (form.subcategory) {
      payload.subcategory = form.subcategory;
    }

    try {
      let productId;

      if (editingProduct) {
        await productApi.updateProduct(editingProduct._id, payload);

        productId = editingProduct._id;

        if (selectedImages.length) {
          await uploadSelectedImages(productId);
        }

        toast.success(
          selectedImages.length
            ? "Product and images updated successfully"
            : "Product updated successfully"
        );
      } else {
        const { data } = await productApi.createProduct(payload);

        productId = data.product?._id || data._id;

        if (productId && selectedImages.length) {
          await uploadSelectedImages(productId);
        }

        toast.success(
          selectedImages.length
            ? "Product and images added successfully"
            : "Product created successfully"
        );
      }

      revokePreviewUrls(selectedImages);

      setSelectedImages([]);
      setExistingImages([]);
      setDialogOpen(false);
      setForm({ ...emptyForm });
      setEditingProduct(null);

      await loadMyProducts();
    } catch (err) {
      console.error("Save product error:", err);

      toast.error(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Could not save product"
      );
    } finally {
      setSaving(false);
      setUploadingId(null);
    }
  };

  // delete product
  const handleDelete = async (id) => {
    try {
      await productApi.deleteProduct(id);

      toast.success("Product deleted");

      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.error("Delete product error:", err);

      toast.error(
        err?.response?.data?.message || "Could not delete product"
      );
    }
  };

  // toggle product status
  const handleToggleStatus = async (id) => {
    try {
      const { data } = await productApi.toggleStatus(id);

      toast.success(data.message);

      setProducts((prev) =>
        prev.map((p) =>
          p._id === id ? { ...p, isActive: data.isActive } : p
        )
      );
    } catch (err) {
      console.error("Toggle status error:", err);

      toast.error(
        err?.response?.data?.message || "Could not update status"
      );
    }
  };

  // upload product images
  const handleImageUpload = async (id, files) => {
    if (!files?.length) return;

    setUploadingId(id);

    try {
      const { data } = await productApi.uploadImages(id, files);

      setProducts((prev) =>
        prev.map((p) =>
          p._id === id ? { ...p, images: data.images } : p
        )
      );

      toast.success("Images uploaded successfully");
    } catch (err) {
      console.error("Image upload error:", err);

      toast.error(
        err?.response?.data?.message || "Could not upload images"
      );
    } finally {
      setUploadingId(null);
    }
  };

  // delete product image
  const handleDeleteImage = async (productId, imageId) => {
    try {
      const { data } = await productApi.deleteImage(productId, imageId);

      setProducts((prev) =>
        prev.map((p) =>
          p._id === productId ? { ...p, images: data.images } : p
        )
      );

      toast.success("Image removed");
    } catch (err) {
      console.error("Delete image error:", err);

      toast.error(
        err?.response?.data?.message || "Could not remove image"
      );
    }
  };

  return (
    <div className="min-h-screen space-y-6 bg-slate-50/40 pb-10">
      {/* page header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-600 to-teal-700 px-6 py-7 text-white shadow-lg sm:px-8"
      >
        <div className="relative z-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium backdrop-blur-md">
              <Package className="h-3.5 w-3.5" />
              Seller Products
            </div>

            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              My Products
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-emerald-50">
              Manage your products, update inventory, upload beautiful product
              images and control their visibility.
            </p>
          </div>

          <Button
            onClick={openCreate}
            className="group h-11 shrink-0 rounded-xl bg-white px-5 font-semibold text-emerald-700 shadow-md hover:scale-105 hover:bg-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>
      </motion.div>

      {/* product count */}
      {!loading && products.length > 0 && (
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              Your Products
            </p>
            <p className="text-xs text-slate-400">
              {products.length} {products.length === 1 ? "product" : "products"}{" "}
              listed
            </p>
          </div>
        </div>
      )}

      {/* loading */}
      {loading && (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-3xl border border-slate-200 bg-white p-5"
            >
              <div className="flex gap-4">
                <Skeleton className="h-20 w-20 rounded-2xl" />

                <div className="flex-1 space-y-3">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-4 w-28" />
                </div>

                <Skeleton className="h-9 w-24 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* empty state */}
      {!loading && products.length === 0 && (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <EmptyState
            icon={Package}
            title="No products listed yet"
            description="Add your first product to start selling"
            action={
              <Button onClick={openCreate} className="rounded-xl">
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            }
          />
        </div>
      )}

      {/* products */}
      {!loading && products.length > 0 && (
        <div className="space-y-4">
          <AnimatePresence>
            {products.map((p, index) => (
              <motion.div
                key={p._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ delay: index * 0.04 }}
                className="group overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:border-emerald-200 hover:shadow-md"
              >
                <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center">
                  {/* product image */}
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
                    <img
                      src={
                        p.images?.length
                          ? p.images[0].url
                          : "/placeholder-product.svg"
                      }
                      alt={p.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder-product.svg";
                      }}
                    />

                    {p.images?.length > 1 && (
                      <div className="absolute bottom-1 right-1 rounded-md bg-black/60 px-1.5 py-0.5 text-[9px] font-bold text-white">
                        +{p.images.length - 1}
                      </div>
                    )}
                  </div>

                  {/* product details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-bold text-slate-900">
                        {p.name}
                      </p>

                      <Badge
                        className={
                          p.isActive
                            ? "border-0 bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                            : "border-0 bg-slate-100 text-slate-500 hover:bg-slate-100"
                        }
                      >
                        {p.isActive ? "Active" : "Hidden"}
                      </Badge>
                    </div>

                    <p className="mt-1 text-xs text-slate-400">
                      {p.category?.name || "No category"}
                      {p.subcategory?.name && ` · ${p.subcategory.name}`}
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="font-bold text-emerald-600">
                        {formatCurrency(p.discountPrice || p.price)}
                      </span>

                      {p.discountPrice && p.discountPrice < p.price && (
                        <span className="text-xs text-slate-400 line-through">
                          {formatCurrency(p.price)}
                        </span>
                      )}

                      <span className="text-xs text-slate-400">
                        · Stock:{" "}
                        <span className="font-semibold text-slate-600">
                          {p.stock}
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* actions */}
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                          handleImageUpload(p._id, e.target.files);
                          e.target.value = "";
                        }}
                      />

                      <span className="flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-600 transition-colors hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600">
                        <ImagePlus className="h-3.5 w-3.5" />
                        {uploadingId === p._id ? "Uploading..." : "Images"}
                      </span>
                    </label>

                    <Button
                      size="sm"
                      variant="outline"
                      className="h-9 rounded-xl"
                      onClick={() => handleToggleStatus(p._id)}
                    >
                      {p.isActive ? (
                        <EyeOff className="h-3.5 w-3.5" />
                      ) : (
                        <Eye className="h-3.5 w-3.5" />
                      )}
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      className="h-9 rounded-xl"
                      onClick={() => openEdit(p)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-9 rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600"
                      onClick={() => handleDelete(p._id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                {/* image thumbnails */}
                {p.images?.length > 0 && (
                  <div className="flex gap-2 border-t border-slate-100 bg-slate-50/50 px-5 py-3">
                    {p.images.map((img) => (
                      <div
                        key={img._id}
                        className="group/image relative h-12 w-12 overflow-hidden rounded-lg border border-slate-200"
                      >
                        <img
                          src={img.url}
                          alt=""
                          className="h-full w-full object-cover"
                        />

                        <button
                          type="button"
                          onClick={() => handleDeleteImage(p._id, img._id)}
                          className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover/image:opacity-100"
                        >
                          <X className="h-4 w-4 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* create/edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={handleDialogChange}>
        <DialogContent className="mt-8 max-h-[92vh] max-w-xl overflow-hidden rounded-3xl border-0 p-0 shadow-2xl">
          {/* header */}
          <div className="px-6 py-5">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl font-bold text-slate-900">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  {editingProduct ? (
                    <Pencil className="h-4 w-4" />
                  ) : (
                    <Plus className="h-5 w-5" />
                  )}
                </span>

                {editingProduct ? "Edit Product" : "Add New Product"}
              </DialogTitle>

              <DialogDescription className="ml-11 text-xs text-slate-800">
                {editingProduct
                  ? "Update your product information and manage its images."
                  : "Add product details and beautiful images for your customers."}
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* form */}
          <form
            onSubmit={handleSubmit}
            className="max-h-[calc(92vh-145px)] overflow-y-auto"
          >
            <div className="mx-auto w-full max-w-2xl space-y-6 p-5 sm:p-6">
              {/* image upload */}
              <div className="rounded-2xl border border-emerald-300 bg-emerald-50/50 p-4 sm:p-5">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100">
                        <ImageIcon className="h-4 w-4 text-emerald-600" />
                      </div>

                      <h3 className="text-base font-semibold text-slate-900">
                        Product Images
                      </h3>
                    </div>

                    <p className="mt-1.5 text-sm leading-5 text-slate-800">
                      Add up to {MAX_IMAGES} images. The first image will be
                      your main product image.
                    </p>
                  </div>

                  <span className="shrink-0 rounded-full bg-white px-3 py-1.5 text-sm font-bold text-emerald-600 shadow-sm ring-1 ring-emerald-100">
                    {existingImages.length + selectedImages.length}/{MAX_IMAGES}
                  </span>
                </div>

                {/* upload area */}
                {existingImages.length + selectedImages.length < MAX_IMAGES && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      handleImageSelect(e.dataTransfer.files);
                    }}
                    className="group w-full rounded-2xl border-2 border-dashed border-emerald-200 bg-white px-5 py-6 text-center transition-all duration-200 hover:border-emerald-400 hover:bg-emerald-50/60"
                  >
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 transition-transform duration-200 group-hover:scale-105">
                      <UploadCloud className="h-6 w-6" />
                    </div>

                    <p className="mt-3 text-base font-semibold text-slate-800">
                      Click to upload or drag & drop
                    </p>

                    <p className="mt-1.5 text-sm text-slate-500">
                      PNG, JPG, JPEG, WEBP · Multiple images supported
                    </p>
                  </button>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    handleImageSelect(e.target.files);
                    e.target.value = "";
                  }}
                />

                {/* image previews */}
                {(existingImages.length > 0 || selectedImages.length > 0) && (
                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {/* existing images */}
                    {existingImages.map((image, index) => (
                      <motion.div
                        key={image._id || image.url}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
                      >
                        <img
                          src={image.url}
                          alt={`Product ${index + 1}`}
                          className="h-full w-full object-cover"
                        />

                        {index === 0 && (
                          <div className="absolute left-2 top-2 rounded-md bg-emerald-600 px-2 py-1 text-[10px] font-bold text-white shadow-sm">
                            MAIN
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteExistingImage(
                              editingProduct._id,
                              image._id
                            )
                          }
                          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white opacity-0 backdrop-blur-sm transition-all duration-200 hover:bg-red-500 group-hover:opacity-100"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </motion.div>
                    ))}

                    {/* new previews */}
                    {selectedImages.map((image, index) => (
                      <motion.div
                        key={image.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="group relative aspect-square overflow-hidden rounded-xl border-2 border-emerald-300 bg-white shadow-sm"
                      >
                        <img
                          src={image.preview}
                          alt={`Preview ${index + 1}`}
                          className="h-full w-full object-cover"
                        />

                        <div className="absolute left-2 top-2 rounded-md bg-emerald-600 px-2 py-1 text-[10px] font-bold text-white shadow-sm">
                          NEW
                        </div>

                        <button
                          type="button"
                          onClick={() => removeSelectedImage(image.id)}
                          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white opacity-0 shadow-sm transition-all duration-200 hover:bg-red-600 group-hover:opacity-100"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* upload note */}
                {selectedImages.length > 0 && (
                  <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-100/70 px-3.5 py-2.5 text-sm text-emerald-700">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>
                      {selectedImages.length} new{" "}
                      {selectedImages.length === 1 ? "image" : "images"} ready
                      to upload when you save.
                    </span>
                  </div>
                )}
              </div>

              {/* product information */}
              <div>
                <div className="mb-5">
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-1 rounded-full bg-emerald-500" />

                    <h3 className="text-lg font-bold text-slate-900">
                      Product Information
                    </h3>
                  </div>

                  <p className="mt-1.5 text-sm text-slate-800">
                    Enter the basic information about your product.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {/* product name */}
                  <div className="space-y-2 sm:col-span-2">
                    <Label className="text-sm font-semibold text-slate-800">
                      Product Name
                    </Label>

                    <Input
                      required
                      value={form.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="e.g. Fresh Red Apple"
                      className="h-11 rounded-xl border-slate-400 px-3.5 text-sm shadow-sm transition-all focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </div>

                  {/* slug */}
                  <div className="space-y-2 sm:col-span-2">
                    <Label className="text-sm font-semibold text-slate-800">
                      Slug
                    </Label>

                    <Input
                      required
                      value={form.slug}
                      onChange={(e) =>
                        setForm({ ...form, slug: e.target.value })
                      }
                      placeholder="fresh-red-apple"
                      className="h-11 rounded-xl border-slate-400 px-3.5 text-sm shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </div>

                  {/* description */}
                  <div className="space-y-2 sm:col-span-2">
                    <Label className="text-sm font-semibold text-slate-800">
                      Description
                    </Label>

                    <Textarea
                      required
                      rows={4}
                      value={form.description}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          description: e.target.value,
                        })
                      }
                      placeholder="Describe your product, quality, features, and benefits..."
                      className="resize-none rounded-xl border-slate-400 px-3.5 py-3 text-sm leading-6 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </div>

                  {/* category */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-800">
                      Category
                    </Label>

                    <Select
                      value={form.category}
                      onValueChange={handleCategoryChange}
                    >
                      <SelectTrigger className="h-11 rounded-xl border-slate-400 text-sm shadow-sm">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>

                      <SelectContent>
                        {categories.length > 0 ? (
                          categories.map((category) => (
                            <SelectItem
                              key={category._id}
                              value={category._id}
                              className="text-sm"
                            >
                              {category.name}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="px-3 py-3 text-center text-sm text-slate-400">
                            No categories available
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* subcategory */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-800">
                      Subcategory
                    </Label>

                    <Select
                      value={form.subcategory}
                      onValueChange={handleSubcategoryChange}
                      disabled={!subcategories.length}
                    >
                      <SelectTrigger className="h-11 rounded-xl border-slate-400 text-sm shadow-sm">
                        <SelectValue
                          placeholder={
                            subcategories.length
                              ? "Select subcategory"
                              : "No subcategories"
                          }
                        />
                      </SelectTrigger>

                      <SelectContent>
                        {subcategories.map((subcategory) => (
                          <SelectItem
                            key={subcategory._id}
                            value={subcategory._id}
                            className="text-sm"
                          >
                            {subcategory.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* price */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-800">
                      Price (Rs.)
                    </Label>

                    <Input
                      type="number"
                      min="0"
                      required
                      value={form.price}
                      onChange={(e) =>
                        setForm({ ...form, price: e.target.value })
                      }
                      placeholder="0"
                      className="h-11 rounded-xl border-slate-400 px-3.5 text-sm shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </div>

                  {/* discount */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-800">
                      Discount Price
                    </Label>

                    <Input
                      type="number"
                      min="0"
                      value={form.discountPrice}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          discountPrice: e.target.value,
                        })
                      }
                      placeholder="Optional"
                      className="h-11 rounded-xl border-slate-400 px-3.5 text-sm shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </div>

                  {/* stock */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-800">
                      Stock
                    </Label>

                    <Input
                      type="number"
                      min="0"
                      required
                      value={form.stock}
                      onChange={(e) =>
                        setForm({ ...form, stock: e.target.value })
                      }
                      placeholder="0"
                      className="h-11 rounded-xl border-slate-400 px-3.5 text-sm shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </div>

                  {/* unit */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-800">
                      Unit
                    </Label>

                    <Input
                      required
                      placeholder="kg, piece, litre"
                      value={form.unit}
                      onChange={(e) =>
                        setForm({ ...form, unit: e.target.value })
                      }
                      className="h-11 rounded-xl border-slate-400 px-3.5 text-sm shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </div>

                  {/* brand */}
                  <div className="space-y-2 sm:col-span-2">
                    <Label className="text-sm font-semibold text-slate-800">
                      Brand
                    </Label>

                    <Input
                      value={form.brand}
                      onChange={(e) =>
                        setForm({ ...form, brand: e.target.value })
                      }
                      placeholder="e.g. FreshMart, Apple, Nestlé"
                      className="h-11 rounded-xl border-slate-400 px-3.5 text-sm shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* footer */}
            <div className="sticky bottom-0 flex flex-col-reverse gap-3 border-t border-slate-100 bg-white/95 px-5 py-4 backdrop-blur sm:flex-row sm:justify-end sm:px-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleDialogChange(false)}
                disabled={saving}
                className="h-11 rounded-xl px-6 text-sm font-semibold"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={saving || uploadingId !== null}
                className="h-11 rounded-xl bg-emerald-600 px-7 text-sm font-semibold shadow-sm transition-all hover:bg-emerald-700 hover:shadow-md"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {uploadingId ? "Uploading images..." : "Saving..."}
                  </>
                ) : editingProduct ? (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Update Product
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Product
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}