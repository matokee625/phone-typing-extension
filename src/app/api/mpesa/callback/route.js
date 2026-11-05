import { NextResponse } from 'next/server';

// Force Node.js runtime for Safaricom Daraja callback handler
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const callbackData = await request.json();
    console.log('Safaricom Daraja STK Callback Received:', JSON.stringify(callbackData, null, 2));

    const result = callbackData?.Body?.stkCallback;
    const resultCode = result?.ResultCode;
    const resultDesc = result?.ResultDesc;
    const checkoutRequestId = result?.CheckoutRequestID;

    if (resultCode === 0) {
      // Payment successful
      const metaItems = result?.CallbackMetadata?.Item || [];
      const receiptItem = metaItems.find((item) => item.Name === 'MpesaReceiptNumber');
      const amountItem = metaItems.find((item) => item.Name === 'Amount');
      const phoneItem = metaItems.find((item) => item.Name === 'PhoneNumber');

      const receiptNumber = receiptItem?.Value || 'QKM' + Date.now().toString().slice(-6);
      const amount = amountItem?.Value;
      const phone = phoneItem?.Value;

      return NextResponse.json({
        ResultCode: 0,
        ResultDesc: 'Callback processed successfully',
        receiptNumber,
        amount,
        phone,
      });
    } else {
      // User cancelled or transaction failed
      return NextResponse.json({
        ResultCode: resultCode,
        ResultDesc: resultDesc || 'Transaction was cancelled by user',
      });
    }
  } catch (error) {
    return NextResponse.json(
      { ResultCode: 1, ResultDesc: 'Error handling Safaricom callback' },
      { status: 500 }
    );
  }
}

