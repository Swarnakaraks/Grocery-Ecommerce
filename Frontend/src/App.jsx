import React from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Store as StoreIcon,
  Users,
  UserPlus,
  CreditCard,
  FolderTree,
  ShoppingCart,
} from "lucide-react";

import { MainLayout } from "@/components/layout/MainLayout";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { RequireAuth, RequireRole } from "@/components/common/ProtectedRoute";

import HomePage from "@/pages/buyer/HomePage";
import ProductDetailPage from "@/pages/buyer/ProductDetailPage";
import CategoryPage from "@/pages/buyer/CategoryPage";
import SearchResultsPage from "@/pages/buyer/SearchResultsPage";
import CartPage from "@/pages/buyer/CartPage";
import WishlistPage from "@/pages/buyer/WishlistPage";
import CheckoutPage from "@/pages/buyer/CheckoutPage";
import OrdersPage from "@/pages/buyer/OrdersPage";
import OrderDetailPage from "@/pages/buyer/OrderDetailPage";
import AddressesPage from "@/pages/buyer/AddressesPage";
import ProfilePage from "@/pages/buyer/ProfilePage";
import BecomeSellerPage from "@/pages/buyer/BecomeSellerPage";
import StorePage from "@/pages/buyer/StorePage";
import ChatPage from "@/pages/buyer/ChatPage";

import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";
import ChangePasswordPage from "@/pages/auth/ChangePasswordPage";
import VerifyEmailPage from "@/pages/auth/VerifyEmailPage";

import SellerOverviewPage from "@/pages/seller/SellerOverviewPage";
import SellerStorePage from "@/pages/seller/SellerStorePage";
import SellerProductsPage from "@/pages/seller/SellerProductsPage";
import SellerOrdersPage from "@/pages/seller/SellerOrdersPage";

import AdminOverviewPage from "@/pages/admin/AdminOverviewPage";
import AdminUsersPage from "@/pages/admin/AdminUsersPage";
import AdminSellersPage from "@/pages/admin/AdminSellersPage";
import AdminSellerRequestsPage from "@/pages/admin/AdminSellerRequestsPage";
import AdminProductsPage from "@/pages/admin/AdminProductsPage";
import AdminOrdersPage from "@/pages/admin/AdminOrdersPage";
import AdminPaymentsPage from "@/pages/admin/AdminPaymentsPage";
import AdminCategoriesPage from "@/pages/admin/AdminCategoriesPage";

import NotFoundPage from "@/pages/NotFoundPage";
import PaymentSuccess from "./pages/buyer/PaymentSuccess";

const sellerNav = [
  { to: "/seller", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/seller/store", label: "My Store", icon: StoreIcon },
  { to: "/seller/products", label: "Products", icon: Package },
  { to: "/seller/orders", label: "Orders", icon: ShoppingBag },
  { to: "/", label: "Shop", icon: ShoppingCart },
];

const adminNav = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/admin/seller-requests", label: "Seller Requests", icon: UserPlus },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/sellers", label: "Sellers", icon: StoreIcon },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { to: "/admin/payments", label: "Payments", icon: CreditCard },
  { to: "/admin/categories", label: "Categories", icon: FolderTree },
  { to: "/", label: "Shop", icon: ShoppingCart },
];

export default function App() {
  return (
    <>
      <Toaster position="top-center" toastOptions={{ duration: 3000, style: { borderRadius: "12px", fontSize: "14px" } }} />

      <Routes>
        {/* main routes */}
        <Route element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="products/:slug" element={<ProductDetailPage />} />
          <Route path="category/:slug" element={<CategoryPage />} />
          <Route path="search" element={<SearchResultsPage />} />
          <Route path="store/:id" element={<StorePage />} />

          {/* auth */}
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="verify-email" element={<VerifyEmailPage />} />
          <Route path="verify-email/:token" element={<VerifyEmailPage />} />

          {/* buyer */}
          <Route path="cart" element={<CartPage />} />
          <Route path="wishlist" element={<RequireAuth><WishlistPage /></RequireAuth>} />
          <Route path="checkout" element={<RequireAuth><CheckoutPage /></RequireAuth>} />
          <Route path="payment/success" element={<RequireAuth><PaymentSuccess /></RequireAuth>} />
          <Route path="orders" element={<RequireAuth><OrdersPage /></RequireAuth>} />
          <Route path="orders/:id" element={<RequireAuth><OrderDetailPage /></RequireAuth>} />
          <Route path="addresses" element={<RequireAuth><AddressesPage /></RequireAuth>} />
          <Route path="profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
          <Route path="change-password" element={<RequireAuth><ChangePasswordPage /></RequireAuth>} />
          <Route path="become-seller" element={<RequireAuth><BecomeSellerPage /></RequireAuth>} />
          <Route path="chat" element={<RequireAuth><ChatPage /></RequireAuth>} />

          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* seller routes */}
        <Route
          path="/seller"
          element={
            <RequireRole roles={["seller"]}>
              <DashboardLayout title="Seller Panel" navItems={sellerNav} accentIcon={StoreIcon} />
            </RequireRole>
          }
        >
          <Route index element={<SellerOverviewPage />} />
          <Route path="store" element={<SellerStorePage />} />
          <Route path="products" element={<SellerProductsPage />} />
          <Route path="orders" element={<SellerOrdersPage />} />
        </Route>

        {/* admin routes */}
        <Route
          path="/admin"
          element={
            <RequireRole roles={["admin"]}>
              <DashboardLayout title="Admin Panel" navItems={adminNav} accentIcon={LayoutDashboard} />
            </RequireRole>
          }
        >
          <Route index element={<AdminOverviewPage />} />
          <Route path="seller-requests" element={<AdminSellerRequestsPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="sellers" element={<AdminSellersPage />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="payments" element={<AdminPaymentsPage />} />
          <Route path="categories" element={<AdminCategoriesPage />} />
        </Route>
      </Routes>
    </>
  );
}