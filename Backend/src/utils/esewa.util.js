import crypto from "crypto";

export const generateEsewaSignature = ({
    totalAmount,
    transactionUuid,
    productCode
}) => {
    const secretKey = process.env.ESEWA_SECRET_KEY;

    if (!secretKey) {
        throw new Error(
            "ESEWA_SECRET_KEY is not configured"
        );
    }

    const message =
        `total_amount=${totalAmount},` +
        `transaction_uuid=${transactionUuid},` +
        `product_code=${productCode}`;

    return crypto
        .createHmac("sha256", secretKey)
        .update(message)
        .digest("base64");
};

export const generateEsewaResponseSignature = ({
    transactionCode,
    status,
    totalAmount,
    transactionUuid,
    productCode,
    signedFieldNames
}) => {
    const secretKey = process.env.ESEWA_SECRET_KEY;

    if (!secretKey) {
        throw new Error(
            "ESEWA_SECRET_KEY is not configured"
        );
    }

    const fields = {
        transaction_code: transactionCode,
        status,
        total_amount: totalAmount,
        transaction_uuid: transactionUuid,
        product_code: productCode,
        signed_field_names: signedFieldNames
    };

    const message = signedFieldNames
        .split(",")
        .map(
            (field) =>
                `${field}=${fields[field]}`
        )
        .join(",");

    return crypto
        .createHmac("sha256", secretKey)
        .update(message)
        .digest("base64");
};

export const verifyEsewaResponseSignature = (
    data
) => {
    const expectedSignature =
        generateEsewaResponseSignature({
            transactionCode:
                data.transaction_code,
            status: data.status,
            totalAmount:
                data.total_amount,
            transactionUuid:
                data.transaction_uuid,
            productCode:
                data.product_code,
            signedFieldNames:
                data.signed_field_names
        });

    const expectedBuffer =
        Buffer.from(expectedSignature);

    const receivedBuffer =
        Buffer.from(data.signature || "");

    if (
        expectedBuffer.length !==
        receivedBuffer.length
    ) {
        return false;
    }

    return crypto.timingSafeEqual(
        expectedBuffer,
        receivedBuffer
    );
};

export const generateTransactionUuid = () => {
    const timestamp = Date.now();

    const random = crypto
        .randomBytes(4)
        .toString("hex");

    return `FM-${timestamp}-${random}`;
};