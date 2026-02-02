"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRegister } from "@/src/auth/hooks";

export default function RegisterPage() {
  const { handleRegister, loading, error } = useRegister();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <main className="flex min-h-screen items-center justify-center">
      <form
        className="w-full max-w-sm space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          handleRegister(email, password);
        }}
      >
        <h1 className="text-2xl font-bold">Create Account</h1>

        <div>
          <Label>Email</Label>
          <Input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <Label>Password</Label>
          <Input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Creating account..." : "Register"}
        </Button>
      </form>
    </main>
  );
}
