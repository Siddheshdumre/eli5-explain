import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthLayout, Field } from "@/components/AuthLayout";
import { Rule } from "@/components/editorial";
import { useToast } from "@/hooks/use-toast";
import { fieldInputClass, linkClass } from "@/lib/editorial";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

// What an account actually adds over the guest trial
const BENEFITS = ["Unlimited questions", "Saved threads you can pick up later"];

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      if (!isSupabaseConfigured) throw new Error("Accounts are not set up yet: add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env, then restart the dev server.");
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Account created successfully!",
        description: "Welcome to ELI5.AI! You can now start learning.",
      });
      navigate('/app');
    } catch (error) {
      toast({
        title: "Signup failed",
        description: error instanceof Error && error.message ? error.message : "Something went wrong.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const benefits = (
    <ul className="mt-12 max-w-[30ch]">
      <li aria-hidden="true">
        <Rule heavy />
      </li>
      {BENEFITS.map((benefit) => (
        <li key={benefit}>
          <p className="py-4 t-small font-medium">{benefit}</p>
          <Rule />
        </li>
      ))}
    </ul>
  );

  return (
    <AuthLayout title="Create an account." lede="Free, and every thread is kept for you." aside={benefits}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Field id="name" label="Full name">
          <Input id="name" name="name" type="text" autoComplete="name" value={formData.name} onChange={handleChange} required className={fieldInputClass} />
        </Field>
        <Field id="email" label="Email">
          <Input id="email" name="email" type="email" autoComplete="email" value={formData.email} onChange={handleChange} required className={fieldInputClass} />
        </Field>
        <Field id="password" label="Password">
          <Input id="password" name="password" type="password" autoComplete="new-password" value={formData.password} onChange={handleChange} required className={fieldInputClass} />
        </Field>
        <Field id="confirmPassword" label="Confirm password">
          <Input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" value={formData.confirmPassword} onChange={handleChange} required className={fieldInputClass} />
        </Field>

        <div className="pt-4">
          <Button type="submit" variant="brand" size="cta" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating account…" : "Create account"}
          </Button>
        </div>

        <p className="t-small text-foreground/75">
          Already have an account?{" "}
          <Link to="/login" className={`font-medium text-foreground ${linkClass}`}>
            Log in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default Signup;
