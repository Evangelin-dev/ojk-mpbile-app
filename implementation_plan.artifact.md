# Implementation Plan - Real Razorpay Payment Integration

This plan outlines the steps to replace the simulated payment flow with a real Razorpay Checkout integration in the OJK Jobs mobile application.

## User Review Required

> [!IMPORTANT]
> Razorpay requires native modules and **cannot run in standard Expo Go**. You will need to use a development build (`npx expo run:android` or `npx expo run:ios`).
>
> The backend pricing (₹599, ₹899, ₹1499) differs from the frontend display (₹999, ₹2499, ₹4999). I will ensure the frontend uses the backend-generated order amount to avoid discrepancies, but you may want to align the displayed prices in `PLANS_DATA`.

## Proposed Changes

### 1. Mobile App Configuration

#### [MODIFY] [package.json](file:///C:/Bot Company Projects/ojk-mpbile-app/package.json)
- Add `react-native-razorpay` to dependencies.

#### [MODIFY] [app.json](file:///C:/Bot Company Projects/ojk-mpbile-app/app.json)
- Add necessary Razorpay configuration if required (e.g., package name is already set).

### 2. Mobile App Implementation

#### [MODIFY] [EmployerPricingPlansScreen.tsx](file:///C:/Bot Company Projects/ojk-mpbile-app/src/screens/EmployerPricingPlansScreen.tsx)
- Import `RazorpayCheckout` from `react-native-razorpay`.
- Update `handlePurchase` function:
    1. Call `createPlanOrder`.
    2. Extract `order` details and `key` from response.
    3. Construct Razorpay options.
    4. Call `RazorpayCheckout.open(options)`.
    5. On success, call `verifyPlanPayment` with `razorpay_payment_id`, `razorpay_order_id`, and `razorpay_signature`.
    6. Refresh plan on success.
    7. Handle errors and cancellations gracefully.

### 3. Backend Implementation

#### [MODIFY] [paymentController.ts](file:///C:/Bot Company Projects/ojk-jobs/backend/src/controllers/paymentController.ts)
- Improve `verifyPlanPayment` security:
    - Retrieve `planType` from the existing `payment` record in the database instead of trusting `req.body.planType`.
    - Ensure `isActive` flag and `jobsUsed` are updated correctly.
    - Add checks to prevent double-processing of the same payment.

## Verification Plan

### Automated Tests
- N/A (Manual verification required for payment flow).

### Manual Verification
1. **Order Creation**: Verify that tapping "Buy Now" calls the backend and returns a valid Razorpay order ID.
2. **Checkout UI**: Verify that the official Razorpay Checkout UI opens on the device/emulator.
3. **Test Payment**: Perform a test payment using Razorpay's test credentials (UPI/Card).
4. **Signature Verification**: Ensure the mobile app sends the signature to the backend and the backend verifies it using the secret key.
5. **Plan Activation**: Verify that the "Active Plan" card updates on the pricing screen after a successful payment.
6. **Cancellation**: Verify that closing the checkout UI without paying does not activate the plan and shows a proper message.
