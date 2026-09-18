import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import {
  MapPin,
  Wallet,
  Smartphone,
  CheckCircle2,
  Plus,
  ShoppingBag,
  X,
  Loader2,
  ShieldCheck,
  Truck,
  ChevronRight,
} from "lucide-react";
import { addressApi } from "@/api/address.api";
import { orderApi } from "@/api/order.api";
import { paymentApi } from "@/api/payment.api";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn, formatCurrency, getImageUrl, getSellingPrice } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";

const emptyAddress = {
  fullName: "",
  phone: "",
  addressLine: "",
  city: "",
  district: "",
  province: "",
  postalCode: "",
  landmark: "",
};

export default function CheckoutPage() {
  const { cart, fetchCart } = useCart();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState(emptyAddress);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [error, setError] = useState("");

  // load checkout
  useEffect(() => {
    const loadCheckout = async () => {
      try {
        setLoading(true);
        setError("");

        const [, addressResponse] = await Promise.all([
          fetchCart(),
          addressApi.getMyAddresses(),
        ]);

        const list = addressResponse?.data?.addresses || [];
        setAddresses(list);

        const defaultAddress =
          list.find((address) => address.isDefault) || list[0];

        if (defaultAddress) {
          setSelectedAddress(defaultAddress._id);
        }
      } catch (err) {
        setError(err?.response?.data?.message || "Could not load checkout.");
      } finally {
        setLoading(false);
      }
    };

    loadCheckout();
  }, []);

  const items = cart?.items || [];
  const shippingFee =
    Number(cart?.subtotal || 0) - Number(cart?.discount || 0) >= 1000 ? 0 : 100;
  const grandTotal = Number(cart?.total || 0) + shippingFee;

  // address change
  const handleAddressChange = (event) => {
    const { name, value } = event.target;
    setAddressForm((current) => ({ ...current, [name]: value }));
  };

  // create address
  const handleCreateAddress = async (event) => {
    event.preventDefault();

    try {
      setSavingAddress(true);
      setError("");

      const { data } = await addressApi.createAddress(addressForm);
      const newAddress = data?.address || data?.data;

      if (newAddress) {
        setAddresses((current) => [...current, newAddress]);
        setSelectedAddress(newAddress._id);
      }

      setShowAddressForm(false);
      setAddressForm({ ...emptyAddress });
      toast.success(data?.message || "Address saved successfully");
    } catch (err) {
      const message =
        err?.response?.data?.message || "Could not create address.";
      setError(message);
      toast.error(message);
    } finally {
      setSavingAddress(false);
    }
  };

  // submit eSewa form
  const submitEsewaForm = ({ paymentUrl, formData }) => {
    if (!paymentUrl) throw new Error("eSewa payment URL was not returned.");
    if (!formData) throw new Error("eSewa payment form data was not returned.");

    const form = document.createElement("form");
    form.method = "POST";
    form.action = paymentUrl;

    Object.entries(formData).forEach(([key, value]) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = value ?? "";
      form.appendChild(input);
    });

    document.body.appendChild(form);

    console.log("Submitting eSewa payment form");
    console.log("Payment URL:", paymentUrl);
    console.log("Payment fields:", formData);

    form.submit();
  };

  // place order
  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error("Please select a delivery address");
      return;
    }

    try {
      setPlacing(true);
      setError("");

      // create order
      const { data } = await orderApi.createOrder({
        addressId: selectedAddress,
        paymentMethod,
      });

      const order = data?.order || data?.data;

      if (!order) {
        throw new Error("Order was not returned by the server.");
      }

      console.log("Order created:", order);

      // eSewa payment
      if (paymentMethod === "esewa") {
        console.log("Initiating eSewa payment for order:", order._id);

        const { data: paymentResponse } = await paymentApi.initiateEsewa({
          orderId: order._id,
        });

        console.log("eSewa initiation response:", paymentResponse);

        if (!paymentResponse?.success) {
          throw new Error(
            paymentResponse?.message || "Could not initiate eSewa payment.",
          );
        }

        if (!paymentResponse?.paymentUrl) {
          throw new Error("eSewa payment URL was not returned.");
        }

        if (!paymentResponse?.formData) {
          throw new Error("eSewa payment form data was not returned.");
        }

        submitEsewaForm({
          paymentUrl: paymentResponse.paymentUrl,
          formData: paymentResponse.formData,
        });

        return;
      }

      // COD payment
      if (paymentMethod === "cod") {
        console.log("Initiating COD payment for order:", order._id);

        const { data: paymentResponse } = await paymentApi.initiateCod({
          orderId: order._id,
        });

        console.log("COD payment response:", paymentResponse);

        if (!paymentResponse?.success) {
          throw new Error(
            paymentResponse?.message || "Could not confirm COD order.",
          );
        }

        toast.success(
          paymentResponse?.message || "Cash on Delivery order confirmed.",
        );
        await fetchCart();
        navigate(`/payment/success?orderId=${order._id}&method=cod`);
      }
    } catch (err) {
      console.error("Checkout error:", err);

      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Could not place order.";
      setError(message);
      toast.error(message);
    } finally {
      setPlacing(false);
    }
  };

  if (loading) return <Spinner />;

  // empty cart
  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] bg-gradient-to-b from-emerald-50/60 via-background to-background px-4 py-16">
        <div className="mx-auto flex max-w-md flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 flex h-24 w-24 items-center justify-center rounded-full border border-emerald-100 bg-white shadow-xl shadow-emerald-100/50"
          >
            <ShoppingBag className="h-10 w-10 text-emerald-500" />
          </motion.div>

          <h2 className="text-2xl font-bold tracking-tight">
            Your cart is empty
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Looks like you haven't added any groceries to your cart yet.
          </p>

          <Button
            onClick={() => navigate("/")}
            className="mt-6 h-11 rounded-xl px-7 shadow-lg shadow-primary/20"
          >
            Start Shopping <ChevronRight className="ml-1.5 h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-20 min-h-screen bg-gradient-to-b from-emerald-50/50 via-background to-background">
      <div className="container mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
              {" "}
              Checkout{" "}
            </h1>
          </div>
        </div>

        {/* error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-600 shadow-sm"
          >
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-100">
              <X className="h-4 w-4" />
            </div>

            <div>
              <p className="font-semibold">Something went wrong</p>
              <p className="mt-0.5 text-red-600/80">{error}</p>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
          {/* left side */}
          <div className="space-y-6 lg:col-span-2">
            <div className="grid grid-cols-2 space-x-4">
              {/* delivery address */}
              <motion.section
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="overflow-hidden rounded-3xl border border-border/70 border-green-600 bg-white shadow-sm"
              >
                <div className="border-b border-border/60 bg-gradient-to-r from-emerald-50/80 to-white px-5 py-5 sm:px-6">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-primary">
                        <MapPin className="h-5 w-5" />
                      </div>

                      <div>
                        <h3 className="font-bold tracking-tight">
                          Delivery Address
                        </h3>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Where should we deliver your groceries?
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setShowAddressForm((current) => !current);
                        setError("");
                      }}
                      className="flex shrink-0 items-center gap-1.5 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-semibold text-primary transition-all hover:bg-emerald-100"
                    >
                      {showAddressForm ? (
                        <X className="h-3.5 w-3.5" />
                      ) : (
                        <Plus className="h-3.5 w-3.5" />
                      )}
                      {showAddressForm ? "Cancel" : "Add New"}
                    </button>
                  </div>
                </div>

                <div className="p-5 sm:p-6">
                  {/* add address form */}
                  {showAddressForm && (
                    <motion.form
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      onSubmit={handleCreateAddress}
                      className="mb-6 overflow-hidden rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4 sm:p-5"
                    >
                      <div className="mb-4">
                        <h4 className="text-sm font-bold">
                          Add Delivery Address
                        </h4>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Enter your delivery details below.
                        </p>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        {Object.keys(addressForm).map((field) => (
                          <Input
                            key={field}
                            name={field}
                            value={addressForm[field]}
                            onChange={handleAddressChange}
                            placeholder={field
                              .replace(/([A-Z])/g, " $1")
                              .replace(/^./, (char) => char.toUpperCase())}
                            required={
                              !["postalCode", "landmark"].includes(field)
                            }
                            className="h-11 w-full rounded-xl border-border/80 bg-white px-3.5 text-sm outline-none transition-all placeholder:text-muted-foreground/60 focus:border-primary focus:ring-4 focus:ring-primary/10"
                          />
                        ))}

                        <Button
                          type="submit"
                          disabled={savingAddress}
                          className="h-11 rounded-xl shadow-md shadow-primary/15 sm:col-span-2"
                        >
                          {savingAddress ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving Address...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Save Address
                            </>
                          )}
                        </Button>
                      </div>
                    </motion.form>
                  )}

                  {/* no address */}
                  {addresses.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/40 px-5 py-8 text-center">
                      <MapPin className="mx-auto mb-3 h-8 w-8 text-emerald-400" />
                      <p className="text-sm font-semibold">
                        No delivery address yet
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Add an address to continue with your order.
                      </p>
                    </div>
                  )}

                  {/* address list */}
                  <div className="space-y-3">
                    {addresses.map((addr) => (
                      <motion.button
                        key={addr._id}
                        type="button"
                        whileTap={{ scale: 0.995 }}
                        onClick={() => setSelectedAddress(addr._id)}
                        className={cn(
                          "group relative flex w-full items-start gap-3 overflow-hidden rounded-2xl border-2 p-4 text-left transition-all duration-200 sm:p-5",
                          selectedAddress === addr._id
                            ? "border-primary bg-emerald-50/60 shadow-md shadow-emerald-100/50"
                            : "border-border/70 bg-white hover:border-emerald-200 hover:bg-emerald-50/20",
                        )}
                      >
                        {selectedAddress === addr._id && (
                          <div className="absolute left-0 top-0 h-full w-1 bg-primary" />
                        )}

                        <div
                          className={cn(
                            "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all",
                            selectedAddress === addr._id
                              ? "border-primary bg-primary text-white"
                              : "border-border bg-white group-hover:border-primary/50",
                          )}
                        >
                          {selectedAddress === addr._id && (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-bold">{addr.fullName}</p>
                            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                              {addr.phone}
                            </span>
                          </div>

                          <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                            {addr.addressLine}, {addr.city}, {addr.district},{" "}
                            {addr.province}
                          </p>

                          {addr.landmark && (
                            <p className="mt-1 text-xs text-muted-foreground">
                              <span className="font-medium text-foreground/70">
                                Landmark:
                              </span>{" "}
                              {addr.landmark}
                            </p>
                          )}
                        </div>

                        {selectedAddress === addr._id && (
                          <span className="hidden rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold text-primary sm:block">
                            Selected
                          </span>
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.section>

              {/* payment method */}
              <motion.section
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="overflow-hidden rounded-3xl border border-border/70 border-green-600 bg-white shadow-sm"
              >
                <div className="border-b border-border/60 bg-gradient-to-r from-emerald-50/70 to-white px-5 py-5 sm:px-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-primary">
                      <Wallet className="h-5 w-5" />
                    </div>

                    <div>
                      <h3 className="font-bold tracking-tight">
                        Payment Method
                      </h3>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Choose how you'd like to pay
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-5 sm:p-6">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {/* COD */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("cod")}
                      className={cn(
                        "group relative flex items-center gap-4 overflow-hidden rounded-2xl border-2 p-4 text-left transition-all duration-200",
                        paymentMethod === "cod"
                          ? "border-primary bg-emerald-50/60 shadow-md shadow-emerald-100/40"
                          : "border-border/70 bg-white hover:border-emerald-200 hover:bg-emerald-50/20",
                      )}
                    >
                      {paymentMethod === "cod" && (
                        <div className="absolute right-0 top-0 h-12 w-12 rounded-bl-full bg-primary/10" />
                      )}

                      <div
                        className={cn(
                          "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-all",
                          paymentMethod === "cod"
                            ? "bg-primary text-white shadow-md shadow-primary/20"
                            : "bg-muted text-muted-foreground group-hover:bg-emerald-100 group-hover:text-primary",
                        )}
                      >
                        <Wallet className="h-5 w-5" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-bold">Cash on Delivery</p>
                          {paymentMethod === "cod" && (
                            <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
                          )}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Pay when you receive
                        </p>
                      </div>
                    </button>

                    {/* eSewa */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("esewa")}
                      className={cn(
                        "group relative flex items-center gap-4 overflow-hidden rounded-2xl border-2 p-4 text-left transition-all duration-200",
                        paymentMethod === "esewa"
                          ? "border-primary bg-emerald-50/60 shadow-md shadow-emerald-100/40"
                          : "border-border/70 bg-white hover:border-emerald-200 hover:bg-emerald-50/20",
                      )}
                    >
                      {paymentMethod === "esewa" && (
                        <div className="absolute right-0 top-0 h-12 w-12 rounded-bl-full bg-primary/10" />
                      )}

                      <div
                        className={cn(
                          "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-all",
                          paymentMethod === "esewa"
                            ? "bg-primary text-white shadow-md shadow-primary/20"
                            : "bg-muted text-muted-foreground group-hover:bg-emerald-100 group-hover:text-primary",
                        )}
                      >
                        <Smartphone className="h-5 w-5" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-bold">eSewa</p>
                          {paymentMethod === "esewa" && (
                            <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
                          )}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Pay online securely
                        </p>
                      </div>
                    </button>
                  </div>
                </div>
              </motion.section>
            </div>

            {/* order items */}
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="overflow-hidden rounded-3xl border border-border/70 border-green-600 bg-white shadow-sm"
            >
              <div className="flex items-center justify-between border-b border-border/60 bg-gradient-to-r from-emerald-50/70 to-white px-5 py-5 sm:px-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-primary">
                    <ShoppingBag className="h-5 w-5" />
                  </div>

                  <div>
                    <h3 className="font-bold tracking-tight">Order Items</h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {items.length} {items.length === 1 ? "item" : "items"} in
                      your order
                    </p>
                  </div>
                </div>

                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-primary">
                  {items.length}
                </span>
              </div>

              <div className="divide-y divide-border/60 px-5 sm:px-6">
                {items.map((item) => (
                  <div
                    key={item.product?._id || item.product}
                    className="flex items-center gap-3 py-4"
                  >
                    <div className="relative shrink-0">
                      <div className="h-16 w-16 overflow-hidden rounded-2xl border border-border/60 bg-muted sm:h-[72px] sm:w-[72px]">
                        <img
                          src={getImageUrl(item.product.images)}
                          alt={item.product.name}
                          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                          onError={(event) => {
                            event.currentTarget.src =
                              "/placeholder-product.svg";
                          }}
                        />
                      </div>

                      <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-primary px-1 text-[9px] font-bold text-white shadow-sm">
                        {item.quantity}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-sm font-semibold">
                        {item.product.name}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Quantity: {item.quantity}
                      </p>
                    </div>

                    <p className="shrink-0 text-sm font-bold">
                      {formatCurrency(
                        getSellingPrice(item.product) * item.quantity,
                      )}
                    </p>
                  </div>
                ))}
              </div>
            </motion.section>
          </div>

          {/* right side */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="h-fit lg:sticky lg:top-24"
          >
            <div className="overflow-hidden rounded-3xl border border-border/70 bg-white shadow-xl shadow-emerald-900/5">
              {/* summary header */}
              <div className="relative overflow-hidden bg-gradient-to-br from-primary via-emerald-600 to-emerald-700 px-6 py-6 text-white">
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10" />
                <div className="absolute -bottom-16 -left-8 h-32 w-32 rounded-full bg-white/5" />

                <div className="relative">
                  <div className="flex items-center gap-2 text-emerald-50">
                    <ShoppingBag className="h-4 w-4" />
                    <span className="text-xs font-semibold uppercase tracking-[0.15em]">
                      Your Order
                    </span>
                  </div>

                  <h3 className="mt-2 text-xl font-black tracking-tight">
                    Order Summary
                  </h3>
                  <p className="mt-1 text-xs text-emerald-50/80">
                    Review your order before placing it.
                  </p>
                </div>
              </div>

              <div className="p-6">
                {/* price details */}
                <div className="space-y-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-semibold">
                      {formatCurrency(cart.subtotal)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Discount</span>
                    <span className="font-semibold text-emerald-600">
                      -{formatCurrency(cart.discount)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Truck className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        Shipping Fee
                      </span>
                    </div>

                    <span
                      className={cn(
                        "font-semibold",
                        shippingFee === 0
                          ? "text-emerald-600"
                          : "text-foreground",
                      )}
                    >
                      {shippingFee === 0 ? "Free" : formatCurrency(shippingFee)}
                    </span>
                  </div>
                </div>

                {/* free shipping */}
                {shippingFee === 0 && (
                  <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50 px-3.5 py-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                      <p className="text-xs font-medium text-emerald-700">
                        You've unlocked free delivery!
                      </p>
                    </div>
                  </div>
                )}

                <div className="my-5 border-t border-dashed border-border" />

                {/* total */}
                <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100/60 p-4">
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">
                        Total Amount
                      </p>
                      <p className="mt-1 text-2xl font-black tracking-tight text-foreground">
                        {formatCurrency(grandTotal)}
                      </p>
                    </div>

                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-sm">
                      <Wallet className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                </div>

                {/* place order */}
                <Button
                  className="mt-5 h-12 w-full rounded-2xl text-sm font-bold shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/25"
                  size="lg"
                  disabled={placing || !selectedAddress}
                  onClick={handlePlaceOrder}
                >
                  {placing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {paymentMethod === "esewa"
                        ? "Connecting to eSewa..."
                        : "Placing Order..."}
                    </>
                  ) : paymentMethod === "esewa" ? (
                    <>
                      Continue to eSewa{" "}
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Place Order <ChevronRight className="ml-1 h-4 w-4" />
                    </>
                  )}
                </Button>

                {/* security */}
                <div className="mt-5 flex items-center justify-center gap-2 text-center">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  <p className="text-[11px] leading-4 text-muted-foreground">
                    Your order and payment information are securely protected.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
