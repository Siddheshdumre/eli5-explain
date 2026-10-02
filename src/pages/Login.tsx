import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthLayout, Field } from "@/components/AuthLayout";
import { useToast } from "@/hooks/use-toast";
import { fieldInputClass, linkClass } from "@/lib/editorial";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!isSupabaseConfigured) throw new Error("Accounts are not set up yet: add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env, then restart the dev server.");
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "Login successful!",
        description: "Welcome back to ELI5.AI",
      });
      navigate('/app');
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error && error.message ? error.message : "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome back." lede="Log in to pick up your saved threads.">
      <form onSubmit={handleSubmit} className="space-y-6">
        <Field id="email" label="Email">
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={fieldInputClass}
          />
        </Field>
        <Field id="password" label="Password">
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={fieldInputClass}
          />
        </Field>

        <div className="pt-4">
          <Button type="submit" variant="brand" size="cta" className="w-full" disabled={isLoading}>
            {isLoading ? "Logging in…" : "Log in"}
          </Button>
        </div>

        <p className="t-small text-foreground/75">
          No account?{" "}
          <Link to="/signup" className={`font-medium text-foreground ${linkClass}`}>
            Sign up
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default Login;
