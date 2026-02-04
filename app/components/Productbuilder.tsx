import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, AlertCircle, Check, Plus, Minus } from "lucide-react";
import { products } from "@/app/data/products";
import { useParams, useRouter } from "next/navigation";
import {
  getProductPrice,
  getModulePrice,
  formatPrice,
  getRoleBadgeLabel,
  calculateShipping,
} from "@/app/utils/pricing";
import { Module, ROLE_REQUIREMENTS } from "@/app/types";
import { useAppStore } from "../store/appStore";
import Image from "next/image";

export default function ProductBuilder() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useRouter();
  const { userRole, addToCart, cart } = useAppStore((store) => store);

  const product = products.find((p) => p.id === productId);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(
    ROLE_REQUIREMENTS[userRole].minimumOrderQuantity,
  );
  const [expandedCategories, setExpandedCategories] = useState<string[]>([
    "material",
    "size",
  ]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCostBreakdown, setShowCostBreakdown] = useState(false);

  useEffect(() => {
    // Update quantity when role changes
    setQuantity(ROLE_REQUIREMENTS[userRole].minimumOrderQuantity);
  }, [userRole]);

  useEffect(() => {
    // Auto-select first option in material and size
    if (product) {
      const materialModule = product.availableModules.find(
        (m) => m.category === "material",
      );
      const sizeModule = product.availableModules.find(
        (m) => m.category === "size",
      );
      const initial: string[] = [];
      if (materialModule) initial.push(materialModule.id);
      if (sizeModule) initial.push(sizeModule.id);
      setSelectedModules(initial);
    }
  }, [product]);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Product not found</p>
      </div>
    );
  }

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category],
    );
  };

  const toggleModule = (module: Module) => {
    setSelectedModules((prev) => {
      // Check if already selected
      if (prev.includes(module.id)) {
        // For material and size, always have one selected (can't deselect)
        if (module.category === "material" || module.category === "size") {
          return prev;
        }
        return prev.filter((id) => id !== module.id);
      }

      // For material and size, replace existing selection
      if (module.category === "material" || module.category === "size") {
        const filtered = prev.filter((id) => {
          const m = product.availableModules.find((mod) => mod.id === id);
          return m?.category !== module.category;
        });
        return [...filtered, module.id];
      }

      // Check incompatibilities
      const hasIncompatible = prev.some((id) =>
        module.incompatibleWith?.includes(id),
      );
      if (hasIncompatible) {
        return prev;
      }

      return [...prev, module.id];
    });
  };

  const isModuleSelected = (moduleId: string) =>
    selectedModules.includes(moduleId);

  const isModuleIncompatible = (module: Module) => {
    return selectedModules.some((id) => module.incompatibleWith?.includes(id));
  };

  const getSelectedModules = () => {
    return product.availableModules.filter((m) =>
      selectedModules.includes(m.id),
    );
  };

  const calculateTotal = () => {
    const basePrice = getProductPrice(product, userRole);
    const modulesPrice = getSelectedModules().reduce(
      (sum, module) => sum + getModulePrice(module, userRole),
      0,
    );
    return basePrice + modulesPrice;
  };

  const subtotal = calculateTotal();
  const shipping = calculateShipping(subtotal);
  const total = subtotal + shipping;

  const handleAddToCart = () => {
    addToCart({
      id: `${Date.now()}-${Math.random()}`,
      productId: product.id,
      product,
      selectedModules,
      quantity,
    });
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
    }, 1200);
  };

  const categoryLabels: Record<string, string> = {
    material: "Material",
    size: "Size",
    addon: "Add-ons",
    accessory: "Accessories",
  };

  const groupedModules = product.availableModules.reduce(
    (acc, module) => {
      if (!acc[module.category]) acc[module.category] = [];
      acc[module.category].push(module);
      return acc;
    },
    {} as Record<string, Module[]>,
  );

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="max-w-350 mx-auto px-8 pt-8">
        {/* Breadcrumb */}
        <div className="mb-8">
          <button
            onClick={() => navigate.push("/")}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to products
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left: Product Preview */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="sticky top-24 h-fit"
          >
            <div className="aspect-square rounded-2xl overflow-hidden bg-secondary border border-border relative">
              <Image
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />

              {/* Configuration Overlay */}
              <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent flex flex-col justify-end p-6">
                <AnimatePresence mode="popLayout">
                  {getSelectedModules().map((module, index) => (
                    <motion.div
                      key={module.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                      className="mb-2 px-3 py-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 text-white"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                          <span className="text-sm font-medium">
                            {module.name}
                          </span>
                        </div>
                        {getModulePrice(module, userRole) > 0 && (
                          <span className="text-xs text-white/80">
                            +{formatPrice(getModulePrice(module, userRole))}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
            <div className="mt-6">
              <h2 className="mb-2">{product.name}</h2>
              <p className="text-muted-foreground">{product.description}</p>

              {/* Live Configuration Summary */}
              <motion.div
                className="mt-4 p-4 bg-secondary/50 rounded-lg"
                layout
              >
                <div className="text-sm text-muted-foreground mb-2">
                  Current Configuration
                </div>
                <div className="flex flex-wrap gap-2">
                  {getSelectedModules().map((module) => (
                    <motion.div
                      key={module.id}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className="px-2 py-1 bg-card rounded-md border border-border text-xs"
                    >
                      {module.name}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Right: Configuration Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {/* Base Product */}
            <div className="mb-6 p-6 bg-card rounded-xl border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <h4>Base Product</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {product.name} · {getRoleBadgeLabel(userRole)}
                  </p>
                </div>
                <span className="font-medium">
                  {formatPrice(getProductPrice(product, userRole))}
                </span>
              </div>
            </div>

            {/* Modules */}
            <div className="space-y-4">
              {Object.entries(groupedModules).map(([category, modules]) => (
                <div
                  key={category}
                  className="bg-card rounded-xl border border-border overflow-hidden"
                >
                  {/* Category Header */}
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-secondary/50 transition-colors"
                  >
                    <h4>{categoryLabels[category]}</h4>
                    <motion.div
                      animate={{
                        rotate: expandedCategories.includes(category) ? 180 : 0,
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="size-5 text-muted-foreground" />
                    </motion.div>
                  </button>

                  {/* Modules List */}
                  <AnimatePresence initial={false}>
                    {expandedCategories.includes(category) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-4 space-y-2">
                          {modules.map((module) => {
                            const selected = isModuleSelected(module.id);
                            const incompatible = isModuleIncompatible(module);
                            const price = getModulePrice(module, userRole);

                            return (
                              <motion.button
                                key={module.id}
                                onClick={() =>
                                  !incompatible && toggleModule(module)
                                }
                                disabled={incompatible}
                                whileTap={!incompatible ? { scale: 0.98 } : {}}
                                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                                  selected
                                    ? "border-primary bg-primary/5"
                                    : incompatible
                                      ? "border-border bg-muted/30 opacity-50 cursor-not-allowed"
                                      : "border-border hover:border-primary/50 bg-card"
                                }`}
                              >
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">
                                        {module.name}
                                      </span>
                                      {selected && (
                                        <Check className="size-4 text-primary" />
                                      )}
                                    </div>
                                    {module.description && (
                                      <p className="text-sm text-muted-foreground mt-1">
                                        {module.description}
                                      </p>
                                    )}
                                    {incompatible && (
                                      <div className="flex items-center gap-1.5 mt-2 text-sm text-amber-600">
                                        <AlertCircle className="size-4" />
                                        <span>
                                          Not compatible with current
                                          configuration
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-right">
                                    {price > 0 ? (
                                      <span className="text-sm text-muted-foreground">
                                        +{formatPrice(price)}
                                      </span>
                                    ) : (
                                      <span className="text-sm text-muted-foreground">
                                        Included
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </motion.button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            {/* Floating Price Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="sticky bottom-8 mt-8 p-6 bg-card rounded-xl border border-border shadow-lg"
            >
              {/* Quantity Selector */}
              <div className="mb-4 p-4 bg-secondary/30 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-sm">Quantity</span>
                    {ROLE_REQUIREMENTS[userRole].minimumOrderQuantity > 1 && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Min. {ROLE_REQUIREMENTS[userRole].minimumOrderQuantity}{" "}
                        units for {getRoleBadgeLabel(userRole)} pricing
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() =>
                        setQuantity(
                          Math.max(
                            ROLE_REQUIREMENTS[userRole].minimumOrderQuantity,
                            quantity - 1,
                          ),
                        )
                      }
                      disabled={
                        quantity <=
                        ROLE_REQUIREMENTS[userRole].minimumOrderQuantity
                      }
                      className="p-2 rounded-lg bg-background border border-border hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <Minus className="size-4" />
                    </button>
                    <span className="text-lg font-medium min-w-[3ch] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-2 rounded-lg bg-background border border-border hover:bg-secondary transition-colors"
                    >
                      <Plus className="size-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Unit Price</span>
                  <motion.span
                    key={subtotal}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {formatPrice(subtotal)}
                  </motion.span>
                </div>
                {quantity > 1 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Subtotal ({quantity} units)
                    </span>
                    <motion.span
                      key={subtotal * quantity}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className="font-medium"
                    >
                      {formatPrice(subtotal * quantity)}
                    </motion.span>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Estimated Shipping
                  </span>
                  <motion.span
                    key={shipping}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {shipping === 0 ? "Free" : formatPrice(shipping)}
                  </motion.span>
                </div>
                <div className="h-px bg-border" />
                <div className="flex items-center justify-between">
                  <span className="font-medium">Total</span>
                  <motion.span
                    key={total * quantity}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="text-2xl font-semibold"
                  >
                    {formatPrice(subtotal * quantity + shipping)}
                  </motion.span>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                className="w-full mt-6 px-6 py-4 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity"
              >
                Add {quantity > 1 ? `${quantity} Units` : ""} to Cart
              </button>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Success Toast */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 right-8 px-6 py-4 bg-primary text-primary-foreground rounded-xl shadow-lg flex items-center gap-3"
          >
            <Check className="size-5" />
            <span>Added to cart</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
