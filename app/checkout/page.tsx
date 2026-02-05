"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Check, AlertCircle, X } from "lucide-react";

import {
  getProductPrice,
  getModulePrice,
  formatPrice,
  calculateShipping,
} from "@/app/utils/pricing";
import { useAppStore } from "../store/appStore";
import Image from "next/image";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

type PaystackResponse = { reference: string };

export default function Checkout() {
  const navigate = useRouter();
  const { cart, userRole, clearCart, addOrder } = useAppStore((store) => store);
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>("paystack");
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [showErrorToast, setShowErrorToast] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    name: "",
    address: "",
    city: "",
    postal: "",
    country: "South Africa",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target as HTMLInputElement;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (value) {
      setErrors((prev) => ({ ...prev, [name]: false }));
    }
  };

  const getCartItemTotal = (item: (typeof cart)[0]) => {
    const basePrice = getProductPrice(item.product, userRole);
    const modulesPrice = item.selectedModules.reduce((sum, moduleId) => {
      const mod = item.product.availableModules.find((m) => m.id === moduleId);
      return sum + (mod ? getModulePrice(mod, userRole) : 0);
    }, 0);
    return (basePrice + modulesPrice) * (item.quantity || 1);
  };

  const subtotal = cart.reduce((sum, item) => sum + getCartItemTotal(item), 0);
  const shipping = calculateShipping(subtotal);
  const total = subtotal + shipping;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    const amountSmallestUnit = Math.round(total * 100);

    if (paymentMethod === "paystack") {
      try {
        const resp = await fetch("/api/paystack/initialize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email || "customer@example.com",
            amount: amountSmallestUnit,
            metadata: {
              items: cart.map((i) => ({
                id: i.id,
                qty: i.quantity,
                product: i.product,
                selectedModules: i.selectedModules,
              })),
              subtotal,
              shipping,
              total,
            },
            callback_url: `${window.location.origin}/paystack/return`,
            currency: process.env.NEXT_PUBLIC_PAYSTACK_CURRENCY || undefined,
          }),
        });

        const data = await resp.json();
        if (!resp.ok) {
          setIsProcessing(false);
          alert(
            data?.message || data?.error || "Paystack initialization failed",
          );
          return;
        }

        const authUrl = data.data?.authorization_url;
        if (authUrl) {
          window.location.href = authUrl;
          return;
        }

        setIsProcessing(false);
        alert("Paystack did not return a redirect URL. Please try again.");
        return;
      } catch (err) {
        console.error("Paystack init error", err);
        setIsProcessing(false);
        alert("Payment initialization failed. Please try again.");
        return;
      }
    }

    // Offline / fallback flow: simulate processing and create order locally
    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      const order = {
        id: `ORD-${Date.now()}`,
        date: new Date(),
        items: cart,
        total,
        status: "pending" as const,
        role: userRole,
      };

      addOrder(order);
      clearCart();
      setOrderComplete(true);
      setTimeout(() => navigate.push("/orders"), 2000);
    } catch (err) {
      console.error("Checkout failed", err);
      setIsProcessing(false);
      alert("Order failed. Please try again.");
    }
  };

  useEffect(() => {
    if (cart.length === 0 && !orderComplete) {
      // Redirect to the cart page when there's nothing to checkout
      navigate.push("/cart");
    }
  }, [cart.length, orderComplete, navigate]);

  if (cart.length === 0 && !orderComplete) {
    return null;
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
            <Check className="size-10 text-primary" />
          </div>
          <h2 className="mb-3">Order Confirmed</h2>
          <p className="text-muted-foreground mb-8">
            Thank you for your order. We&apos;ll send a confirmation email
            shortly.
          </p>
          <div className="text-sm text-muted-foreground">
            Redirecting to your orders...
          </div>
        </motion.div>
      </div>
    );
  }

  const steps = ["Information", "Review", "Payment"];

  return (
    <div className="min-h-screen bg-background py-6 sm:py-12">
      <div className="max-w-300 mx-auto px-4 sm:px-6 md:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-12"
        >
          <h1 className="mb-4 sm:mb-6 text-2xl sm:text-3xl">Checkout</h1>

          {/* Progress Steps */}
          <div className="flex items-center gap-2 sm:gap-4">
            {steps.map((step, index) => (
              <div key={step} className="flex items-center gap-2 sm:gap-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div
                    className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-colors ${index + 1 <= currentStep
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground"
                      }`}
                  >
                    {index + 1 < currentStep ? (
                      <Check className="size-3 sm:size-4" />
                    ) : (
                      <span className="text-xs sm:text-sm">{index + 1}</span>
                    )}
                  </div>
                  <span
                    className={`text-xs sm:text-sm ${index + 1 <= currentStep
                      ? "text-foreground"
                      : "text-muted-foreground"
                      } hidden sm:inline`}
                  >
                    {step}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className="w-6 sm:w-12 h-px bg-border" />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleSubmit}
              className="bg-card rounded-xl border border-border p-4 sm:p-8"
            >
              {currentStep === 1 && (
                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <h3 className="mb-4 sm:mb-6 text-base sm:text-lg">
                      Contact Information
                    </h3>
                    <div className="space-y-3 sm:space-y-4">
                      <div>
                        <label
                          htmlFor="email"
                          className="block mb-2 text-xs sm:text-sm"
                        >
                          Email
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-input-background rounded-lg border focus:outline-none focus:ring-2 focus:ring-ring ${errors.email
                            ? "border-red-500 ring-red-500/20"
                            : "border-border"
                            }`}
                          placeholder="you@example.com"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="name"
                          className="block mb-2 text-xs sm:text-sm"
                        >
                          Full Name
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-input-background rounded-lg border focus:outline-none focus:ring-2 focus:ring-ring ${errors.name
                            ? "border-red-500 ring-red-500/20"
                            : "border-border"
                            }`}
                          placeholder="John Doe"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-border" />

                  <div>
                    <h3 className="mb-4 sm:mb-6 text-base sm:text-lg">
                      Shipping Address
                    </h3>
                    <div className="space-y-3 sm:space-y-4">
                      <div>
                        <label
                          htmlFor="address"
                          className="block mb-2 text-xs sm:text-sm"
                        >
                          Address
                        </label>
                        <input
                          type="text"
                          id="address"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          required
                          className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-input-background rounded-lg border focus:outline-none focus:ring-2 focus:ring-ring ${errors.address
                            ? "border-red-500 ring-red-500/20"
                            : "border-border"
                            }`}
                          placeholder="123 Main St"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <label
                            htmlFor="city"
                            className="block mb-2 text-xs sm:text-sm"
                          >
                            City
                          </label>
                          <input
                            type="text"
                            id="city"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            required
                            className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-input-background rounded-lg border focus:outline-none focus:ring-2 focus:ring-ring ${errors.city
                              ? "border-red-500 ring-red-500/20"
                              : "border-border"
                              }`}
                            placeholder="Cape Town"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="postal"
                            className="block mb-2 text-xs sm:text-sm"
                          >
                            Postal Code
                          </label>
                          <input
                            type="text"
                            id="postal"
                            name="postal"
                            value={formData.postal}
                            onChange={handleInputChange}
                            required
                            className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-input-background rounded-lg border focus:outline-none focus:ring-2 focus:ring-ring ${errors.postal
                              ? "border-red-500 ring-red-500/20"
                              : "border-border"
                              }`}
                            placeholder="8001"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const newErrors: Record<string, boolean> = {};
                      let hasError = false;

                      // Regex Patterns
                      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                      const postalRegex = /^[0-9]{4,5}$/; // 4 digits for SA, allow 5 for international compatibility
                      const nameRegex = /^[a-zA-Z\s'-]{2,}$/; // Basic name check

                      // Validate Email
                      if (!formData.email || !emailRegex.test(formData.email)) {
                        newErrors.email = true;
                        hasError = true;
                      }

                      // Validate Name (at least 2 chars)
                      if (!formData.name || formData.name.length < 2 || !nameRegex.test(formData.name)) {
                        newErrors.name = true;
                        hasError = true;
                      }

                      // Validate Address (at least 5 chars)
                      if (!formData.address || formData.address.length < 5) {
                        newErrors.address = true;
                        hasError = true;
                      }

                      // Validate City (at least 2 chars)
                      if (!formData.city || formData.city.length < 2) {
                        newErrors.city = true;
                        hasError = true;
                      }

                      // Validate Postal Code
                      if (!formData.postal || !postalRegex.test(formData.postal)) {
                        newErrors.postal = true;
                        hasError = true;
                      }

                      if (hasError) {
                        setErrors(newErrors);
                        setShowErrorToast(true);
                        setTimeout(() => setShowErrorToast(false), 3000);
                      } else {
                        setCurrentStep(2);
                      }
                    }}
                    className="w-full px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity"
                  >
                    Continue to Review
                  </button>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <h3 className="mb-4 sm:mb-6 text-base sm:text-lg">
                      Review Your Order
                    </h3>
                    <div className="space-y-3 sm:space-y-4">
                      {cart.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-secondary/50 rounded-lg"
                        >
                          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-secondary shrink-0 relative">
                            <Image
                              src={item.product.imageUrl}
                              alt={item.product.name}
                              className=" object-cover"
                              fill
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm sm:text-base truncate">
                              {item.product.name}
                            </h4>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              {item.selectedModules.length} modules selected
                            </p>
                          </div>
                          <span className="font-medium text-sm sm:text-base shrink-0">
                            {formatPrice(getCartItemTotal(item))}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="flex-1 px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base bg-secondary text-foreground rounded-xl hover:bg-muted transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="flex-1 px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity"
                    >
                      Continue to Payment
                    </button>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="mb-6">Payment Method</h3>
                    <div className="p-6 bg-secondary/50 rounded-lg text-center text-muted-foreground">
                      <div className="flex flex-col items-center gap-3">
                        <div className="text-sm">Choose a payment method</div>
                        <div className="flex items-center gap-4">
                          <label className="inline-flex items-center gap-2">
                            <input
                              type="radio"
                              name="payment"
                              value="paystack"
                              checked={paymentMethod === "paystack"}
                              onChange={() => setPaymentMethod("paystack")}
                              className="form-radio"
                            />
                            <span>Paystack</span>
                          </label>
                          <label className="inline-flex items-center gap-2">
                            <input
                              type="radio"
                              name="payment"
                              value="offline"
                              checked={paymentMethod === "offline"}
                              onChange={() => setPaymentMethod("offline")}
                              className="form-radio"
                            />
                            <span>Offline / Manual</span>
                          </label>
                        </div>

                        {paymentMethod === "paystack" ? (
                          <div className="text-xs text-muted-foreground">
                            You&apos;ll be redirected to Paystack to complete
                            the payment.
                          </div>
                        ) : (
                          <div className="text-xs text-muted-foreground">
                            We&apos;ll process your order and follow up with
                            payment instructions.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      disabled={isProcessing}
                      className="flex-1 px-6 py-4 bg-secondary text-foreground rounded-xl hover:bg-muted transition-colors disabled:opacity-50"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="flex-1 px-6 py-4 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {isProcessing ? "Processing..." : "Place Order"}
                    </button>
                  </div>
                </div>
              )}
            </motion.form>
          </div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:sticky lg:top-24 h-fit"
          >
            <div className="bg-card rounded-xl border border-border p-4 sm:p-6">
              <h3 className="mb-4 sm:mb-6 text-base sm:text-lg">
                Order Summary
              </h3>

              <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
                </div>
                {shipping === 0 && subtotal > 20000 && (
                  <div className="text-[10px] sm:text-xs text-accent">
                    Free shipping on orders over R 20,000
                  </div>
                )}
                <div className="h-px bg-border" />
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm sm:text-base">
                    Total
                  </span>
                  <span className="text-xl sm:text-2xl font-semibold">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>

              <div className="pt-4 sm:pt-6 border-t border-border text-xs sm:text-sm text-muted-foreground">
                <p className="mb-2">Estimated delivery: 5-7 business days</p>
                <p>Your order will be processed within 24 hours</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Error Toast */}
      <AnimatePresence>
        {showErrorToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 sm:top-8 left-1/2 -translate-x-1/2 z-50 px-4 sm:px-6 py-3 bg-destructive text-destructive-foreground rounded-xl shadow-lg flex items-center gap-3"
          >
            <AlertCircle className="size-5" />
            <span className="font-medium">
              Please check the highlighted fields
            </span>
            <button
              onClick={() => setShowErrorToast(false)}
              className="ml-2 p-1 hover:bg-black/10 rounded-full"
            >
              <X className="size-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
