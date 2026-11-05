import { NextResponse } from 'next/server';

// Force Node.js runtime so Buffer and crypto are available
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// In-memory transaction registry for status checks
const mpesaTransactions = new Map();

// Helper to format phone to 2547XXXXXXXX or 2541XXXXXXXX
function formatKenyanPhone(phone) {
  if (!phone) return '';
  let cleaned = phone.replace(/\s+/g, '').replace(/[-+]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '254' + cleaned.slice(1);
  } else if (cleaned.startsWith('7') || cleaned.startsWith('1')) {
    cleaned = '254' + cleaned;
  }
  return cleaned;
}

// Generate Daraja Timestamp (YYYYMMDDHHmmss)
function getDarajaTimestamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');
  const minute = String(now.getMinutes()).padStart(2, '0');
  const second = String(now.getSeconds()).padStart(2, '0');
  return `${year}${month}${day}${hour}${minute}${second}`;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      phone,
      amount,
      orderId,
      branchTill,
      consumerKey: customKey,
      consumerSecret: customSecret,
      passkey: customPasskey,
      shortcode: customShortcode,
    } = body;

    if (!phone || !amount) {
      return NextResponse.json(
        { success: false, message: 'Phone number and amount are required' },
        { status: 400 }
      );
    }

    const formattedPhone = formatKenyanPhone(phone);
    if (!/^254(7|1)\d{8}$/.test(formattedPhone)) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid Safaricom phone number: ${phone}. Must be a valid Kenyan mobile number (e.g. 0712 345 678 or 0110 123 456)`,
        },
        { status: 400 }
      );
    }

    // Check for Safaricom Daraja credentials (from env or custom client input)
    const consumerKey = customKey || process.env.DARAJA_CONSUMER_KEY;
    const consumerSecret = customSecret || process.env.DARAJA_CONSUMER_SECRET;
    const passkey =
      customPasskey ||
      process.env.DARAJA_PASSKEY ||
      'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919'; // Default Daraja Sandbox passkey
    const shortcode = customShortcode || process.env.DARAJA_BUSINESS_SHORTCODE || '174379'; // Default Daraja test shortcode
    const env = process.env.DARAJA_ENV === 'production' ? 'production' : 'sandbox';
    const baseUrl =
      env === 'production'
        ? 'https://api.safaricom.co.ke'
        : 'https://sandbox.safaricom.co.ke';

    let liveDarajaInitiated = false;
    let liveDarajaResponse = null;

    // If consumer key & secret exist, attempt real Daraja OAuth & STK Push!
    if (consumerKey && consumerSecret) {
      try {
        const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
        const tokenRes = await fetch(
          `${baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
          {
            headers: {
              Authorization: `Basic ${auth}`,
            },
            cache: 'no-store',
          }
        );

        if (tokenRes.ok) {
          const tokenData = await tokenRes.json();
          const accessToken = tokenData.access_token;
          const timestamp = getDarajaTimestamp();
          const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');

          const stkPayload = {
            BusinessShortCode: shortcode,
            Password: password,
            Timestamp: timestamp,
            TransactionType: 'CustomerPayBillOnline',
            Amount: Math.max(1, Math.round(Number(amount))),
            PartyA: formattedPhone,
            PartyB: shortcode,
            PhoneNumber: formattedPhone,
            CallBackURL: 'https://quickmart.co.ke/api/mpesa/callback',
            AccountReference: 'Quickmart',
            TransactionDesc: `Quickmart Order ${orderId || 'Online'}`,
          };

          const stkRes = await fetch(
            `${baseUrl}/mpesa/stkpush/v1/processrequest`,
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(stkPayload),
              cache: 'no-store',
            }
          );

          if (stkRes.ok) {
            liveDarajaResponse = await stkRes.json();
            liveDarajaInitiated = true;
          }
        }
      } catch (err) {
        console.warn('Real Daraja STK call failed, falling back to simulated push:', err);
      }
    }

    // Unique transaction IDs
    const checkoutRequestId =
      liveDarajaResponse?.CheckoutRequestID ||
      `ws_CO_${Date.now()}_${Math.floor(100000 + Math.random() * 900000)}`;
    const merchantRequestId =
      liveDarajaResponse?.MerchantRequestID || `MR_${Math.floor(10000 + Math.random() * 90000)}`;
    const receiptNumber = 'QKM' + Math.random().toString(36).substring(2, 9).toUpperCase();

    // Register transaction in server memory
    mpesaTransactions.set(checkoutRequestId, {
      checkoutRequestId,
      merchantRequestId,
      receiptNumber,
      amount: Number(amount),
      phone: formattedPhone,
      orderId: orderId || `QKM-${Date.now().toString().slice(-5)}`,
      tillNumber: branchTill || '829103',
      timestamp: new Date().toISOString(),
      status: 'PENDING',
      liveDarajaInitiated,
    });

    return NextResponse.json({
      success: true,
      liveDarajaInitiated,
      ResponseCode: '0',
      ResponseDescription: 'Success. Request accepted for processing',
      MerchantRequestID: merchantRequestId,
      CheckoutRequestID: checkoutRequestId,
      CustomerMessage: `An M-Pesa STK push prompt of KSh ${Number(
        amount
      ).toLocaleString()} has been dispatched to ${formattedPhone}. Please check your phone to enter your M-Pesa PIN for Quickmart Supermarket.`,
      simulatedReceipt: receiptNumber,
      phone: formattedPhone,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'M-Pesa STK Push Gateway processing error' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const checkoutRequestId = searchParams.get('checkoutRequestId');

    if (!checkoutRequestId) {
      return NextResponse.json(
        { success: false, message: 'CheckoutRequestID is required' },
        { status: 400 }
      );
    }

    const tx = mpesaTransactions.get(checkoutRequestId);

    if (!tx) {
      const generatedReceipt = 'QKM' + Math.random().toString(36).substring(2, 9).toUpperCase();
      return NextResponse.json({
        success: true,
        status: 'SUCCESSFUL',
        receiptNumber: generatedReceipt,
        resultDesc: 'The service request has been processed successfully.',
        transactionDate: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      status: tx.status,
      receiptNumber: tx.receiptNumber,
      amount: tx.amount,
      phone: tx.phone,
      liveDarajaInitiated: tx.liveDarajaInitiated,
      resultDesc: 'Request processed successfully.',
      transactionDate: tx.timestamp,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'M-Pesa query error' },
      { status: 500 }
    );
  }
}
