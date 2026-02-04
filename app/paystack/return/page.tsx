"use client";

import { useEffect, useState } from "react";
import { useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check, AlertTriangle } from "lucide-react";
import { useAppStore } from "@/app/store/appStore";
import {
  getProductPrice,
  getModulePrice,
  calculateShipping,
  formatPrice,
} from "@/app/utils/pricing";

export default function PaystackReturn() {
  const search = useSearchParams();
  const router = useRouter();
  const reference = search.get("reference");
  const { cart, addOrder, clearCart, userRole } = useAppStore((s) => s);
  const [status, setStatus] = useState<"loading" | "success" | "failed">(
    reference ? "loading" : "failed",
  );
  const [message, setMessage] = useState<string | null>(
    reference ? null : "Missing payment reference.",
  );

  const didVerify = useRef(false);

  useEffect(() => {
    if (!reference || didVerify.current) return;
    didVerify.current = true;

    const verify = async () => {
      try {
        const resp = await fetch(
          `/api/paystack/verify?reference=${encodeURIComponent(reference)}`,
        );
        const data = await resp.json();
        if (!resp.ok) {
          setStatus("failed");
          setMessage(data?.error || "Verification failed");
          return;
        }

        // Paystack verification response shape: { status: true, message, data: { status: 'success'|'failed', ... } }
        const transaction = data.data;
        if (transaction?.status === "success") {
          // Attempt to read the persisted store directly from localStorage first.
          // This avoids a race where zustand persist hasn't rehydrated before this effect runs.
          let itemsSnapshot = [...cart];
          try {
            const raw = localStorage.getItem("modular-store");
            if (raw) {
              const parsed = JSON.parse(raw);
              const stored = parsed?.state ?? parsed;
              if (stored?.cart && Array.isArray(stored.cart)) {
                itemsSnapshot = stored.cart;
              }
            }
          } catch (e) {
            // ignore and fallback to in-memory cart
          }

          // If localStorage was empty, fall back to Paystack metadata (if present)
          if (
            (!itemsSnapshot || itemsSnapshot.length === 0) &&
            transaction.metadata?.items
          ) {
            try {
              // metadata items were serialized from the checkout, so they should
              // contain `product`, `selectedModules` and `qty`/`quantity` fields.
              itemsSnapshot = transaction.metadata.items.map((it: any) => ({
                id: it.id || `${Date.now()}-${Math.random()}`,
                productId: it.product?.id || it.productId,
                product: it.product,
                selectedModules: it.selectedModules || [],
                quantity: it.qty ?? it.quantity ?? 1,
              }));
            } catch (e) {
              // ignore and keep itemsSnapshot as-is
            }
          }

          // Compute subtotal using pricing utilities (includes modules and quantity)
          const subtotal = itemsSnapshot.reduce((sum, item) => {
            const base = getProductPrice(item.product, userRole);
            const modulesPrice = (item.selectedModules || []).reduce(
              (s, moduleId) => {
                const mod = item.product.availableModules.find(
                  (m) => m.id === moduleId,
                );
                return s + (mod ? getModulePrice(mod, userRole) : 0);
              },
              0,
            );
            return sum + (base + modulesPrice) * (item.quantity || 1);
          }, 0);
          // Prefer totals included in Paystack metadata if available (authoritative)
          const shipping =
            transaction.metadata?.shipping ?? calculateShipping(subtotal);
          const total = transaction.metadata?.total ?? subtotal + shipping;

          const order = {
            id: transaction.reference || `ORD-${Date.now()}`,
            date: new Date(),
            items: itemsSnapshot,
            total: total || 0,
            status: "processing" as const,
            role: userRole,
          };

          addOrder(order);
          clearCart();
          setStatus("success");

          setTimeout(() => {
            router.push("/orders");
          }, 2000);
          return;
        }

        setStatus("failed");
        setMessage(
          transaction?.gateway_response ||
            transaction?.message ||
            "Payment not successful",
        );
      } catch (err) {
        setStatus("failed");
        setMessage((err as Error).message);
      }
    };

    verify();
  }, [reference, addOrder, clearCart, router, userRole]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center max-w-md p-6"
      >
        {status === "loading" && (
          <div>
            <div className="mb-4">Verifying payment...</div>
          </div>
        )}

        {status === "success" && (
          <div>
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
              <Check className="size-10 text-primary" />
            </div>
            <h2 className="mb-3">Payment Confirmed</h2>
            <p className="text-muted-foreground mb-8">
              Your order is being processed.
            </p>
          </div>
        )}

        {status === "failed" && (
          <div>
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-amber-100 flex items-center justify-center">
              <AlertTriangle className="size-10 text-amber-600" />
            </div>
            <h2 className="mb-3">Payment Verification Failed</h2>
            <p className="text-muted-foreground mb-8">{message}</p>
            <button
              onClick={() => router.push("/checkout")}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-xl"
            >
              Return to Checkout
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
