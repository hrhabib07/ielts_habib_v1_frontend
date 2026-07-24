import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentUser } from "@/src/lib/auth-server";
import { getPublicPricing, type PublicPricing } from "@/src/lib/api/pricing";
import { CheckoutContent } from "./CheckoutContent";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Checkout · Gamlish",
  description: "Complete your Gamlish pre-order with bKash Send Money.",
};

export default async function CheckoutPage() {
  const initialUser = await getCurrentUser();

  if (!initialUser) {
    redirect(`/login?redirect=${encodeURIComponent("/checkout")}`);
  }

  let initialPricing: PublicPricing | null = null;
  try {
    initialPricing = await getPublicPricing();
  } catch {
    initialPricing = null;
  }

  return (
    <CheckoutContent initialPricing={initialPricing} />
  );
}
