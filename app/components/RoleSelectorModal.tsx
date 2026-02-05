import { motion, AnimatePresence } from "framer-motion";
import { X, Building2, Store, Users } from "lucide-react";
import { UserRole, ROLE_REQUIREMENTS } from "@/app/types";

interface RoleSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: UserRole;
  onSelectRole: (role: UserRole) => void;
}

const roleOptions = [
  {
    role: "retail" as UserRole,
    icon: Users,
    title: "Retail",
    recommended: false,
  },
  {
    role: "wholesale" as UserRole,
    icon: Store,
    title: "Wholesale",
    recommended: true,
  },
  {
    role: "distributor" as UserRole,
    icon: Building2,
    title: "Distributor",
    recommended: false,
  },
];

export default function RoleSelectorModal({
  isOpen,
  onClose,
  currentRole,
  onSelectRole,
}: RoleSelectorModalProps) {
  const handleSelectRole = (role: UserRole) => {
    onSelectRole(role);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-card rounded-xl sm:rounded-2xl border border-border shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-card border-b border-border px-4 sm:px-8 py-4 sm:py-6 flex items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl">
                    Select Your Pricing Tier
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    Choose the option that best fits your business needs
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                >
                  <X className="size-5 sm:size-6" />
                </button>
              </div>

              {/* Role Options */}
              <div className="p-4 sm:p-8 space-y-3 sm:space-y-4">
                {roleOptions.map((option) => {
                  const Icon = option.icon;
                  const isSelected = currentRole === option.role;

                  return (
                    <motion.button
                      key={option.role}
                      onClick={() => handleSelectRole(option.role)}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className={`w-full p-4 sm:p-6 rounded-xl border-2 transition-all text-left relative ${
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50 bg-background"
                      }`}
                    >
                      {option.recommended && (
                        <div className="absolute top-3 sm:top-4 right-3 sm:right-4 px-2 py-0.5 sm:py-1 bg-primary/10 text-primary text-[10px] sm:text-xs rounded-md">
                          Popular
                        </div>
                      )}

                      <div className="flex items-start gap-3 sm:gap-4">
                        <div
                          className={`p-2 sm:p-3 rounded-lg ${
                            isSelected ? "bg-primary/10" : "bg-secondary"
                          }`}
                        >
                          <Icon
                            className={`size-5 sm:size-6 ${
                              isSelected
                                ? "text-primary"
                                : "text-muted-foreground"
                            }`}
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 sm:gap-3 mb-1">
                            <h3 className="text-base sm:text-lg font-medium">
                              {option.title}
                            </h3>
                            <span
                              className={`text-xs sm:text-sm font-medium ${
                                ROLE_REQUIREMENTS[option.role].discount ===
                                "Standard pricing"
                                  ? "text-muted-foreground"
                                  : "text-primary"
                              }`}
                            >
                              {ROLE_REQUIREMENTS[option.role].discount}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-muted-foreground mb-2">
                            {ROLE_REQUIREMENTS[option.role].description}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] sm:text-xs text-muted-foreground">
                              Minimum order:
                            </span>
                            <span
                              className={`text-[10px] sm:text-xs font-medium px-2 py-0.5 rounded ${
                                ROLE_REQUIREMENTS[option.role]
                                  .minimumOrderQuantity === 1
                                  ? "bg-secondary text-muted-foreground"
                                  : "bg-primary/10 text-primary"
                              }`}
                            >
                              {ROLE_REQUIREMENTS[option.role]
                                .minimumOrderQuantity === 1
                                ? "No minimum"
                                : `${ROLE_REQUIREMENTS[option.role].minimumOrderQuantity} units`}
                            </span>
                          </div>
                        </div>

                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="flex items-center justify-center size-5 sm:size-6 rounded-full bg-primary text-primary-foreground flex-shrink-0"
                          >
                            <svg
                              className="size-3 sm:size-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </motion.div>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="border-t border-border px-4 sm:px-8 py-3 sm:py-4 bg-secondary/30">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  You can change your pricing tier at any time from the header
                  menu.
                </p>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
