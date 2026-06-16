import { getCurrentUser } from "@/src/lib/auth-server";
import { PricingContent } from "./PricingContent";

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const initialUser = await getCurrentUser();
  const params = await searchParams;
  const autoOpenCheckout =
    params.checkout === "founder" || params.checkout === "1";

  return (
    <PricingContent
      initialUser={initialUser}
      autoOpenCheckout={autoOpenCheckout}
    />
  );
}
