import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  FolderTree,
  FolderPlus,
  Plus,
  ChevronDown,
  ChevronRight,
  Loader2,
  Search,
  Layers3,
  ImagePlus,
  X,
  Pencil,
  Trash2,
  AlertTriangle,
} from "lucide-react";

import { categoryApi } from "@/api/category.api";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState({});

  const [dialogOpen, setDialogOpen] = useState(false);

  const [formType, setFormType] = useState("create");
  const [createType, setCreateType] = useState("category");

  const [editingItem, setEditingItem] = useState(null);

  const [form, setForm] = useState({
    name: "",
    slug: "",
    parent: "",
    image: null,
    removeImage: false,
  });

  const [existingImage, setExistingImage] = useState(null);

  const [creating, setCreating] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [deletingItem, setDeletingItem] = useState(null);

  const [deleting, setDeleting] = useState(false);

  const loadCategories = async () => {
    try {
      setLoading(true);

      const { data } = await categoryApi.getCategories();

      const parentCategories = data.categories || [];

      const categoriesWithChildren = await Promise.all(
        parentCategories.map(async (category) => {
          try {
            const { data: subData } = await categoryApi.getSubcategories(
              category._id,
            );

            return {
              ...category,
              subcategories: subData.subcategories || [],
            };
          } catch (error) {
            console.error(
              `Failed to load subcategories for ${category.name}`,
              error,
            );

            return {
              ...category,
              subcategories: [],
            };
          }
        }),
      );

      setCategories(categoriesWithChildren);
    } catch (error) {
      console.error("Load categories error:", error);

      toast.error(
        error?.response?.data?.message || "Failed to load categories",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const getImageUrl = (image) => {
  if (!image) {
    return null;
  }

  if (typeof image === "string") {
    return image;
  }

  return image.url || image.secure_url || null;
};

  const generateSlug = (value) => {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  const resetForm = () => {
    setForm({
      name: "",
      slug: "",
      parent: "",
      image: null,
      removeImage: false,
    });

    setExistingImage(null);
    setEditingItem(null);
  };

  const openCreateDialog = (type, parent = "") => {
    setFormType("create");
    setCreateType(type);

    setForm({
      name: "",
      slug: "",
      parent,
      image: null,
      removeImage: false,
    });

    setExistingImage(null);
    setEditingItem(null);

    setDialogOpen(true);
  };

  const openEditDialog = (item, type, parent = "") => {
    setFormType("edit");
    setCreateType(type);
    setEditingItem(item);

    setForm({
      name: item.name || "",
      slug: item.slug || "",
      parent: item.parent?._id || item.parent || parent || "",
      image: null,
      removeImage: false,
    });

    setExistingImage(item.image?.url || null);

    setDialogOpen(true);
  };

  const handleNameChange = (value) => {
    setForm((prev) => ({
      ...prev,
      name: value,
      slug: formType === "create" ? generateSlug(value) : prev.slug,
    }));
  };

  const handleImageChange = (file) => {
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setForm((prev) => ({
      ...prev,
      image: file,
      removeImage: false,
    }));
  };

  const removeSelectedImage = () => {
    setForm((prev) => ({
      ...prev,
      image: null,
    }));
  };

  const removeExistingImage = () => {
    setExistingImage(null);

    setForm((prev) => ({
      ...prev,
      removeImage: true,
      image: null,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const name = form.name.trim();
    const slug = form.slug.trim().toLowerCase();

    if (!name) {
      toast.error("Category name is required");
      return;
    }

    if (!slug) {
      toast.error("Slug is required");
      return;
    }

    if (formType === "create" && createType === "subcategory" && !form.parent) {
      toast.error("Please select a parent category");
      return;
    }

    try {
      setCreating(true);

      const formData = new FormData();

      formData.append("name", name);
      formData.append("slug", slug);

      if (form.parent) {
        formData.append("parent", form.parent);
      }

      if (form.image) {
        formData.append("image", form.image);
      }

      if (formType === "edit" && form.removeImage) {
        formData.append("removeImage", "true");
      }

      if (formType === "create") {
        const { data } = await categoryApi.createCategory(formData);

        toast.success(
          data.message ||
            `${
              createType === "subcategory" ? "Subcategory" : "Category"
            } created successfully`,
        );

        await loadCategories();
      } else {
        const { data } = await categoryApi.updateCategory(
          editingItem._id,
          formData,
        );

        toast.success(data.message || "Category updated successfully");

        await loadCategories();
      }

      setDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Save category error:", error);

      toast.error(
        error?.response?.data?.message ||
          `Failed to ${formType === "create" ? "create" : "update"} category`,
      );
    } finally {
      setCreating(false);
    }
  };

  const openDeleteDialog = (item, type, parentId = null) => {
    setDeletingItem({
      ...item,
      type,
      parentId,
    });

    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingItem?._id) {
      return;
    }

    try {
      setDeleting(true);

      const { data } = await categoryApi.deleteCategory(deletingItem._id);

      toast.success(
        data.message ||
          `${
            deletingItem.type === "subcategory" ? "Subcategory" : "Category"
          } deleted successfully`,
      );

      await loadCategories();

      setDeleteDialogOpen(false);
      setDeletingItem(null);
    } catch (error) {
      console.error("Delete category error:", error);

      toast.error(
        error?.response?.data?.message || "Failed to delete category",
      );
    } finally {
      setDeleting(false);
    }
  };

  const toggleExpanded = (id) => {
    setExpanded((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredCategories = categories.filter((category) => {
    const query = search.toLowerCase();

    const categoryMatch = category.name?.toLowerCase().includes(query);

    const subcategoryMatch = category.subcategories?.some((subcategory) =>
      subcategory.name?.toLowerCase().includes(query),
    );

    return categoryMatch || subcategoryMatch;
  });

  const totalSubcategories = categories.reduce(
    (total, category) => total + (category.subcategories?.length || 0),
    0,
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/40 via-background to-green-50/30 p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <motion.div
          initial={{
            opacity: 0,
            y: -15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
        >
          <div>
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                <FolderTree size={22} />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  Categories
                </h1>

                <p className="text-sm text-muted-foreground">
                  Manage product categories and subcategories
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => openCreateDialog("subcategory")}
              className="gap-2"
            >
              <Layers3 size={16} />
              Add Subcategory
            </Button>

            <Button
              onClick={() => openCreateDialog("category")}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700"
            >
              <FolderPlus size={16} />
              Add Category
            </Button>
          </div>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="rounded-2xl border-emerald-100 shadow-sm">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                <FolderTree size={22} />
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Categories</p>

                <p className="text-2xl font-bold">{categories.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-blue-100 shadow-sm">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <Layers3 size={22} />
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Subcategories</p>

                <p className="text-2xl font-bold">{totalSubcategories}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-purple-100 shadow-sm">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                <FolderPlus size={22} />
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Total</p>

                <p className="text-2xl font-bold">
                  {categories.length + totalSubcategories}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-4">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />

              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search categories or subcategories..."
                className="h-11 rounded-xl pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderTree size={20} />
              All Categories
            </CardTitle>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="flex min-h-[250px] items-center justify-center">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Loader2 size={22} className="animate-spin" />
                  Loading categories...
                </div>
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="flex min-h-[250px] flex-col items-center justify-center text-center">
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <FolderTree size={26} />
                </div>

                <h3 className="font-semibold">No categories found</h3>

                <p className="mt-1 text-sm text-muted-foreground">
                  Create your first category to get started.
                </p>

                <Button
                  onClick={() => openCreateDialog("category")}
                  className="mt-4 gap-2 bg-emerald-600 hover:bg-emerald-700"
                >
                  <Plus size={16} />
                  Create Category
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {filteredCategories.map((category, index) => {
                    const isExpanded = expanded[category._id];

                    const subcategories = category.subcategories || [];

                    return (
                      <motion.div
                        key={category._id}
                        initial={{
                          opacity: 0,
                          y: 10,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        transition={{
                          delay: index * 0.03,
                        }}
                        className="overflow-hidden rounded-2xl border bg-white"
                      >
                        {/* Parent Category */}

                        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                          <div className="flex min-w-0 flex-1 items-center gap-3">
                            <button
                              type="button"
                              onClick={() => toggleExpanded(category._id)}
                              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 transition hover:bg-emerald-100"
                            >
                              {isExpanded ? (
                                <ChevronDown size={18} />
                              ) : (
                                <ChevronRight size={18} />
                              )}
                            </button>

                           <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border bg-slate-100">
  {getImageUrl(category.image) ? (
    <img
      src={getImageUrl(category.image)}
      alt={category.name}
      className="h-full w-full object-cover"
      onError={(e) => {
        e.currentTarget.style.display = "none";
      }}
    />
  ) : (
    <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
      No Image
    </div>
  )}
</div>

                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="font-semibold">
                                  {category.name}
                                </h3>

                                <Badge variant="secondary" className="text-xs">
                                  Category
                                </Badge>
                              </div>

                              <p className="truncate text-xs text-muted-foreground">
                                /{category.slug}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                            <Badge variant="outline" className="hidden sm:flex">
                              {subcategories.length}{" "}
                              {subcategories.length === 1
                                ? "subcategory"
                                : "subcategories"}
                            </Badge>

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                openCreateDialog("subcategory", category._id)
                              }
                              className="gap-2"
                            >
                              <Plus size={15} />
                              <span className="hidden lg:inline">
                                Add Subcategory
                              </span>
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                openEditDialog(category, "category")
                              }
                              className="gap-2"
                            >
                              <Pencil size={15} />
                              <span className="hidden lg:inline">Edit</span>
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                openDeleteDialog(category, "category")
                              }
                              className="gap-2 text-red-600 hover:bg-red-50 hover:text-red-700"
                            >
                              <Trash2 size={15} />
                              <span className="hidden lg:inline">Delete</span>
                            </Button>
                          </div>
                        </div>

                        {/* Subcategories */}

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{
                                height: 0,
                                opacity: 0,
                              }}
                              animate={{
                                height: "auto",
                                opacity: 1,
                              }}
                              exit={{
                                height: 0,
                                opacity: 0,
                              }}
                              className="border-t bg-slate-50/70"
                            >
                              {subcategories.length === 0 ? (
                                <div className="px-6 py-6 text-center text-sm text-muted-foreground">
                                  No subcategories yet.
                                </div>
                              ) : (
                                <div className="divide-y">
                                  {subcategories.map((subcategory) => (
                                    <div
                                      key={subcategory._id}
                                      className="flex flex-col gap-3 px-6 py-3 sm:flex-row sm:items-center"
                                    >
                                      <div className="flex min-w-0 flex-1 items-center gap-3">
                                        <div className="ml-4 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                                       <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border bg-slate-100">
  {getImageUrl(subcategory.image) ? (
    <img
      src={getImageUrl(subcategory.image)}
      alt={subcategory.name}
      className="h-full w-full object-cover"
      onError={(e) => {
        e.currentTarget.style.display = "none";
      }}
    />
  ) : (
    <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
      No Image
    </div>
  )}
</div>

                                        <div className="min-w-0 flex-1">
                                          <p className="truncate text-sm font-medium">
                                            {subcategory.name}
                                          </p>

                                          <p className="truncate text-xs text-muted-foreground">
                                            /{subcategory.slug}
                                          </p>
                                        </div>

                                        <Badge
                                          variant="outline"
                                          className="hidden text-xs md:flex"
                                        >
                                          Subcategory
                                        </Badge>
                                      </div>

                                      <div className="flex items-center justify-end gap-2">
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() =>
                                            openEditDialog(
                                              subcategory,
                                              "subcategory",
                                              category._id,
                                            )
                                          }
                                          className="gap-2"
                                        >
                                          <Pencil size={15} />
                                          <span className="hidden md:inline">
                                            Edit
                                          </span>
                                        </Button>

                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() =>
                                            openDeleteDialog(
                                              subcategory,
                                              "subcategory",
                                              category._id,
                                            )
                                          }
                                          className="gap-2 text-red-600 hover:bg-red-50 hover:text-red-700"
                                        >
                                          <Trash2 size={15} />
                                          <span className="hidden md:inline">
                                            Delete
                                          </span>
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create / Edit Dialog */}

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);

          if (!open) {
            resetForm();
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {createType === "category" ? (
                <FolderPlus size={20} className="text-emerald-600" />
              ) : (
                <Layers3 size={20} className="text-emerald-600" />
              )}

              {formType === "create"
                ? createType === "category"
                  ? "Create Category"
                  : "Create Subcategory"
                : createType === "category"
                  ? "Edit Category"
                  : "Edit Subcategory"}
            </DialogTitle>

            <DialogDescription>
              {formType === "create"
                ? createType === "category"
                  ? "Create a new parent category for your products."
                  : "Create a subcategory under an existing category."
                : "Update the category information and image."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Parent Category */}

            {createType === "subcategory" && (
              <div className="space-y-2">
                <Label>Parent Category</Label>

                <select
                  value={form.parent}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      parent: e.target.value,
                    }))
                  }
                  disabled={creating}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Select parent category</option>

                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Name */}

            <div className="space-y-2">
              <Label htmlFor="category-name">
                {createType === "category"
                  ? "Category Name"
                  : "Subcategory Name"}
              </Label>

              <Input
                id="category-name"
                placeholder={
                  createType === "category"
                    ? "e.g. Fruits & Vegetables"
                    : "e.g. Fresh Fruits"
                }
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                disabled={creating}
                autoFocus
              />
            </div>

            {/* Slug */}

            <div className="space-y-2">
              <Label htmlFor="category-slug">Slug</Label>

              <Input
                id="category-slug"
                placeholder="fruits-vegetables"
                value={form.slug}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    slug: generateSlug(e.target.value),
                  }))
                }
                disabled={creating}
              />

              <p className="text-xs text-muted-foreground">
                Slug must be unique.
              </p>
            </div>

            {/* Existing Image */}

            {formType === "edit" && existingImage && (
              <div className="space-y-2">
                <Label>Current Image</Label>

                <div className="flex items-center gap-3 rounded-xl border bg-slate-50 p-3">
                  <img
                    src={existingImage}
                    alt={form.name}
                    className="h-16 w-16 rounded-lg object-cover"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">Current image</p>

                    <p className="text-xs text-muted-foreground">
                      Upload a new image to replace it.
                    </p>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={removeExistingImage}
                    disabled={creating}
                    title="Remove current image"
                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    <X size={16} />
                  </Button>
                </div>
              </div>
            )}

            {/* Image */}

            <div className="space-y-2">
              <Label htmlFor="category-image">
                {formType === "edit"
                  ? "New Image"
                  : createType === "category"
                    ? "Category Image"
                    : "Subcategory Image"}
              </Label>

              <div className="flex items-center gap-3">
                <Input
                  id="category-image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e.target.files?.[0])}
                  disabled={creating}
                  className="cursor-pointer"
                />

                {form.image && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={removeSelectedImage}
                    disabled={creating}
                    title="Remove selected image"
                  >
                    <X size={16} />
                  </Button>
                )}
              </div>

              <p className="text-xs text-muted-foreground">
                JPG, PNG, WEBP or other image. Maximum size 5MB.
              </p>

              {form.image && (
                <div className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-3">
                  <img
                    src={URL.createObjectURL(form.image)}
                    alt="Selected"
                    className="h-16 w-16 rounded-lg object-cover"
                  />

                  <div className="min-w-0">
                    <p className="text-sm font-medium text-emerald-900">
                      {form.image.name}
                    </p>

                    <p className="text-xs text-emerald-700">
                      {(form.image.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              )}

              {!form.image && !existingImage && (
                <div className="flex items-center gap-2 rounded-xl border border-dashed border-emerald-200 bg-emerald-50/50 p-3 text-sm text-muted-foreground">
                  <ImagePlus size={18} className="text-emerald-600" />
                  No image selected
                </div>
              )}
            </div>

            {/* Preview */}

            {form.name && (
              <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3">
                <p className="text-xs font-medium text-emerald-700">Preview</p>

                <div className="mt-2 flex items-center gap-3">
                  {form.image ? (
                    <img
                      src={URL.createObjectURL(form.image)}
                      alt={form.name}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                  ) : existingImage ? (
                    <img
                      src={existingImage}
                      alt={form.name}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                      {createType === "category" ? (
                        <FolderTree size={20} />
                      ) : (
                        <Layers3 size={20} />
                      )}
                    </div>
                  )}

                  <div>
                    <p className="font-semibold text-emerald-900">
                      {form.name}
                    </p>

                    <p className="text-xs text-emerald-700">/{form.slug}</p>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={creating}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={creating}
                className="gap-2 bg-emerald-600 hover:bg-emerald-700"
              >
                {creating ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    {formType === "create" ? "Creating..." : "Updating..."}
                  </>
                ) : (
                  <>
                    {formType === "create" ? (
                      <Plus size={16} />
                    ) : (
                      <Pencil size={16} />
                    )}

                    {formType === "create"
                      ? `Create ${
                          createType === "category" ? "Category" : "Subcategory"
                        }`
                      : `Update ${
                          createType === "category" ? "Category" : "Subcategory"
                        }`}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}

      <Dialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          if (!deleting) {
            setDeleteDialogOpen(open);

            if (!open) {
              setDeletingItem(null);
            }
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
              <AlertTriangle size={24} />
            </div>

            <DialogTitle className="text-center">
              Delete{" "}
              {deletingItem?.type === "subcategory"
                ? "Subcategory"
                : "Category"}
              ?
            </DialogTitle>

            <DialogDescription className="text-center">
              Are you sure you want to delete{" "}
              <strong>{deletingItem?.name}</strong>? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>

          {deletingItem?.type === "category" &&
            deletingItem?.subcategories?.length > 0 && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                This category has subcategories. The backend will prevent
                deletion until its active subcategories are removed.
              </div>
            )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>

            <Button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="gap-2 bg-red-600 hover:bg-red-700"
            >
              {deleting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 size={16} />
                  Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
