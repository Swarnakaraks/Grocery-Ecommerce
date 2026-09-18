import React, { useState, useEffect } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export function FilterSidebar({ subcategories = [], filters, onChange, onReset, open, onClose }) {
  const [minPrice, setMinPrice] = useState(filters.minPrice || "");
  const [maxPrice, setMaxPrice] = useState(filters.maxPrice || "");

  // sync price filters
  useEffect(() => {
    setMinPrice(filters.minPrice || "");
    setMaxPrice(filters.maxPrice || "");
  }, [filters.minPrice, filters.maxPrice]);

  // apply price
  const applyPrice = () => onChange({ minPrice: minPrice || undefined, maxPrice: maxPrice || undefined });

  const content = (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-bold"><SlidersHorizontal size={16} /> Filters</h3>
        <button onClick={onReset} className="text-xs font-medium text-primary hover:underline">Reset all</button>
      </div>

      {subcategories.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-semibold">Subcategory</p>

          <div className="space-y-1.5">
            <button onClick={() => onChange({ subcategory: undefined })} className={cn("block w-full rounded-lg px-2.5 py-1.5 text-left text-sm", !filters.subcategory ? "bg-brand-50 font-semibold text-primary" : "hover:bg-secondary")}>
              All
            </button>

            {subcategories.map((sub) => (
              <button key={sub._id} onClick={() => onChange({ subcategory: sub._id })} className={cn("block w-full rounded-lg px-2.5 py-1.5 text-left text-sm", filters.subcategory === sub._id ? "bg-brand-50 font-semibold text-primary" : "hover:bg-secondary")}>
                {sub.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <Separator />

      {/* price range */}
      <div>
        <p className="mb-2 text-sm font-semibold">Price Range</p>

        <div className="flex items-center gap-2">
          <Input type="number" min="0" placeholder="Min" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="h-9" />
          <span className="text-muted-foreground">-</span>
          <Input type="number" min="0" placeholder="Max" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="h-9" />
        </div>

        <Button size="sm" variant="secondary" className="mt-2 w-full" onClick={applyPrice}>Apply</Button>
      </div>

      <Separator />

      {/* quick price picks */}
      <div>
        <p className="mb-2 text-sm font-semibold">Quick price picks</p>

        <div className="flex flex-wrap gap-2">
          {[
            ["Under Rs. 500", { minPrice: undefined, maxPrice: 500 }],
            ["Rs. 500 - 1000", { minPrice: 500, maxPrice: 1000 }],
            ["Rs. 1000 - 2500", { minPrice: 1000, maxPrice: 2500 }],
            ["Above Rs. 2500", { minPrice: 2500, maxPrice: undefined }],
          ].map(([label, range]) => (
            <button key={label} onClick={() => { setMinPrice(range.minPrice || ""); setMaxPrice(range.maxPrice || ""); onChange(range); }} className="rounded-full border border-border px-3 py-1.5 text-xs font-medium hover:border-primary hover:text-primary">
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* desktop filters */}
      <aside className="sticky top-24 hidden h-fit w-64 shrink-0 rounded-2xl border border-border bg-white p-5 lg:block">
        {content}
      </aside>

      {/* mobile filters */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={onClose} />
          <div className="absolute inset-y-0 left-0 w-80 overflow-y-auto bg-white p-5">
            <button onClick={onClose} className="mb-4 ml-auto flex"><X size={20} /></button>
            {content}
          </div>
        </div>
      )}
    </>
  );
}