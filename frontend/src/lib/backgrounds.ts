export interface RoleBackgroundConfig {
  image: string;
  overlay: string;
  opacity: number;
  label: string;
}

export const ROLE_BACKGROUNDS: Record<string, RoleBackgroundConfig> = {
  ADMIN: {
    image: "/assets/backgrounds/bg-admin.jpg",
    overlay: "from-slate-950/95 via-slate-950/85 to-slate-900/90",
    opacity: 0.18,
    label: "Madura Salt Flat Aerials & Enterprise Infrastructure",
  },
  MANAGER: {
    image: "/assets/backgrounds/bg-manager.jpg",
    overlay: "from-slate-950/95 via-slate-950/85 to-slate-900/90",
    opacity: 0.16,
    label: "Enterprise Operations & Salt Supply Chain Strategy",
  },
  SALES: {
    image: "/assets/backgrounds/bg-sales.jpg",
    overlay: "from-slate-950/95 via-slate-950/85 to-slate-900/90",
    opacity: 0.15,
    label: "Commercial Salt Distribution & Client Fulfillment",
  },
  WAREHOUSE: {
    image: "/assets/backgrounds/bg-warehouse.jpg",
    overlay: "from-slate-950/95 via-slate-950/85 to-slate-900/90",
    opacity: 0.16,
    label: "Raw & Refined Salt Storage Warehouse Logistics",
  },
  PRODUCTION: {
    image: "/assets/backgrounds/bg-production.jpg",
    overlay: "from-slate-950/95 via-slate-950/85 to-slate-900/90",
    opacity: 0.18,
    label: "Salt Evaporation Pans & Refinement Processing Facility",
  },
  FINANCE: {
    image: "/assets/backgrounds/bg-finance.jpg",
    overlay: "from-slate-950/95 via-slate-950/85 to-slate-900/90",
    opacity: 0.15,
    label: "Financial Administration & Audit Analytics",
  },
  CUSTOMER: {
    image: "/assets/backgrounds/bg-sales.jpg",
    overlay: "from-slate-950/95 via-slate-950/85 to-slate-900/90",
    opacity: 0.15,
    label: "Customer Salt Procurement Portal",
  },
};

export const LOGIN_BACKGROUND = {
  image: "/assets/backgrounds/bg-login.jpg",
  overlay: "from-slate-950/90 via-slate-950/80 to-slate-950/95",
  opacity: 0.25,
};

