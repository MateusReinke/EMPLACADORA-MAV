import {
  Award,
  CarFront,
  Copy,
  Lock,
  ScanLine,
  ShieldCheck,
  Timer,
  Truck,
  type LucideIcon,
} from "lucide-react";

import type { Pillar, Service } from "@/content/site";

export const SERVICE_ICONS: Record<Service["icon"], LucideIcon> = {
  plate: ScanLine,
  zeroKm: CarFront,
  duplicate: Copy,
  fleet: Truck,
};

export const PILLAR_ICONS: Record<Pillar["icon"], LucideIcon> = {
  shield: ShieldCheck,
  lock: Lock,
  medal: Award,
  clock: Timer,
};
