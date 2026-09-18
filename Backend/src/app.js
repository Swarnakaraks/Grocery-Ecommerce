import express from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import cors from "cors";
import healthRoutes from "./routes/health.route.js";
import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import sellerRoutes from "./routes/seller.routes.js";
import adminRoutes from "./routes/admin.route.js";
import storeRoutes from "./routes/store.routes.js";
import categoryRoutes from "./routes/category.route.js";
import productRoutes from "./routes/product.route.js";
import productRatingRoutes from "./routes/productRating.route.js";
import cartRoutes from "./routes/cart.route.js";
import orderRoutes from "./routes/order.route.js";
import paymentRoutes from "./routes/payment.route.js";
import productCommentRoutes from "./routes/productComment.route.js";
import addressRoutes from "./routes/address.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import wishlistRoutes from "./routes/wishlist.route.js";
import chatRoutes from "./routes/chat.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import orderManagementRoutes from "./routes/orderManagement.routes.js";

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json({limit: "10kb"}));

app.use(cookieParser());

//routes
app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/seller", sellerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/stores", storeRoutes)
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/product-ratings", productRatingRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/product-comments", productCommentRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/reviews", reviewRoutes)
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/order-management", orderManagementRoutes);

export default app;