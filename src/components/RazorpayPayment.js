// components/RazorpayPayment.js
'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth } from '@/lib/firebase';

const Loader = ({ size = 'sm' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <div className="flex justify-center items-center">
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-gray-200 border-t-green-600`}
      ></div>
    </div>
  );
};

export default function RazorpayPayment({
  amount,
  charityId,
  charityName,
  onSuccess,
  onClose,
}) {
  const [processing, setProcessing] = useState(false);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setProcessing(true);

    try {
      // Load Razorpay script
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        toast.error('Failed to load payment gateway');
        setProcessing(false);
        return;
      }

      // Create order from backend
      const response = await fetch('/api/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount,
          currency: 'INR',
        }),
      });

      const orderData = await response.json();

      if (!orderData.success) {
        throw new Error('Failed to create order');
      }

      const user = auth.currentUser;

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Donation Platform',
        description: `Donation to ${charityName}`,
        order_id: orderData.orderId,
        handler: async (response) => {
          // Verify payment
          const verificationResponse = await fetch('/api/verify-payment', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          const verificationData = await verificationResponse.json();

          if (verificationData.success) {
            // Save donation to Firebase
            await addDoc(collection(db, 'donations'), {
              amount: amount,
              charityId: charityId,
              userId: user?.uid || null,
              userEmail: user?.email || null,
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              status: 'success',
              createdAt: serverTimestamp(),
            });

            toast.success('Payment successful! 🎉');
            onSuccess && onSuccess();

            // Close modal after 2 seconds
            setTimeout(() => {
              onClose();
            }, 2000);
          } else {
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          name: user?.displayName || '',
          email: user?.email || '',
          contact: user?.phoneNumber || '',
        },
        notes: {
          charity_id: charityId,
          charity_name: charityName,
        },
        theme: {
          color: '#7CB518',
        },
        modal: {
          ondismiss: () => {
            setProcessing(false);
            toast.info('Payment cancelled');
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={processing}
      className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      {processing ? (
        <>
          <Loader size="sm" />
          <span>Processing...</span>
        </>
      ) : (
        `Pay ₹${amount}`
      )}
    </button>
  );
}
