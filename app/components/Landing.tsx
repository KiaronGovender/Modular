import { motion } from "framer-motion";
import { products } from "@/app/data/products";
import { getProductPrice, formatPrice } from "@/app/utils/pricing";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { useAppStore } from "../store/appStore";
import Link from "next/link";

export default function Landing() {
  const { userRole } = useAppStore((state) => state);

  return (
    <div>
      {/* Hero Section */}
      <section className="max-w-300 mx-auto px-4 sm:px-6 md:px-8 pt-12 sm:pt-16 md:pt-24 pb-16 sm:pb-24 md:pb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          <h1 className="mb-4 sm:mb-6 text-3xl sm:text-4xl md:text-5xl lg:text-6xl">
            Build exactly what you need.
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 sm:mb-12 leading-relaxed max-w-2xl">
            Premium modular products designed for creators. Configure every
            detail, no compromises.
          </p>
          <Link
            href={`/builder/${products[0].id}`}
            className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity text-sm sm:text-base"
          >
            Start Building
            <ArrowRight className="size-4 sm:size-5" />
          </Link>
        </motion.div>
      </section>

      {/* Featured Products Grid */}
      <section className="max-w-300 mx-auto px-4 sm:px-6 md:px-8 pb-16 sm:pb-24 md:pb-32">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link
                href={`/builder/${product.id}`}
                className="group block bg-card rounded-xl overflow-hidden border border-border hover:shadow-lg transition-all duration-300"
              >
                {/* Product Image */}
                <div className="aspect-4/3 overflow-hidden bg-secondary relative">
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    fill
                  />
                </div>

                {/* Product Info */}
                <div className="p-4 sm:p-6">
                  <h3 className="mb-2 text-base sm:text-lg">{product.name}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      From
                    </span>
                    <span className="font-medium text-sm sm:text-base">
                      {formatPrice(getProductPrice(product, userRole))}
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
