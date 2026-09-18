import React from "react";
import { motion } from "framer-motion";
import { Sprout } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function CategoryStrip({ categories = [], loading }) {
  return (
    <div className="py-8">
      {/* category heading */}
      <div className="mb-5 flex items-end justify-between">
        <h2 className="text-xl font-bold sm:text-2xl">Shop by Category</h2>
      </div>

      {/* category grid */}
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
        {/* category skeleton */}
        {loading && Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <Skeleton className="h-20 w-20 rounded-full" />
            <Skeleton className="h-3 w-14" />
          </div>
        ))}

        {/* categories */}
        {!loading && categories.map((item, i) => (
          <motion.div key={item._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <a href={`/category/${item.slug}`} className="group flex flex-col items-center gap-2 text-center">
              <div className="flex h-10 w-10 md:h-20 md:w-20 items-center justify-center overflow-hidden rounded-xl border border-brand-100 bg-brand-50 transition-all group-hover:scale-105">
                {item.image?.url ? <img src={item.image.url} alt={item.name} className="h-full w-full object-cover" /> : <Sprout className="h-8 w-8 text-primary" />}
              </div>
              <span className="line-clamp-1 text-[10px] font-medium text-foreground sm:text-sm">{item.name}</span>
            </a>
          </motion.div>
        ))}
      </div>
    </div>
  );
}