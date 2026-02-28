"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { apiClient } from "@/lib/api/client";
import { toast } from "sonner";
import Link from "next/link";

function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleOnSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);

    try {
      const res = await apiClient.post("/api/auth/register", {
        name,
        email,
        password,
      });

      if (res?.data?.ok) {
        toast.success(
          res?.data?.message || "Account created. Please log in...",
        );
        router.push("/login");
        router.refresh();
      }
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="bg-neutral-900/50 border-neutral-800 backdrop-blur-sm text-white shadow-2xl p-6">
      <h1 className="text-center font-bold text-2xl mb-6">Sign Up</h1>
      <form onSubmit={handleOnSubmit} className="space-y-5">
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-white">Name</legend>
          <Input
            required
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-11 bg-neutral-950/50 border-neutral-700 text-white placeholder:text-neutral-400 focus:border-violet-500/50 backdrop-blur-sm"
          />
        </fieldset>
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-white">Email</legend>
          <Input
            required
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11 bg-neutral-950/50 border-neutral-700 text-white placeholder:text-neutral-400 focus:border-violet-500/50 backdrop-blur-sm"
          />
        </fieldset>
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-white">
            Password
          </legend>
          <Input
            required
            type="password"
            autoComplete="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-11 bg-neutral-950/50 border-neutral-700 text-white placeholder:text-neutral-400 focus:border-violet-500/50 backdrop-blur-sm"
          />
        </fieldset>
        <Button
          disabled={loading}
          className="h-11 w-full bg-violet-500/10 backdrop-blur-sm border border-violet-500/30 text-violet-400 hover:bg-violet-500/20 transition-all"
        >
          {loading ? "Creating..." : "Create Account"}
        </Button>

        <Link href={"/login"} className="block">
          <Button
            type="button"
            variant="ghost"
            className="h-11 w-full bg-neutral-800/50 backdrop-blur-sm border border-neutral-700 hover:bg-neutral-700/50 text-white hover:text-white transition-all"
          >
            Already have an account? Sign In
          </Button>
        </Link>
      </form>
    </Card>
  );
}

export default RegisterForm;
