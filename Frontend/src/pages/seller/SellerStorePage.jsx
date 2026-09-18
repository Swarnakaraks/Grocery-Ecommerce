import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Store, Camera, ImagePlus, Save, MapPin, Phone, FileText } from "lucide-react";
import { storeApi } from "@/api/store.api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";

export default function SellerStorePage() {
  const [store, setStore] = useState(null);
  const [form, setForm] = useState({ storeName: "", storeDescription: "", address: "", phone: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const logoRef = useRef(null);
  const bannerRef = useRef(null);

  // load store
  const load = () => {
    setLoading(true);

    storeApi
      .getMyStore()
      .then(({ data }) => {
        setStore(data.store);
        setForm({
          storeName: data.store.storeName || "",
          storeDescription: data.store.storeDescription || "",
          address: data.store.address || "",
          phone: data.store.phone || "",
        });
      })
      .catch(() => setStore(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  // create store
  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { data } = await storeApi.createStore(form);
      toast.success(data.message);
      setStore(data.store);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not create store");
    } finally {
      setSaving(false);
    }
  };

  // update store
  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { data } = await storeApi.updateMyStore(form);
      toast.success(data.message);
      setStore(data.store);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not update store");
    } finally {
      setSaving(false);
    }
  };

  // upload logo
  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);

    try {
      const { data } = await storeApi.uploadLogo(file);
      setStore(data.store);
      toast.success("Logo updated");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not upload logo");
    } finally {
      setUploadingLogo(false);
    }
  };

  // upload banner
  const handleBannerUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingBanner(true);

    try {
      const { data } = await storeApi.uploadBanner(file);
      setStore(data.store);
      toast.success("Banner updated");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not upload banner");
    } finally {
      setUploadingBanner(false);
    }
  };

  if (loading) return <Spinner />;

  // create store
  if (!store) {
    return (
      <div className="mx-auto max-w-xl">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Store className="text-primary" />
              <CardTitle>Set Up Your Store</CardTitle>
            </div>
            <CardDescription>Create your store to start listing products</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Store Name</Label>
                <Input required value={form.storeName} onChange={(e) => setForm({ ...form, storeName: e.target.value })} />
              </div>

              <div className="space-y-1.5">
                <Label>Description</Label>
                <Textarea rows={4} value={form.storeDescription} onChange={(e) => setForm({ ...form, storeDescription: e.target.value })} />
              </div>

              <div className="space-y-1.5">
                <Label>Address</Label>
                <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </div>

              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>

              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? "Creating..." : "Create Store"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* store header */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-white">
        <div
          className="h-40 bg-gradient-to-br from-brand-500 to-brand-700 sm:h-52"
          style={
            store.banner?.url
              ? {
                  backgroundImage: `url(${store.banner.url})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : {}
          }
        >
          <button onClick={() => bannerRef.current?.click()} disabled={uploadingBanner} className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold shadow hover:bg-white">
            <ImagePlus size={13} /> {uploadingBanner ? "Uploading..." : "Change Banner"}
          </button>

          <input ref={bannerRef} type="file" accept="image/*" className="hidden" onChange={handleBannerUpload} />
        </div>

        <div className="flex items-end gap-4 px-6 pb-6">
          <div className="relative -mt-10 h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-4 border-white bg-brand-50 shadow-md">
            {store.logo?.url ? (
              <img src={store.logo.url} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Store className="text-primary" />
              </div>
            )}

            <button onClick={() => logoRef.current?.click()} disabled={uploadingLogo} className="absolute inset-0 flex items-center justify-center bg-black/40 text-white transition-all hover:bg-black/50">
              <Camera size={16} />
            </button>

            <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
          </div>

          <div className="pt-3">
            <h2 className="text-xl font-bold">{store.storeName}</h2>
            <Badge variant={store.isActive ? "success" : "destructive"}>{store.isActive ? "Active" : "Inactive"}</Badge>
          </div>
        </div>
      </div>

      {/* store settings */}
      <Card>
        <CardHeader>
          <CardTitle>Store Settings</CardTitle>
        </CardHeader>

        <CardContent className="grid grid-cols-1 space-x-10 md:grid-cols-3">
          {/* store overview */}
          <motion.div initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <Card className="h-full rounded-2xl border-slate-200 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
                  <Store className="h-5 w-5 text-emerald-600" />
                </div>

                <CardTitle className="mt-3 text-lg">Store Overview</CardTitle>
                <CardDescription className="text-sm">Your current store information.</CardDescription>
              </CardHeader>

              <CardContent className="space-y-3">
                {/* address */}
                <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
                    <MapPin className="h-4 w-4 text-emerald-600" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-400">Address</p>
                    <p className="mt-0.5 break-words text-sm font-semibold text-slate-700">{store.address || "Not provided"}</p>
                  </div>
                </div>

                {/* phone */}
                <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
                    <Phone className="h-4 w-4 text-emerald-600" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-400">Phone</p>
                    <p className="mt-0.5 text-sm font-semibold text-slate-700">{store.phone || "Not provided"}</p>
                  </div>
                </div>

                {/* description */}
                <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
                    <FileText className="h-4 w-4 text-emerald-600" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-400">Description</p>
                    <p className="mt-0.5 line-clamp-3 text-sm font-medium leading-5 text-slate-700">{store.storeDescription || "No description added."}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* update form */}
          <form onSubmit={handleUpdate} className="col-span-2 space-y-4">
            <div className="space-y-1.5">
              <Label>Store Name</Label>
              <Input required value={form.storeName} onChange={(e) => setForm({ ...form, storeName: e.target.value })} />
            </div>

            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea rows={4} value={form.storeDescription} onChange={(e) => setForm({ ...form, storeDescription: e.target.value })} />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Address</Label>
                <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </div>

              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>

            <Button type="submit" disabled={saving}>
              <Save size={15} /> {saving ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}