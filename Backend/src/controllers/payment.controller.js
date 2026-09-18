import { Order } from "../models/order.model.js";
import { Payment } from "../models/payment.model.js";
import { Product } from "../models/product.model.js";
import {
  generateEsewaSignature,
  generateTransactionUuid,
  verifyEsewaResponseSignature,
} from "../utils/esewa.util.js";
import {
  checkEsewaTransactionStatus,
  getEsewaPaymentUrl,
} from "../services/esewa.service.js";
import { createNotification } from "../utils/notification.util.js";

// get payment by order
export const getPaymentByOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const payment = await Payment.findOne({
      order: orderId,
      buyer: req.user.id,
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    return res.status(200).json({
      success: true,
      payment,
    });
  } catch (error) {
    console.error("Get payment by order error:", error);

    return res.status(500).json({
      success: false,
      message: "Could not fetch payment",
    });
  }
};

// initiate COD payment
export const initiateCodPayment = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      buyer: req.user.id,
      paymentMethod: "cod",
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "COD order not found",
      });
    }

    if (order.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Cancelled order cannot be confirmed",
      });
    }

    if (order.paymentStatus === "paid") {
      return res.status(400).json({
        success: false,
        message: "Order is already paid",
      });
    }

    let payment = await Payment.findOne({
      order: order._id,
      buyer: req.user.id,
    });

    // create payment record if it does not exist
    if (!payment) {
      payment = await Payment.create({
        order: order._id,
        buyer: req.user.id,
        method: "cod",
        amount: Number(order.total),
        status: "pending",
      });
    } else {
      // make sure existing payment is COD
      if (payment.method !== "cod") {
        return res.status(400).json({
          success: false,
          message: "Payment method does not match COD",
        });
      }

      if (payment.status === "paid") {
        return res.status(400).json({
          success: false,
          message: "Payment is already completed",
        });
      }

      await Payment.findByIdAndUpdate(payment._id, {
        amount: Number(order.total),
        status: "pending",
        transactionUuid: null,
        transactionId: null,
        productCode: null,
        paidAt: null,
      });
    }

    // confirm COD order
    await Order.findByIdAndUpdate(order._id, {
      status: "confirmed",
      paymentStatus: "pending",
    });

    await createNotification({
      recipient: req.user.id,
      type: "payment",
      title: "COD order confirmed",
      message: `Your Cash on Delivery order #${order.orderNumber} has been confirmed.`,
      relatedId: order._id,
    });

    return res.status(200).json({
      success: true,
      message: "Cash on Delivery order confirmed successfully",
      payment: {
        _id: payment._id,
        order: order._id,
        method: "cod",
        amount: Number(order.total),
        status: "pending",
      },
      order: {
        _id: order._id,
        orderNumber: order.orderNumber,
        status: "confirmed",
        paymentStatus: "pending",
      },
    });
  } catch (error) {
    console.error("Initiate COD payment error:", error);

    return res.status(500).json({
      success: false,
      message: "Could not confirm Cash on Delivery order",
    });
  }
};

// initiate eSewa payment
export const initiateEsewaPayment = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      buyer: req.user.id,
      paymentMethod: "esewa",
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "eSewa order not found",
      });
    }

    if (order.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Cancelled order cannot be paid",
      });
    }

    if (order.paymentStatus === "paid") {
      return res.status(400).json({
        success: false,
        message: "Order is already paid",
      });
    }

    const payment = await Payment.findOne({
      order: order._id,
      buyer: req.user.id,
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment record not found",
      });
    }

    if (payment.status === "paid") {
      return res.status(400).json({
        success: false,
        message: "Payment is already completed",
      });
    }

    const productCode = process.env.ESEWA_PRODUCT_CODE;

    if (!productCode) {
      return res.status(500).json({
        success: false,
        message: "ESEWA_PRODUCT_CODE is not configured",
      });
    }

    const transactionUuid = generateTransactionUuid();
    const totalAmount = Number(order.total);

    const signature = generateEsewaSignature({
      totalAmount,
      transactionUuid,
      productCode,
    });

    await Payment.findByIdAndUpdate(payment._id, {
      transactionUuid,
      transactionId: null,
      productCode,
      status: "pending",
    });

    const apiUrl = process.env.API_URL;

    if (!apiUrl) {
      return res.status(500).json({
        success: false,
        message: "API_URL is not configured",
      });
    }

    const successUrl = `${apiUrl}/api/payments/esewa/success`;
    const failureUrl = `${apiUrl}/api/payments/esewa/failure`;

    return res.status(200).json({
      success: true,
      paymentUrl: getEsewaPaymentUrl(),
      formData: {
        amount: String(totalAmount),
        tax_amount: "0",
        total_amount: String(totalAmount),
        transaction_uuid: transactionUuid,
        product_code: productCode,
        product_service_charge: "0",
        product_delivery_charge: "0",
        success_url: successUrl,
        failure_url: failureUrl,
        signed_field_names: "total_amount,transaction_uuid,product_code",
        signature,
      },
    });
  } catch (error) {
    console.error("Initiate eSewa payment error:", error);

    return res.status(500).json({
      success: false,
      message: "Could not initiate eSewa payment",
    });
  }
};

// verify eSewa payment
export const verifyEsewaPayment = async (req, res) => {
  try {
    const { data } = req.query;

    if (!data) {
      return res.redirect(`${process.env.CLIENT_URL}/payment/failed`);
    }

    let decodedData;

    try {
      decodedData = JSON.parse(Buffer.from(data, "base64").toString("utf-8"));
    } catch (error) {
      console.error("eSewa response decode error:", error);

      return res.redirect(`${process.env.CLIENT_URL}/payment/failed`);
    }

    const {
      status,
      signature,
      transaction_code,
      total_amount,
      transaction_uuid,
      product_code,
      signed_field_names,
    } = decodedData;

    if (
      !status ||
      !signature ||
      !transaction_code ||
      !total_amount ||
      !transaction_uuid ||
      !product_code ||
      !signed_field_names
    ) {
      return res.redirect(`${process.env.CLIENT_URL}/payment/failed`);
    }

    const isSignatureValid = verifyEsewaResponseSignature(decodedData);

    if (!isSignatureValid) {
      console.error("Invalid eSewa response signature");

      return res.redirect(`${process.env.CLIENT_URL}/payment/failed`);
    }

    const payment = await Payment.findOne({
      transactionUuid: transaction_uuid,
      method: "esewa",
    });

    if (!payment) {
      return res.redirect(`${process.env.CLIENT_URL}/payment/failed`);
    }

    const order = await Order.findOne({
      _id: payment.order,
      buyer: payment.buyer,
    });

    if (!order) {
      return res.redirect(`${process.env.CLIENT_URL}/payment/failed`);
    }

    if (Number(total_amount) !== Number(order.total)) {
      console.error("eSewa amount mismatch");

      return res.redirect(`${process.env.CLIENT_URL}/payment/failed`);
    }

    const statusResponse = await checkEsewaTransactionStatus({
      totalAmount: order.total,
      transactionUuid: transaction_uuid,
      productCode: product_code,
    });

    if (statusResponse.status !== "COMPLETE") {
      return res.redirect(
        `${process.env.CLIENT_URL}/payment/failed?orderId=${order._id}`,
      );
    }

    if (payment.status !== "paid") {
      await Payment.findByIdAndUpdate(payment._id, {
        status: "paid",
        transactionId: transaction_code,
        paidAt: new Date(),
      });

      await Order.findByIdAndUpdate(order._id, {
        paymentStatus: "paid",
        status: "confirmed",
      });

      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: {
            totalSold: item.quantity,
          },
        });
      }

      await createNotification({
        recipient: payment.buyer,
        type: "payment",
        title: "Payment successful",
        message: `Your eSewa payment for order #${order.orderNumber} was successful.`,
        relatedId: order._id,
      });
    }

    return res.redirect(
      `${process.env.CLIENT_URL}/payment/success?orderId=${order._id}`,
    );
  } catch (error) {
    console.error("Verify eSewa payment error:", error);

    return res.redirect(`${process.env.CLIENT_URL}/payment/failed`);
  }
};

// eSewa failure
export const handleEsewaFailure = async (req, res) => {
  try {
    const { data } = req.query;

    if (!data) {
      return res.redirect(`${process.env.CLIENT_URL}/payment/failed`);
    }

    let decodedData;

    try {
      decodedData = JSON.parse(Buffer.from(data, "base64").toString("utf-8"));
    } catch (error) {
      return res.redirect(`${process.env.CLIENT_URL}/payment/failed`);
    }

    const transactionUuid = decodedData.transaction_uuid;

    if (!transactionUuid) {
      return res.redirect(`${process.env.CLIENT_URL}/payment/failed`);
    }

    const payment = await Payment.findOne({
      transactionUuid,
      method: "esewa",
    });

    if (!payment) {
      return res.redirect(`${process.env.CLIENT_URL}/payment/failed`);
    }

    const order = await Order.findById(payment.order);

    if (!order) {
      return res.redirect(`${process.env.CLIENT_URL}/payment/failed`);
    }

    if (payment.status === "pending" && order.status === "pending") {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: {
            stock: item.quantity,
          },
        });
      }

      await Payment.findByIdAndUpdate(payment._id, {
        status: "failed",
      });

      await Order.findByIdAndUpdate(order._id, {
        status: "cancelled",
        paymentStatus: "failed",
        cancelledAt: new Date(),
        cancelReason: "eSewa payment failed or was cancelled",
      });

      await createNotification({
        recipient: payment.buyer,
        type: "payment",
        title: "Payment failed",
        message: `Your eSewa payment for order #${order.orderNumber} failed or was cancelled.`,
        relatedId: order._id,
      });
    }

    return res.redirect(
      `${process.env.CLIENT_URL}/payment/failed?orderId=${order._id}`,
    );
  } catch (error) {
    console.error("eSewa failure handler error:", error);

    return res.redirect(`${process.env.CLIENT_URL}/payment/failed`);
  }
};

// get eSewa payment status
export const getEsewaPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;

    const payment = await Payment.findOne({
      order: orderId,
      buyer: req.user.id,
      method: "esewa",
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "eSewa payment not found",
      });
    }

    if (!payment.transactionUuid) {
      return res.status(400).json({
        success: false,
        message: "eSewa transaction has not been initiated",
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      buyer: req.user.id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const result = await checkEsewaTransactionStatus({
      totalAmount: order.total,
      transactionUuid: payment.transactionUuid,
      productCode: payment.productCode || process.env.ESEWA_PRODUCT_CODE,
    });

    if (result.status === "COMPLETE" && payment.status !== "paid") {
      await Payment.findByIdAndUpdate(payment._id, {
        status: "paid",
        transactionId: result.refId,
        paidAt: new Date(),
      });

      await Order.findByIdAndUpdate(order._id, {
        paymentStatus: "paid",
        status: "confirmed",
      });

      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: {
            totalSold: item.quantity,
          },
        });
      }
    }

    return res.status(200).json({
      success: true,
      status: result.status,
      payment,
    });
  } catch (error) {
    console.error("Get eSewa payment status error:", error);

    return res.status(500).json({
      success: false,
      message: "Could not check eSewa payment status",
    });
  }
};
