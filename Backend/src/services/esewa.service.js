export const getEsewaPaymentUrl = () => {
    return (
        process.env.ESEWA_PAYMENT_URL ||
        "https://rc-epay.esewa.com.np/api/epay/main/v2/form"
    );
};

export const checkEsewaTransactionStatus = async ({
    totalAmount,
    transactionUuid,
    productCode
}) => {
    const statusUrl =
        process.env.ESEWA_STATUS_URL ||
        "https://uat.esewa.com.np/api/epay/transaction/status/";

    const params = new URLSearchParams({
        product_code: productCode,
        total_amount: String(totalAmount),
        transaction_uuid: transactionUuid
    });

    const response = await fetch(
        `${statusUrl}?${params.toString()}`,
        {
            method: "GET",
            headers: {
                Accept: "application/json"
            }
        }
    );

    if (!response.ok) {
        throw new Error(
            `eSewa status API returned ${response.status}`
        );
    }

    return response.json();
};