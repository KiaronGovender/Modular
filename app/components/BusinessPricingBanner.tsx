"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight } from "lucide-react";

interface BusinessPricingBannerProps {
  onOpenRoleSelector: () => void;
}

export default function BusinessPricingBanner({
  onOpenRoleSelector,
}: BusinessPricingBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      const dismissedData = localStorage.getItem(
        "businessPricingBannerDismissed",
      );
      if (dismissedData) {
        const { timestamp } = JSON.parse(dismissedData);
        const daysSinceDismissal =
          (Date.now() - timestamp) / (1000 * 60 * 60 * 24);
        return daysSinceDismissal < 7;
      }
    } catch (e) {
      // ignore parsing errors and show banner
      console.log(e);
    }
    return false;
  });

  useEffect(() => {
    // Show banner after a short delay for better UX
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem(
      "businessPricingBannerDismissed",
      JSON.stringify({
        timestamp: Date.now(),
      }),
    );
  };

  const handleClick = () => {
    onOpenRoleSelector();
    setIsVisible(false);
  };

  if (isDismissed) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="fixed top-0 left-0 right-0 z-40 bg-primary/10 border-b border-primary/20 backdrop-blur-md"
        >
          <div className="max-w-350 mx-auto px-6 py-3">
            <div className="flex items-center justify-between gap-4">
              {/* Message */}
              <button
                onClick={handleClick}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity group flex-1"
              >
                <p className="text-sm text-foreground">
                  <span className="font-medium">
                    Shopping for your business?
                  </span>
                  <span className="text-muted-foreground ml-2">
                    Save up to 30% with Wholesale or Distributor pricing
                  </span>
                </p>
                <ArrowRight className="size-4 text-primary group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Dismiss Button */}
              <button
                onClick={handleDismiss}
                className="text-muted-foreground hover:text-foreground transition-colors p-1"
                aria-label="Dismiss banner"
              >
                <X className="size-5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
