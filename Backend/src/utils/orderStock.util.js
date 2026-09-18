import { Product } from "../models/product.model.js";

export const restoreOrderStock = async (order) => {
    for (const item of order.items) {
        await Product.findByIdAndUpdate(
            item.product,
            {
                $inc: {
                    stock: item.quantity
                }
            }
        );
    }
};