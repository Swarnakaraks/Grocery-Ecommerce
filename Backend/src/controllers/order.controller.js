import mongoose from "mongoose";
import { Cart } from "../models/cart.model.js";
import { Address } from "../models/address.model.js";
import { Order } from "../models/order.model.js";
import { Product } from "../models/product.model.js";
import { Payment } from "../models/payment.model.js";
import { createNotification } from "../utils/notification.util.js";

const generateOrderNumber = () => {
  const timestamp = Date.now().toString();
  const random = Math.floor(1000 + Math.random() * 9000);

  return `FM-${timestamp}-${random}`;
};

export const createOrder = async (req, res) => {
  try {
    const { addressId, paymentMethod } = req.body;

    if (!mongoose.isValidObjectId(addressId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid address ID",
      });
    }

    if (!["cod", "esewa"].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method",
      });
    }

    const cart = await Cart.findOne({
      buyer: req.user.id,
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty",
      });
    }

    const address = await Address.findOne({
      _id: addressId,
      buyer: req.user.id,
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    const productIds = cart.items.map((item) => item.product);

    const products = await Product.find({
      _id: { $in: productIds },
      isActive: true,
    });

    if (products.length !== cart.items.length) {
      return res.status(400).json({
        success: false,
        message: "One or more products in your cart are no longer available",
      });
    }

    const productMap = new Map(
      products.map((product) => [product._id.toString(), product]),
    );

    const orderItems = [];

    let subtotal = 0;
    let discount = 0;

    for (const cartItem of cart.items) {
      const product = productMap.get(cartItem.product.toString());

      if (!product) {
        return res.status(400).json({
          success: false,
          message: "One or more products are no longer available",
        });
      }

      if (cartItem.quantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `${product.name} does not have enough stock`,
        });
      }

      const originalPrice = product.price;

      const sellingPrice =
        product.discountPrice !== null && product.discountPrice < product.price
          ? product.discountPrice
          : product.price;

      const itemSubtotal = sellingPrice * cartItem.quantity;

      const itemDiscount = (originalPrice - sellingPrice) * cartItem.quantity;

      subtotal += itemSubtotal;
      discount += itemDiscount;

      orderItems.push({
        product: product._id,
        store: product.store,
        seller: product.seller,
        name: product.name,
        image: product.images.length > 0 ? product.images[0].url : null,
        quantity: cartItem.quantity,
        unit: product.unit,
        originalPrice,
        price: sellingPrice,
        subtotal: itemSubtotal,
      });
    }

    subtotal = Number(subtotal.toFixed(2));
    discount = Number(discount.toFixed(2));

    const shippingFee = subtotal >= 1000 ? 0 : 100;

    const total = Number((subtotal + shippingFee).toFixed(2));

    let orderNumber;
    let existingOrder;

    do {
      orderNumber = generateOrderNumber();

      existingOrder = await Order.exists({
        orderNumber,
      });
    } while (existingOrder);

    const order = await Order.create({
      orderNumber,
      buyer: req.user.id,
      items: orderItems,
      shippingAddress: {
        fullName: address.fullName,
        phone: address.phone,
        addressLine: address.addressLine,
        city: address.city,
        district: address.district,
        province: address.province,
        postalCode: address.postalCode,
        landmark: address.landmark,
      },
      subtotal,
      discount,
      shippingFee,
      total,
      status: paymentMethod === "cod" ? "confirmed" : "pending",
      paymentMethod,
      paymentStatus: "pending",
    });

    await Payment.create({
      order: order._id,
      buyer: req.user.id,
      method: paymentMethod,
      amount: total,
      status: "pending",
    });

   await createNotification({
    recipient: req.user.id,
    type: "order",
    title: "Order placed successfully",
    message: `Your order #${order.orderNumber} has been placed successfully.`,
    relatedId: order._id
});

const sellerIds = [
    ...new Set(
        orderItems.map((item) =>
            item.seller.toString()
        )
    )
];

for (const sellerId of sellerIds) {
    await createNotification({
        recipient: sellerId,
        type: "order",
        title: "New order received",
        message: `You received a new order #${order.orderNumber}.`,
        relatedId: order._id
    });
}

    for (const cartItem of cart.items) {
      const stockUpdate = await Product.updateOne(
        {
          _id: cartItem.product,
          stock: {
            $gte: cartItem.quantity,
          },
        },
        {
          $inc: {
            stock: -cartItem.quantity,
            ...(paymentMethod === "cod"
              ? {
                  totalSold: cartItem.quantity,
                }
              : {}),
          },
        },
      );

      if (stockUpdate.modifiedCount === 0) {
        return res.status(400).json({
          success: false,
          message: "Stock changed while creating the order. Please try again.",
        });
      }
    }

    cart.items = [];
    cart.subtotal = 0;
    cart.discount = 0;
    cart.total = 0;

    await cart.save();

    return res.status(201).json({
      success: true,
      message:
        paymentMethod === "cod"
          ? "Order placed successfully with Cash on Delivery"
          : "Order created successfully. Complete eSewa payment.",
      order,
    });
  } catch (error) {
    console.error("Create order error:", error);

    return res.status(500).json({
      success: false,
      message: "Could not create order",
    });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      buyer: req.user.id,
    })
      .populate("items.product", "name slug images")
      .populate("items.store", "name")
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Get my orders error:", error);

    return res.status(500).json({
      success: false,
      message: "Could not fetch orders",
    });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const order = await Order.findOne({
      _id: id,
      buyer: req.user.id,
    })
      .populate("items.product", "name slug images")
      .populate("items.store", "name");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Get order error:", error);

    return res.status(500).json({
      success: false,
      message: "Could not fetch order",
    });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const order = await Order.findOne({
      _id: id,
      buyer: req.user.id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const cancellableStatuses = ["pending", "confirmed"];

    if (!cancellableStatuses.includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: "This order cannot be cancelled",
      });
    }

    for (const item of order.items) {
      const update = {
        $inc: {
          stock: item.quantity,
        },
      };

      if (order.paymentMethod === "cod") {
        update.$inc.totalSold = -item.quantity;
      }

      await Product.updateOne(
        {
          _id: item.product,
        },
        update,
      );
    }

    order.status = "cancelled";
    order.cancelledAt = new Date();
    order.cancelReason = reason || null;

    await order.save();

    await Payment.findOneAndUpdate(
      {
        order: order._id,
        buyer: req.user.id,
      },
      {
        status: order.paymentMethod === "esewa" ? "cancelled" : "pending",
      },
    );

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    console.error("Cancel order error:", error);

    return res.status(500).json({
      success: false,
      message: "Could not cancel order",
    });
  }
};
