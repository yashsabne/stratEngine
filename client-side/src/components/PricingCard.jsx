import { useState } from 'react';
import { FiCheck, FiX } from 'react-icons/fi';
import axios from 'axios';

import { backendUrl } from '../constants';



const PricingCard = ({ plan, user, onUpgrade,fetchData }) => {
    const [loading, setLoading] = useState(false);

    const handleUpgrade = async () => {
        try {
            setLoading(true);

            const response = await axios.post(
                `${backendUrl}/api/plans/create-order`,
                { planId: plan._id },
                { withCredentials: true }
            );

            const orderData = response.data;
            loadRazorpayScript(orderData);

        } catch (error) {
            console.error('Error creating order:', error);
            alert('Error initiating payment');
            setLoading(false);
        }
    };

    const loadRazorpayScript = (orderData) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => {
            initializeRazorpay(orderData);
        };
        document.body.appendChild(script);
    };

    const initializeRazorpay = (orderData) => {
        const options = {
            key: orderData.key,
            amount: orderData.amount,
            currency: orderData.currency,
            name: 'Strat-Engine',
            description: `Upgrade to ${plan.name} Plan`,
            image: '/logo.png',
            order_id: orderData.orderId,
            handler: async function (response) {
                try {
                    const verifyResponse = await axios.post(`${backendUrl}/api/plans/verify-payment`, {
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature,
                        planId: plan._id,
                    },
                        { withCredentials: true });

                    if (verifyResponse.data.success) {
                        onUpgrade(plan.name.toLowerCase());
                        fetchData();
                        alert('Plan upgraded successfully!');
                    } else {
                        alert('Payment verification failed');
                    }
                } catch (error) {
                    console.error('Error verifying payment:', error);
                    alert('Error verifying payment');
                }
            },
            theme: {
                color: '#6366f1',
            },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
        setLoading(false);
    };

    return (
        <div className="bg-gray-700/50 border border-gray-600 rounded-xl p-6">
            <h3 className="text-lg font-medium text-gray-200 mb-2">{plan.name}</h3>
            <p className="text-3xl font-bold text-gray-100 mb-4">
                ₹{plan.price}
                <span className="text-sm font-normal text-gray-400">/month</span>
            </p>

            <ul className="space-y-2 text-sm text-gray-300 mb-6">
                {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                        <FiCheck className="text-green-500 mr-2" />
                        <span>{feature}</span>
                    </li>
                ))}
                {plan.name === 'Free' && (
                    <>
                    <li className="flex items-center">
                        <FiX className="text-red-500 mr-2" />
                        <span className="text-gray-400">Priority support</span>
                    </li>
                      <li className="flex items-center">
                        <FiX className="text-red-500 mr-2" />
                        <span className="text-gray-400">Advanced Analytics</span>
                    </li>
                    </>
                )}
            </ul>

            <button
                className={`w-full py-2 px-4 rounded-lg font-medium ${plan.name.toLowerCase() === 'free' || user.user.plan === plan.name.toLowerCase()
                        ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                        : 'bg-gray-600 hover:bg-gray-500 text-white'
                    }`}
                disabled={plan.name.toLowerCase() === 'free' || user.user.plan === plan.name.toLowerCase() || loading}
                onClick={handleUpgrade}
            >
                {loading
                    ? 'Processing...'
                    : plan.name.toLowerCase() === 'free'
                        ? 'Compare'
                        : user.user.plan === plan.name.toLowerCase()
                            ? 'Current Plan'
                            : `Upgrade to ${plan.name}`}
            </button>

        </div>
    );
};

export default PricingCard;
