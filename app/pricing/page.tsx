import { getCurrentUser } from "@/src/lib/auth-server";
import { PricingContent } from "./PricingContent";

export default async function PricingPage() {
  const initialUser = await getCurrentUser();
  return <PricingContent initialUser={initialUser} />;
}
