"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui";
import { Label } from "@/components/ui";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui";
import Link from "next/link";
import { User, Mail, Lock, ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          email: form.get("email"),
          username: form.get("username"),
          password: form.get("password"),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error?.message || "Registration failed.");
        return;
      }
      router.push("/");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-dvh">
      <Card className="w-full max-w-md shadow-lift">
        <CardHeader>
          <CardTitle className="font-display text-2xl">Create account</CardTitle>
          <CardDescription>Start saving companies, collections, and reports.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Demo Product Manager" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="pm@orbitory.demo" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" placeholder="pm_demo" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" />
            </div>
            {error && (
              <div className="rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full bg-primary text-primary-foreground shadow-glow-signal" disabled={loading}>
              {loading ? "Creating…" : "Create account"}
              <ArrowRight className="h-3.5 w-3.5 ml-2" />
            </Button>
          </form>
        </CardContent>
        <CardFooter className="border-t border-border/60">
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-muted-foreground">Already have an account?</span>
            <Link href="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
