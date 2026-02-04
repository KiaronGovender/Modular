"use client";
import { motion } from "framer-motion";
import { Package, Clock, Truck, CheckCircle } from "lucide-react";
import { formatPrice, getRoleBadgeLabel } from "@/app/utils/pricing";
import { format } from "date-fns";
import Image from "next/image";
import { useAppStore } from "../store/appStore";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Orders() {
  const { orders, userRole } = useAppStore((store) => store);

  const statusConfig = {
    pending: {
      label: "Pending",
      icon: Clock,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    processing: {
      label: "Processing",
      icon: Package,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    shipped: {
      label: "Shipped",
      icon: Truck,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    delivered: {
      label: "Delivered",
      icon: CheckCircle,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
  };

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
            <div className="flex items-center justify-between mb-4">
              <h1>Orders</h1>
              <div className="px-4 py-2 bg-secondary rounded-lg">
                <span className="text-sm text-muted-foreground">Account: </span>
                <span className="text-sm font-medium">
                  {getRoleBadgeLabel(userRole)}
                </span>
              </div>
            </div>
            <p className="text-muted-foreground">
              Track and manage your orders in one place
            </p>
          </motion.div>

          {/* Orders List */}
          {orders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-xl border border-border p-12 text-center"
            >
              <Package className="size-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="mb-2">No orders yet</h3>
              <p className="text-muted-foreground">
                Your order history will appear here once you make your first
                purchase
              </p>
            </motion.div>
          ) : (
            <div className="space-y-6">
              {orders.map((order, index) => {
                const config = statusConfig[order.status];
                const StatusIcon = config.icon;

                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-card rounded-xl border border-border overflow-hidden"
                  >
                    {/* Order Header */}
                    <div className="p-6 border-b border-border">
                      <div className="flex items-start justify-between gap-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-3">
                            <h3>{order.id}</h3>
                            <div
                              className={`flex items-center gap-2 px-3 py-1 rounded-lg ${config.bg}`}
                            >
                              <StatusIcon
                                className={`size-4 ${config.color}`}
                              />
                              <span className={`text-sm ${config.color}`}>
                                {config.label}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-6 text-sm text-muted-foreground">
                            <span>
                              Placed {format(order.date, "MMM d, yyyy")}
                            </span>
                            <span>•</span>
                            <span>
                              {order.items.length}{" "}
                              {order.items.length === 1 ? "item" : "items"}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground mb-1">
                            Total
                          </div>
                          <div className="text-2xl font-semibold">
                            {formatPrice(order.total)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    {order.items.length > 0 && (
                      <div className="p-6 space-y-4">
                        {order.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-4"
                          >
                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-secondary relative shrink-0">
                              <Image
                                src={item.product.imageUrl}
                                alt={item.product.name}
                                className="object-cover"
                                fill
                              />
                            </div>
                            <div className="flex-1">
                              <h4>{item.product.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {item.selectedModules.length} modules configured
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Status Timeline */}
                    <div className="px-6 pb-6">
                      <div className="flex items-center gap-2">
                        {["pending", "processing", "shipped", "delivered"].map(
                          (status, idx) => {
                            const isComplete =
                              [
                                "pending",
                                "processing",
                                "shipped",
                                "delivered",
                              ].indexOf(order.status) >= idx;
                            const isCurrent =
                              [
                                "pending",
                                "processing",
                                "shipped",
                                "delivered",
                              ].indexOf(order.status) === idx;

                            return (
                              <div
                                key={status}
                                className="flex items-center gap-2 flex-1"
                              >
                                <div
                                  className={`h-1 flex-1 rounded-full transition-colors ${
                                    isComplete ? "bg-primary" : "bg-muted"
                                  }`}
                                />
                                {isCurrent && (
                                  <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                                )}
                              </div>
                            );
                          },
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                        <span>Pending</span>
                        <span>Processing</span>
                        <span>Shipped</span>
                        <span>Delivered</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
