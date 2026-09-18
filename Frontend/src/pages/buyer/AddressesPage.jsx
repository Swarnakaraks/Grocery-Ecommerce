import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import { Home, MapPin, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { addressApi } from "@/api/address.api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

const emptyForm = {
  fullName: "",
  phone: "",
  addressLine: "",
  city: "",
  district: "",
  province: "",
  postalCode: "",
  landmark: "",
  isDefault: false,
};

export default function AddressesPage() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  // load addresses
  const load = async () => {
    setLoading(true);

    try {
      const { data } = await addressApi.getMyAddresses();
      setAddresses(data.addresses || []);
    } catch (err) {
      console.error("Get addresses error:", err);

      toast.error(
        err?.response?.data?.message || "Could not fetch addresses"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // create address
  const openCreate = () => {
    setForm({ ...emptyForm });
    setEditingId(null);
    setDialogOpen(true);
  };

  // edit address
  const openEdit = (addr) => {
    setForm({
      fullName: addr.fullName || "",
      phone: addr.phone || "",
      addressLine: addr.addressLine || "",
      city: addr.city || "",
      district: addr.district || "",
      province: addr.province || "",
      postalCode: addr.postalCode || "",
      landmark: addr.landmark || "",
      isDefault: Boolean(addr.isDefault),
    });

    setEditingId(addr._id);
    setDialogOpen(true);
  };

  // save address
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        fullName: form.fullName,
        phone: form.phone,
        addressLine: form.addressLine,
        city: form.city,
        district: form.district,
        province: form.province,
        postalCode: form.postalCode || "",
        landmark: form.landmark || "",
        isDefault: Boolean(form.isDefault),
      };

      if (editingId) {
        await addressApi.updateAddress(editingId, payload);
        toast.success("Address updated");
      } else {
        await addressApi.createAddress(payload);
        toast.success("Address added");
      }

      setDialogOpen(false);
      setEditingId(null);
      setForm({ ...emptyForm });

      await load();
    } catch (err) {
      console.error("Save address error:", err);

      toast.error(
        err?.response?.data?.message || "Could not save address"
      );
    } finally {
      setSaving(false);
    }
  };

  // delete address
  const handleDelete = async (id) => {
    try {
      await addressApi.deleteAddress(id);
      toast.success("Address removed");
      await load();
    } catch (err) {
      console.error("Delete address error:", err);

      toast.error(
        err?.response?.data?.message || "Could not delete address"
      );
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-green-50/50 via-white to-white px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        {/* page header */}
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
          

            <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-600">
                <Home size={22} />
              </span>
              My Addresses
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Manage your saved delivery addresses.
            </p>
          </div>

          <Button
            onClick={openCreate}
            className="h-11 w-full rounded-xl bg-green-600 px-5 font-semibold shadow-sm transition-all hover:bg-green-700 hover:shadow-md sm:w-auto"
          >
            <Plus size={17} />
            Add Address
          </Button>
        </div>

        {/* loading */}
        {loading && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
              >
                <div className="mb-5 flex items-center justify-between">
                  <Skeleton className="h-11 w-11 rounded-xl" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>

                <Skeleton className="mb-2 h-5 w-36" />
                <Skeleton className="mb-5 h-4 w-28" />
                <Skeleton className="mb-2 h-4 w-full" />
                <Skeleton className="mb-2 h-4 w-4/5" />
                <Skeleton className="mb-6 h-4 w-3/5" />

                <div className="flex gap-2">
                  <Skeleton className="h-9 w-20 rounded-lg" />
                  <Skeleton className="h-9 w-24 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* empty state */}
        {!loading && addresses.length === 0 && (
          <div className="rounded-3xl border border-dashed border-green-200 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-green-50 text-green-500">
              <Home size={36} strokeWidth={1.5} />
            </div>

            <h2 className="text-xl font-bold text-gray-900">
              No saved addresses yet
            </h2>

            <p className="mx-auto mt-2 max-w-sm text-sm text-gray-500">
              Add your delivery address to make your grocery shopping
              experience faster and easier.
            </p>

            <Button
              onClick={openCreate}
              className="mt-6 rounded-xl bg-green-600 px-6 hover:bg-green-700"
            >
              <Plus size={16} />
              Add your first address
            </Button>
          </div>
        )}

        {/* address cards */}
        {!loading && addresses.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence>
              {addresses.map((addr) => (
                <motion.div
                  key={addr._id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.25 }}
                  className={`group relative flex flex-col overflow-hidden rounded-2xl border-2 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
                    addr.isDefault
                      ? "!border-green-500"
                      : "border-gray-100 hover:border-green-200"
                  }`}
                >
                  

                  <div className="flex flex-1 flex-col p-5">
                    {/* card header */}
                    <div className="mb-5 flex items-start justify-between gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-600 transition-colors group-hover:bg-green-100">
                        <Home size={23} strokeWidth={1.8} />
                      </div>

                      {addr.isDefault && (
                        <Badge
                          variant="success"
                          className="rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold text-green-700"
                        >
                          <Star
                            size={12}
                            className="mr-1 fill-green-500 text-green-500"
                          />
                          Default
                        </Badge>
                      )}
                    </div>

                    {/* address details */}
                    <div className="flex-1">
                      <h2 className="text-lg font-bold text-gray-900">
                        {addr.fullName}
                      </h2>

                      <p className="mt-1 text-sm font-medium text-gray-500">
                        {addr.phone}
                      </p>

                      <div className="my-4 h-px bg-gray-100" />

                      <div className="flex items-start gap-2">
                        <MapPin
                          size={17}
                          className="mt-0.5 shrink-0 text-green-600"
                        />

                        <div className="min-w-0">
                          <p className="text-sm font-semibold leading-6 text-gray-800">
                            {addr.addressLine}, {addr.city}
                          </p>

                          <p className="mt-1 text-sm leading-6 text-gray-500">
                            {addr.district}, {addr.province}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 space-y-1 pl-6 text-sm text-gray-500">
                        <p>
                          <span className="font-medium text-gray-700">
                            Postal Code:
                          </span>{" "}
                          {addr.postalCode || "N/A"}
                        </p>

                        {addr.landmark && (
                          <p>
                            <span className="font-medium text-gray-700">
                              Landmark:
                            </span>{" "}
                            {addr.landmark}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* actions */}
                    <div className="mt-6 flex gap-2 border-t border-gray-100 pt-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEdit(addr)}
                        className="h-9 flex-1 rounded-lg border-gray-200 font-medium text-gray-700 transition-colors hover:border-green-200 hover:bg-green-50 hover:text-green-700"
                      >
                        <Pencil size={13} />
                        Edit
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-9 flex-1 rounded-lg font-medium text-red-500 transition-colors hover:bg-red-50 hover:text-red-600"
                        onClick={() => handleDelete(addr._id)}
                      >
                        <Trash2 size={13} />
                        Delete
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* add/edit dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gray-900">
                {editingId ? "Edit Address" : "Add New Address"}
              </DialogTitle>
            </DialogHeader>

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 gap-4 sm:grid-cols-2"
            >
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Full Name</Label>

                <Input
                  required
                  value={form.fullName}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      fullName: e.target.value,
                    })
                  }
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label>Phone</Label>

                <Input
                  required
                  value={form.phone}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      phone: e.target.value,
                    })
                  }
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label>Postal Code</Label>

                <Input
                  value={form.postalCode || ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      postalCode: e.target.value,
                    })
                  }
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label>Address Line</Label>

                <Input
                  required
                  value={form.addressLine}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      addressLine: e.target.value,
                    })
                  }
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label>City</Label>

                <Input
                  required
                  value={form.city}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      city: e.target.value,
                    })
                  }
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label>District</Label>

                <Input
                  required
                  value={form.district}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      district: e.target.value,
                    })
                  }
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label>Province</Label>

                <Input
                  required
                  value={form.province}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      province: e.target.value,
                    })
                  }
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label>Landmark</Label>

                <Input
                  value={form.landmark || ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      landmark: e.target.value,
                    })
                  }
                  className="rounded-xl"
                />
              </div>

              {/* default address */}
              <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600 sm:col-span-2">
                <input
                  type="checkbox"
                  checked={Boolean(form.isDefault)}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      isDefault: e.target.checked,
                    })
                  }
                  className="h-4 w-4 cursor-pointer rounded border-gray-300 accent-green-600"
                />

                <span>Set as default address</span>
              </label>

              <DialogFooter className="sm:col-span-2">
                <Button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-xl bg-green-600 font-semibold hover:bg-green-700"
                >
                  {saving ? "Saving..." : "Save Address"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
