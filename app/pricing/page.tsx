import { getCurrentUser } from "@/src/lib/auth-server";
import { getPublicPricing, type PublicPricing } from "@/src/lib/api/pricing";
import { PricingContent } from "./PricingContent";

export const dynamic = "force-dynamic";

export default async function PricingPage() {
  const initialUser = await getCurrentUser();

  let initialPricing: PublicPricing | null = null;
  try {
    initialPricing = await getPublicPricing();
  } catch {
    initialPricing = null;
  }

  return (
    <PricingContent initialUser={initialUser} initialPricing={initialPricing} />
  );
}
