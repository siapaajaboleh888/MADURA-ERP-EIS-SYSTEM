export interface RoleBackgroundConfig {
  image: string;
  overlay: string;
  opacity: number;
  label: string;
}

export const ROLE_BACKGROUNDS: Record<string, RoleBackgroundConfig> = {
  ADMIN: {
    image: "/assets/backgrounds/bg-admin.jpg",
    overlay: "from-slate-950/70 via-slate-950/50 to-slate-900/60",
    opacity: 0.45,
    label: "Madura Salt Flat Aerials & Enterprise Infrastructure",
  },
  MANAGER: {
    image: "/assets/backgrounds/bg-manager.jpg",
    overlay: "from-slate-950/70 via-slate-950/50 to-slate-900/60",
    opacity: 0.40,
    label: "Enterprise Operations & Salt Supply Chain Strategy",
  },
  SALES: {
    image: "/assets/backgrounds/bg-sales.jpg",
    overlay: "from-slate-950/70 via-slate-950/50 to-slate-900/60",
    opacity: 0.40,
    label: "Commercial Salt Distribution & Client Fulfillment",
  },
  WAREHOUSE: {
    image: "/assets/backgrounds/bg-warehouse.jpg",
    overlay: "from-slate-950/70 via-slate-950/50 to-slate-900/60",
    opacity: 0.40,
    label: "Raw & Refined Salt Storage Warehouse Logistics",
  },
  PRODUCTION: {
    image: "/assets/backgrounds/bg-production.jpg",
    overlay: "from-slate-950/70 via-slate-950/50 to-slate-900/60",
    opacity: 0.45,
    label: "Salt Evaporation Pans & Refinement Processing Facility",
  },
  FINANCE: {
    image: "/assets/backgrounds/bg-finance.jpg",
    overlay: "from-slate-950/70 via-slate-950/50 to-slate-900/60",
    opacity: 0.40,
    label: "Financial Administration & Audit Analytics",
  },
  CUSTOMER: {
    image: "/assets/backgrounds/bg-sales.jpg",
    overlay: "from-slate-950/70 via-slate-950/50 to-slate-900/60",
    opacity: 0.40,
    label: "Customer Salt Procurement Portal",
  },
};

export const LOGIN_BACKGROUND = {
  image: "/assets/backgrounds/bg-login.jpg",
  overlay: "from-slate-950/60 via-slate-950/40 to-slate-950/70",
  opacity: 0.55,
};

