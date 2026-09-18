import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount = 0) {
  const n = Number(amount) || 0;
  return `Rs. ${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

export function formatDate(date) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function timeAgo(date) {
  if (!date) return "";
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  const map = [
    ["year", 31536000],
    ["month", 2592000],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  for (const [label, secs] of map) {
    const val = Math.floor(seconds / secs);
    if (val >= 1) return `${val} ${label}${val > 1 ? "s" : ""} ago`;
  }
  return "just now";
}

export function getImageUrl(images) {
  if (!images) return "/placeholder-product.svg";
  if (Array.isArray(images)) return images[0]?.url || "/placeholder-product.svg";
  return images?.url || "/placeholder-product.svg";
}

export function slugify(text = "") {
  return text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getDiscountPercent(price, discountPrice) {
  if (!discountPrice || discountPrice >= price) return 0;
  return Math.round(((price - discountPrice) / price) * 100);
}

export function getSellingPrice(product) {
  if (!product) return 0;
  return product.discountPrice !== null && product.discountPrice !== undefined
    ? product.discountPrice
    : product.price;
}
