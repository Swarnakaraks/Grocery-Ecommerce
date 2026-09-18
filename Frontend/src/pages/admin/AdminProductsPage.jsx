import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Package, Search, Eye, EyeOff } from "lucide-react";
import { adminApi } from "@/api/admin.api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { formatCurrency, getImageUrl } from "@/lib/utils";

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState(null);

  const load = () => {
    setLoading(true);
    adminApi.getAllProducts().then(({ data }) => setProducts(data.products || [])).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const toggle = async (id, isActive) => {
    setBusyId(id);
    try {
      const fn = isActive ? adminApi.deactivateProduct : adminApi.activateProduct;
      const { data } = await fn(id);
      toast.success(data.message);
      setProducts((prev) => prev.map((p) => (p._id === id ? { ...p, isActive: data.product.isActive } : p)));
    } catch (err) {
      toast.error(err?.response?.data?.message || "Action failed");
    } finally {
      setBusyId(null);
    }
  };

  const filtered = products.filter((p) => p.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-2xl font-bold"><Package /> Products ({products.length})</h1>
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search products..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {loading && <div className="space-y-2">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-16" />)}</div>}
      {!loading && filtered.length === 0 && <EmptyState icon={Package} title="No products found" />}

      <div className="space-y-2">
        {filtered.map((p) => (
          <div key={p._id} className="flex items-center gap-3 rounded-2xl border border-border bg-white p-3">
            <img src={getImageUrl(p.images)} alt="" className="h-12 w-12 rounded-lg object-cover" onError={(e) => (e.currentTarget.src = "/placeholder-product.svg")} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{p.name}</p>
              <p className="text-xs text-muted-foreground">{p.category?.name} · {p.store?.storeName} · by {p.seller?.fullName}</p>
            </div>
            <span className="text-sm font-semibold text-primary">{formatCurrency(p.discountPrice || p.price)}</span>
            <Badge variant={p.isActive ? "success" : "secondary"}>{p.isActive ? "Active" : "Hidden"}</Badge>
            <Button size="sm" variant="outline" disabled={busyId === p._id} onClick={() => toggle(p._id, p.isActive)}>
              {p.isActive ? <EyeOff size={13} /> : <Eye size={13} />}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
