"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useVerifyOtp } from "@/src/auth/hooks";

export default function VerifyOtpPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const { handleVerifyOtp, loading, error } = useVerifyOtp();
  const [otp, setOtp] = useState("");

  if (!email) {
    return (
      <p className="flex min-h-screen items-center justify-center">
        Invalid verification link
      </p>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center">
      <form
        className="w-full max-w-sm space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          handleVerifyOtp(email, otp);
        }}
      >
        <h1 className="text-2xl font-bold">Verify OTP</h1>

        <div>
          <Label>OTP Code</Label>
          <Input
            type="text"
            required
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Verifying..." : "Verify"}
        </Button>
      </form>
    </main>
  );
}
