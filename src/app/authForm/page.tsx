"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Loader2, Mail, Lock } from "lucide-react";

import { supaBrowser } from "@/lib/supabase/client";

/* ------------------------------ Validation ------------------------------ */

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "At least 6 characters"),
  remember: z.boolean().default(false),
});

const signupSchema = z
  .object({
    name: z.string().min(2, "At least 2 characters"),
    email: z.string().email("Enter a valid email"),
    password: z
      .string()
      .min(8, "At least 8 characters")
      .regex(/^(?=.*[A-Za-z])(?=.*\d).+$/, "Include letters and numbers"),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });

type LoginValues = z.infer<typeof loginSchema>;
type SignupValues = z.infer<typeof signupSchema>;

/* --------------------------- Password Input ----------------------------- */

type PasswordInputProps = React.InputHTMLAttributes<HTMLInputElement>;
function PasswordInput({ id, placeholder, value, onChange, onBlur, name, ...rest }: PasswordInputProps) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input
        id={id}
        name={name}
        type={show ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        className="pr-10"
        {...rest}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-muted"
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}

/* ------------------------------- Component ------------------------------ */

export default function AuthForm() {
  const router = useRouter();
  const qp = useSearchParams();

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", remember: false },
    mode: "onTouched",
  });

  const signupForm = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "", confirm: "" },
    mode: "onTouched",
  });

  /* --------------------------------- Handlers -------------------------------- */

  async function onLogin(values: LoginValues) {
    const supabase = supaBrowser();
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });
    if (error) {
      // show near password & also a generic banner
      loginForm.setError("password", { message: error.message });
      loginForm.setError("root", { message: "Login failed. Please try again." });
      return;
    }
    const to = qp.get("redirect") || "/dashboard";
    router.push(to);
  }

  async function onSignup(values: SignupValues) {
    const supabase = supaBrowser();

    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: { full_name: values.name },
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    });
    if (error) {
      signupForm.setError("email", { message: error.message });
      signupForm.setError("root", { message: "Sign up failed. Please check your details." });
      return;
    }

    // Ensure profile on the server (Option B)
    try {
      await fetch("/api/profile/ensure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: values.name }),
      });
    } catch (e) {
      // non-blocking
      console.warn("Profile ensure error", e);
    }

    router.push("/dashboard");
  }

  async function loginWithGoogle() {
    const supabase = supaBrowser();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
    if (error) console.error(error.message);
  }

  /* ----------------------------------- UI ------------------------------------ */

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border bg-card p-6 shadow-sm">
      {/* Header */}
      <div className="mb-6 space-y-1 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Welcome</h1>
        <p className="text-sm text-muted-foreground">
          Log in to your account or create a new one.
        </p>
      </div>

      <Tabs defaultValue="login" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Log in</TabsTrigger>
          <TabsTrigger value="signup">Sign up</TabsTrigger>
        </TabsList>

        {/* ------------------------------ Login ------------------------------ */}
        <TabsContent value="login" className="space-y-6 pt-6">
          {loginForm.formState.errors.root?.message && (
            <div role="alert" className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              {loginForm.formState.errors.root.message}
            </div>
          )}

          <Form {...loginForm}>
            <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-5" noValidate>
              {/* Email */}
              <FormField
                control={loginForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          type="email"
                          placeholder="you@example.com"
                          className="pl-9"
                          autoComplete="email"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password */}
              <FormField
                control={loginForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Password</FormLabel>
                      <a href="#" className="text-sm text-muted-foreground hover:underline">
                        Forgot?
                      </a>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <PasswordInput placeholder="••••••••" className="pl-9" autoComplete="current-password" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Remember me */}
              <div className="flex items-center gap-2">
                <input
                  id="remember"
                  type="checkbox"
                  className="size-4 rounded border-input text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  {...loginForm.register("remember")}
                />
                <Label htmlFor="remember" className="text-sm">Remember me</Label>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full"
                disabled={loginForm.formState.isSubmitting}
                aria-busy={loginForm.formState.isSubmitting}
              >
                {loginForm.formState.isSubmitting ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="size-4 animate-spin" />
                    Logging in…
                  </span>
                ) : (
                  "Log in"
                )}
              </Button>
            </form>
          </Form>
        </TabsContent>

        {/* ------------------------------ Sign Up ---------------------------- */}
        <TabsContent value="signup" className="space-y-6 pt-6">
          {signupForm.formState.errors.root?.message && (
            <div role="alert" className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              {signupForm.formState.errors.root.message}
            </div>
          )}

          <Form {...signupForm}>
            <form onSubmit={signupForm.handleSubmit(onSignup)} className="space-y-5" noValidate>
              {/* Name */}
              <FormField
                control={signupForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full name</FormLabel>
                    <FormControl>
                      <Input placeholder="Jane Doe" autoComplete="name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={signupForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="you@example.com" autoComplete="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password */}
              <FormField
                control={signupForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <PasswordInput placeholder="At least 8 chars" autoComplete="new-password" {...field} />
                    </FormControl>
                    <FormDescription>Use 8+ characters with letters & numbers.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Confirm */}
              <FormField
                control={signupForm.control}
                name="confirm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm password</FormLabel>
                    <FormControl>
                      <PasswordInput placeholder="Repeat password" autoComplete="new-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit */}
              <Button
                type="submit"
                className="w-full"
                disabled={signupForm.formState.isSubmitting}
                aria-busy={signupForm.formState.isSubmitting}
              >
                {signupForm.formState.isSubmitting ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="size-4 animate-spin" />
                    Creating account…
                  </span>
                ) : (
                  "Create account"
                )}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                By continuing, you agree to our Terms & Privacy.
              </p>
            </form>
          </Form>
        </TabsContent>
      </Tabs>

      {/* ---------------------------- OAuth Divider --------------------------- */}
      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">or</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <Button variant="outline" className="w-full" onClick={loginWithGoogle}>
        Continue with Google
      </Button>
    </div>
  );
}
