
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Sparkles, Store, TrendingUp, Users } from "lucide-react";

import { sellerApi } from "@/api/seller.api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const perks = [
  [
    TrendingUp,
    "Grow your business",
    "Reach thousands of active buyers every day",
  ],
  [
    Users,
    "Built-in audience",
    "Tap into FreshMart's existing customer base",
  ],
  [
    Sparkles,
    "Powerful tools",
    "Manage products, orders and chat in one dashboard",
  ],
];

export default function BecomeSellerPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    storeName: "",
    storeDescription: "",
  });
  const [loading, setLoading] = useState(false);

  // submit seller request
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await sellerApi.requestSeller(form);
      toast.success(data.message);
      navigate("/profile");
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Could not submit request"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-muted/30 px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >

          <div className="flex justify-center items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
            <Store className="h-6 w-6" />
          </div>

          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Become a FreshMart Seller
          </h1>
          </div>


          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
            Start selling your products online and grow your business with
            FreshMart.
          </p>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1.05fr] lg:items-start">
          {/* Benefits */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-4"
          >
            <div className="rounded-2xl border bg-background p-6 shadow-sm">
              <h2 className="text-lg font-semibold">Why sell with us?</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Everything you need to manage and grow your online store.
              </p>

              <div className="mt-6 space-y-3">
                {perks.map(([Icon, title, desc]) => (
                  <div
                    key={title}
                    className="flex gap-4 rounded-xl border bg-muted/30 p-4 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="min-w-0">
                      <p className="font-semibold">{title}</p>
                      <p className="mt-0.5 text-sm leading-5 text-muted-foreground">
                        {desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="border shadow-sm">
              <CardHeader className="space-y-1 border-b">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Store className="h-5 w-5" />
                  </div>

                  <div>
                    <CardTitle className="text-lg">
                      Store Details
                    </CardTitle>
                    <CardDescription>
                      Tell us about the store you want to open
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="storeName">Store Name</Label>

                    <Input
                      id="storeName"
                      required
                      placeholder="e.g. Green Valley Organics"
                      value={form.storeName}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          storeName: e.target.value,
                        })
                      }
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="storeDescription">
                      Store Description
                    </Label>

                    <Textarea
                      id="storeDescription"
                      rows={5}
                      placeholder="Tell buyers what makes your store special..."
                      value={form.storeDescription}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          storeDescription: e.target.value,
                        })
                      }
                      className="resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="h-11 w-full"
                    size="lg"
                    disabled={loading}
                  >
                    {loading ? "Submitting..." : "Submit Request"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
