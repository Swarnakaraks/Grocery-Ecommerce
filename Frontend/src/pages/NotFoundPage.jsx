import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring" }}>
        <SearchX className="h-24 w-24 text-primary/30" />
      </motion.div>
      <h1 className="text-6xl font-extrabold text-primary">404</h1>
      <h2 className="text-2xl font-bold">Page Not Found</h2>
      <p className="max-w-sm text-sm text-muted-foreground">The page you're looking for doesn't exist or has been moved.</p>
      <Button asChild size="lg"><Link to="/"><Home size={16} /> Back to Home</Link></Button>
    </div>
  );
}
