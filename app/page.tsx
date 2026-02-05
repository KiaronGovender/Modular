"use client";
import { useState } from "react";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import { useAppStore } from "./store/appStore";
import BusinessPricingBanner from "./components/BusinessPricingBanner";
import RoleSelectorModal from "./components/RoleSelectorModal";
import Landing from "./components/Landing";

const Page = () => {
  const [isRoleSelectorOpen, setIsRoleSelectorOpen] = useState(false);
  const { userRole, setUserRole } = useAppStore((state) => state);
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {userRole === "retail" && (
        <BusinessPricingBanner
          onOpenRoleSelector={() => setIsRoleSelectorOpen(true)}
        />
      )}
      <Navbar onOpenRoleSelector={() => setIsRoleSelectorOpen(true)} />
      <Landing />
      <Footer />
      <RoleSelectorModal
        isOpen={isRoleSelectorOpen}
        onClose={() => setIsRoleSelectorOpen(false)}
        currentRole={userRole}
        onSelectRole={setUserRole}
      />
    </div>
  );
};

export default Page;
