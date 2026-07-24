import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/src/lib/auth-server";
import { PaymentConfirmationContent } from "./PaymentConfirmationContent";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Payment submitted · Gamlish",
  description:
    "Your Gamlish bKash payment proof was submitted and is pending verification.",
};

export default async function PaymentConfirmationPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/login?redirect=${encodeURIComponent("/payment/confirmation")}`);
  }

  return <PaymentConfirmationContent />;
}
