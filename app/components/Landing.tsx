import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { getProductPrice, formatPrice } from "@/app/utils/pricing";
import { motion } from "framer-motion";
import { useAppStore } from "../store/appStore";
import { products } from "../data/products";

export const Landing = () => {
  const userRole = useAppStore((state) => state.userRole);
  return (
    <div>
      {/* Hero Section */}
      <section className="max-w-300 mx-auto px-8 pt-24 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          <h1 className="mb-6">Build exactly what you need.</h1>
          <p className="text-xl text-muted-foreground mb-12 leading-relaxed max-w-2xl">
            Premium modular products designed for creators. Configure every
            detail, no compromises.
          </p>
          <Link
            href={`/builder/${products[0].id}`}
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity"
          >
            Start Building
            <ArrowRight className="size-5" />
          </Link>
        </motion.div>
      </section>

      {/* Featured Products Grid */}
      <section className="max-w-300 mx-auto px-8 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                <div className="aspect-4/3 overflow-hidden bg-secondary">
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    width={1080} // real width of the image
                    height={810}
                  />
                </div>

                {/* Product Info */}
                <div className="p-6">
                  <h3 className="mb-2">{product.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm text-muted-foreground">From</span>
                    <span className="font-medium">
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
};
