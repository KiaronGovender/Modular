"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check, AlertTriangle } from "lucide-react";
import { useAppStore } from "@/app/store/appStore";
import {
  getProductPrice,
  getModulePrice,
  calculateShipping,
} from "@/app/utils/pricing";
import type { Product } from "@/app/types";

export default function ReturnClient() {
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

        const transaction = data.data;

        if (transaction?.status === "success") {
          let itemsSnapshot = [...cart];

          try {
            const raw = localStorage.getItem("modular-store");
            if (raw) {
              const parsed = JSON.parse(raw);
              const stored = parsed?.state ?? parsed;
              if (Array.isArray(stored?.cart)) {
                itemsSnapshot = stored.cart;
              }
            }
          } catch {}

          if (!itemsSnapshot.length && transaction.metadata?.items) {
            type MetadataItem = {
              id?: string;
              productId?: string;
              product?: Product;
              selectedModules?: string[];
              qty?: number;
              quantity?: number;
            };

            itemsSnapshot = transaction.metadata.items.map(
              (it: MetadataItem) => ({
                id: it.id || `${Date.now()}-${Math.random()}`,
                productId: it.product?.id || it.productId,
                product: it.product as Product,
                selectedModules: it.selectedModules || [],
                quantity: it.qty ?? it.quantity ?? 1,
              }),
            );
          }

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
            return sum + (base + modulesPrice) * item.quantity;
          }, 0);

          const shipping =
            transaction.metadata?.shipping ?? calculateShipping(subtotal);

          const total = transaction.metadata?.total ?? subtotal + shipping;

          addOrder({
            id: transaction.reference,
            date: new Date(),
            items: itemsSnapshot,
            total,
            status: "processing",
            role: userRole,
          });

          clearCart();
          setStatus("success");

          setTimeout(() => router.push("/orders"), 2000);
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
  }, [reference, cart, addOrder, clearCart, router, userRole]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center max-w-md p-6"
      >
        {status === "loading" && <p>Verifying payment…</p>}

        {status === "success" && (
          <>
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
              <Check className="size-10 text-primary" />
            </div>
            <h2>Payment Confirmed</h2>
            <p className="text-muted-foreground">
              Your order is being processed.
            </p>
          </>
        )}

        {status === "failed" && (
          <>
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-amber-100 flex items-center justify-center">
              <AlertTriangle className="size-10 text-amber-600" />
            </div>
            <h2>Payment Verification Failed</h2>
            <p className="text-muted-foreground">{message}</p>
            <button
              onClick={() => router.push("/checkout")}
              className="mt-4 px-6 py-3 bg-primary text-primary-foreground rounded-xl"
            >
              Return to Checkout
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
}
