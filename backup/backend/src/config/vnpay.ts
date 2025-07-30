export const vnpayConfig = {
  tmnCode: process.env.VNP_TMNCODE || 'MIUJRREB',
  hashSecret: process.env.VNP_HASHSECRET || '5CI57Z1ABU2L8BHN3KBB96LQ0CD1WM8E',
  url: process.env.VNP_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
  returnUrl: process.env.VNP_RETURN_URL || 'http://localhost:3000/payment/vnpay-return'
}
