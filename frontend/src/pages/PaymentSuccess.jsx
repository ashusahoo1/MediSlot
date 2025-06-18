import { useEffect, useState } from "react";
import { useSearchParams} from "react-router-dom";
import { RiseLoader } from "react-spinners";
import { useAppContext } from "../context/AppContext";

const PaymentSuccess = () => {
    const [searchParams] = useSearchParams();
    const [sessionData, setSessionData] = useState(null);
    const [loading, setLoading] = useState(true);
    const sessionId = searchParams.get("session_id");
    const {navigate} = useAppContext();

    useEffect(() => {
        const fetchSession = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/stripe/session/${sessionId}`);
                const data = await res.json();
                console.log(data)
                if (res.ok) {
                    setSessionData(data.session);
                }
            } catch (err) {
                console.error("Error fetching session:", err);
            } finally {
                setLoading(false);
            }
        };

        if (sessionId) {
            fetchSession();
        }
    }, [sessionId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <RiseLoader color="#80ff6f" size={15} margin={2} />
            </div>
        );
    }

    if (!sessionData) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="bg-red-100 text-red-700 p-6 rounded-xl shadow-xl">
                    Unable to fetch payment details. Please try again.
                </div>
            </div>
        );
    }

    //free version doesnt support sending automatic email invoices
    // const receiptUrl = sessionData?.payment_intent?.charges?.data?.[0]?.receipt_url;

    return (
        <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-green-50 to-white px-4">
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md text-center border border-green-100">
                <div className="text-4xl mb-2 text-green-500">✅</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Payment Successful!
                </h2>
                <p className="text-gray-600 mb-6">
                    Thank you! Your appointment has been confirmed.
                </p>

                <div className="bg-gray-50 rounded-xl p-4 text-left text-sm text-gray-700 space-y-2 border">
                    <p><span className="font-medium">Amount Paid:</span> ${(sessionData.amount_total/ 100).toFixed(2)} USD</p>
                    <p><span className="font-medium">Payment ID:</span> {sessionData.payment_intent.id}</p>
                    <p><span className="font-medium">Email:</span> {sessionData.customer_details.email}</p>
                    {/* {receiptUrl && (
                        <p>
                            <a
                                href={receiptUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                            >
                                View Receipt
                            </a>
                        </p>
                    )} */}
                </div>

                <button
                    onClick={() => navigate("/patients/profile")}
                    className="mt-6 bg-green-600 text-white px-6 py-2 rounded-full hover:bg-primary-dull cursor-pointer transition"
                >
                    Go to Dashboard
                </button>
            </div>
        </div>
    );
};

export default PaymentSuccess;
