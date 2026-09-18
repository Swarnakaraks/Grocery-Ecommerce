import mongoose from "mongoose";
import { Cart } from "../models/cart.model.js";
import { Product } from "../models/product.model.js";


const calculateCartTotals = async (cart) => {
    await cart.populate({
        path: "items.product",
        select:
            "price discountPrice stock isActive"
    });

    let subtotal = 0;
    let discount = 0;

    for (const item of cart.items) {
        const product = item.product;

        if (!product || !product.isActive) {
            continue;
        }

        const price = Number(product.price);

        const sellingPrice =
            product.discountPrice !== null &&
            product.discountPrice !== undefined
                ? Number(product.discountPrice)
                : price;

        subtotal +=
            price * item.quantity;

        discount +=
            (price - sellingPrice) *
            item.quantity;
    }

    cart.subtotal = Number(
        subtotal.toFixed(2)
    );

    cart.discount = Number(
        discount.toFixed(2)
    );

    cart.total = Number(
        (subtotal - discount).toFixed(2)
    );
};

export const addToCart = async (req, res) => {
    try {
        const { productId } = req.body;
        const { quantity = 1 } = req.body;

        if (!productId || quantity === undefined) {
            return res.status(400).json({
                success: false,
                message: "Product ID and quantity are required"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        const numericQuantity = Number(quantity);

        if (
            !Number.isInteger(numericQuantity) ||
            numericQuantity < 1
        ) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be at least 1"
            });
        }

        const product = await Product.findOne({
            _id: productId,
            isActive: true
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        if (product.stock < numericQuantity) {
            return res.status(400).json({
                success: false,
                message: `Only ${product.stock} items are available`
            });
        }

        let cart = await Cart.findOne({
            buyer: req.user.id
        });

        if (!cart) {
            cart = await Cart.create({
                buyer: req.user.id,
                items: [
                    {
                        product: productId,
                        quantity: numericQuantity
                    }
                ]
            });
        } else {
            const existingItem = cart.items.find(
                (item) =>
                    item.product.toString() ===
                    productId
            );

            if (existingItem) {
                const newQuantity =
                    existingItem.quantity +
                    numericQuantity;

                if (newQuantity > product.stock) {
                    return res.status(400).json({
                        success: false,
                        message: `Only ${product.stock} items are available`
                    });
                }

                existingItem.quantity =
                    newQuantity;
            } else {
                cart.items.push({
                    product: productId,
                    quantity: numericQuantity
                });
            }

            await cart.save();
        }

        await cart.populate({
            path: "items.product",
            select:
                "name slug price discountPrice stock unit images brand"
        });

        await calculateCartTotals(cart);

        await cart.save();

        return res.status(200).json({
            success: true,
            message: "Product added to cart",
            cart
        });
    } catch (error) {
        console.error(
            "Add to cart error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Could not add product to cart"
        });
    }
};

export const getMyCart = async (req, res) => {
    try {
        let cart = await Cart.findOne({
            buyer: req.user.id
        }).populate({
            path: "items.product",
            select:
                "name slug price discountPrice stock unit images brand isActive"
        });

        if (!cart) {
            return res.status(200).json({
                success: true,
                cart: {
                    items: [],
                    subtotal: 0,
                    discount: 0,
                    total: 0
                }
            });
        }

        await calculateCartTotals(cart);

        await cart.save();

        return res.status(200).json({
            success: true,
            cart
        });
    } catch (error) {
        console.error(
            "Get cart error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Could not fetch cart"
        });
    }
};

export const updateCartItem = async (
    req,
    res
) => {
    try {
        const { productId } = req.params;
        const { quantity } = req.body;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        const numericQuantity = Number(quantity);

        if (
            !Number.isInteger(numericQuantity) ||
            numericQuantity < 1
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Quantity must be at least 1"
            });
        }

        const product = await Product.findOne({
            _id: productId,
            isActive: true
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        if (numericQuantity > product.stock) {
            return res.status(400).json({
                success: false,
                message: `Only ${product.stock} items are available`
            });
        }

        const cart = await Cart.findOne({
            buyer: req.user.id
        });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }

        const item = cart.items.find(
            (item) =>
                item.product.toString() ===
                productId
        );

        if (!item) {
            return res.status(404).json({
                success: false,
                message:
                    "Product is not in your cart"
            });
        }

        item.quantity = numericQuantity;

        await calculateCartTotals(cart);

        await cart.save();

        await cart.populate({
            path: "items.product",
            select:
                "name slug price discountPrice stock unit images brand"
        });

        return res.status(200).json({
            success: true,
            message:
                "Cart quantity updated successfully",
            cart
        });
    } catch (error) {
        console.error(
            "Update cart quantity error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Could not update cart quantity"
        });
    }
};

export const removeFromCart = async (
    req,
    res
) => {
    try {
        const { productId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        const cart = await Cart.findOne({
            buyer: req.user.id
        });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }

        const itemExists = cart.items.some(
            (item) =>
                item.product.toString() ===
                productId
        );

        if (!itemExists) {
            return res.status(404).json({
                success: false,
                message:
                    "Product is not in your cart"
            });
        }

        cart.items = cart.items.filter(
            (item) =>
                item.product.toString() !==
                productId
        );

        await calculateCartTotals(cart);

        await cart.save();

        return res.status(200).json({
            success: true,
            message:
                "Product removed from cart",
            cart
        });
    } catch (error) {
        console.error(
            "Remove from cart error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Could not remove product from cart"
        });
    }
};

export const clearCart = async (
    req,
    res
) => {
    try {
        const cart = await Cart.findOne({
            buyer: req.user.id
        });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }

        cart.items = [];
        cart.subtotal = 0;
        cart.discount = 0;
        cart.total = 0;

        await cart.save();

        return res.status(200).json({
            success: true,
            message: "Cart cleared successfully",
            cart
        });
    } catch (error) {
        console.error(
            "Clear cart error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Could not clear cart"
        });
    }
};