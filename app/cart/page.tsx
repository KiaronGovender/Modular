"use client";
import { motion } from "framer-motion";
import { Trash2, ShoppingBag, AlertCircle } from "lucide-react";

import {
  getProductPrice,
  getModulePrice,
  formatPrice,
  calculateShipping,
} from "@/app/utils/pricing";
import { ROLE_REQUIREMENTS } from "@/app/types";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppStore } from "../store/appStore";
import Image from "next/image";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Cart() {
  const navigate = useRouter();
  const { cart, removeFromCart, userRole } = useAppStore((store) => store);

  const getCartItemTotal = (item: (typeof cart)[0]) => {
    const basePrice = getProductPrice(item.product, userRole);
    const modulesPrice = item.selectedModules.reduce((sum, moduleId) => {
      const mod = item.product.availableModules.find((m) => m.id === moduleId);
      return sum + (mod ? getModulePrice(mod, userRole) : 0);
    }, 0);
    return (basePrice + modulesPrice) * item.quantity;
  };

  const getTotalQuantity = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const minimumOrderQuantity = ROLE_REQUIREMENTS[userRole].minimumOrderQuantity;
  const totalQuantity = getTotalQuantity();
  const meetsMinimumOrder = totalQuantity >= minimumOrderQuantity;

  const subtotal = cart.reduce((sum, item) => sum + getCartItemTotal(item), 0);
  const shipping = calculateShipping(subtotal);
  const total = subtotal + shipping;

  if (cart.length === 0) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <ShoppingBag className="size-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-8">
              Start building your perfect setup
            </p>
            <button
              onClick={() => navigate.push("/")}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity"
            >
              Browse Products
            </button>
          </motion.div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background py-12">
        <div className="max-w-300 mx-auto px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <h1 className="mb-2">Cart</h1>
            <p className="text-muted-foreground">
              {cart.length} {cart.length === 1 ? "item" : "items"} in your cart
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item, index) => {
                const selectedModuleObjects = item.selectedModules
                  .map((id) =>
                    item.product.availableModules.find((m) => m.id === id),
                  )
                  .filter(Boolean);

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-card rounded-xl border border-border p-6"
                  >
                    <div className="flex gap-6">
                      {/* Product Image */}
                      <div className="w-32 h-32 rounded-lg overflow-hidden bg-secondary shrink-0 relative">
                        <Image
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="object-cover"
                          fill
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="mb-1">{item.product.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {item.product.description}
                            </p>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>

                        {/* Selected Modules */}
                        {selectedModuleObjects.length > 0 && (
                          <div className="space-y-1 mb-3">
                            {selectedModuleObjects.map((mod) => (
                              <div
                                key={mod!.id}
                                className="flex items-center justify-between text-sm"
                              >
                                <span className="text-muted-foreground">
                                  {mod!.name}
                                </span>
                                {getModulePrice(mod!, userRole) > 0 && (
                                  <span className="text-muted-foreground">
                                    +
                                    {formatPrice(
                                      getModulePrice(mod!, userRole),
                                    )}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Quantity */}
                        {item.quantity > 1 && (
                          <div className="mb-3 px-3 py-2 bg-secondary/30 rounded-lg">
                            <span className="text-sm text-muted-foreground">
                              Quantity:{" "}
                              <span className="text-foreground font-medium">
                                {item.quantity} units
                              </span>
                            </span>
                          </div>
                        )}

                        {/* Item Total */}
                        <div className="flex items-center justify-between pt-3 border-t border-border">
                          <span className="text-sm text-muted-foreground">
                            Item total
                          </span>
                          <span className="font-medium">
                            {formatPrice(getCartItemTotal(item))}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:sticky lg:top-24 h-fit"
            >
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="mb-6">Order Summary</h3>

                {/* MOQ Warning */}
                {!meetsMinimumOrder && minimumOrderQuantity > 1 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg"
                  >
                    <div className="flex items-start gap-3">
                      <AlertCircle className="size-5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-amber-900 dark:text-amber-100 mb-1">
                          Minimum Order Not Met
                        </p>
                        <p className="text-xs text-amber-800 dark:text-amber-200">
                          You need {minimumOrderQuantity - totalQuantity} more{" "}
                          {minimumOrderQuantity - totalQuantity === 1
                            ? "unit"
                            : "units"}{" "}
                          to meet the{" "}
                          {ROLE_REQUIREMENTS[userRole].discount.toLowerCase()}{" "}
                          minimum order requirement.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Total Quantity Badge */}
                {minimumOrderQuantity > 1 && (
                  <div className="mb-4 px-4 py-3 bg-secondary/50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Total Quantity
                      </span>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-medium ${
                            meetsMinimumOrder
                              ? "text-primary"
                              : "text-amber-600"
                          }`}
                        >
                          {totalQuantity} / {minimumOrderQuantity} units
                        </span>
                        {meetsMinimumOrder && (
                          <span className="size-5 flex items-center justify-center bg-primary/10 text-primary rounded-full">
                            <Check className="size-3" />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>
                      {shipping === 0 ? "Free" : formatPrice(shipping)}
                    </span>
                  </div>
                  <div className="h-px bg-border" />
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Total</span>
                    <span className="text-2xl font-semibold">
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => navigate.push("/checkout")}
                  disabled={!meetsMinimumOrder}
                  className={`w-full px-6 py-4 rounded-xl transition-all ${
                    meetsMinimumOrder
                      ? "bg-primary text-primary-foreground hover:opacity-90"
                      : "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                  }`}
                >
                  {meetsMinimumOrder
                    ? "Proceed to Checkout"
                    : "Minimum Order Not Met"}
                </button>

                <button
                  onClick={() => navigate.push("/")}
                  className="w-full mt-3 px-6 py-3 text-muted-foreground hover:text-foreground transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
