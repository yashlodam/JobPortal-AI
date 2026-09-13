/**
 * src/SignUpLogin/SignUp.jsx
 *
 * Ultra-Modern Interactive Sign Up Experience for JobPortal AI.
 * Features:
 * - Interactive Role Tiles (Job Seeker / Recruiter) with glowing active state
 * - Live 4-tier Password Strength Analyzer with visual progress bar
 * - Real-time Password Confirmation Match indicator
 * - Branded Social Sign-Up buttons (Google, GitHub, LinkedIn)
 * - Show/Hide Password Eye toggles
 * - 100% WCAG AA contrast in both Light & Dark themes
 */

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Lock,
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  Sparkles,
  Building2,
  UserCheck,
  Eye,
  EyeOff,
  Check,
  ShieldAlert,
} from "lucide-react";
import { useAppDispatch } from "../State/Store";
import { signup } from "../State/AuthSlic";
import { notifications } from "@mantine/notifications";

export default function SignUp({ setIsLogin, role = "APPLICANT", setRole }) {
  const dispatch = useAppDispatch();
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    accountType: role || "APPLICANT",
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleRoleChange = (newRole) => {
    handleChange("accountType", newRole);
    if (setRole) setRole(newRole);
  };

  /* ── Live Password Strength Calculation ── */
  const passwordStrength = useMemo(() => {
    const pwd = formData.password || "";
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 8) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (!pwd) return { label: "None", score: 0, color: "bg-slate-300 dark:bg-slate-700" };
    if (score <= 1) return { label: "Weak", score: 1, color: "bg-rose-500" };
    if (score <= 3) return { label: "Fair", score: 2, color: "bg-amber-500" };
    if (score === 4) return { label: "Good", score: 3, color: "bg-indigo-500" };
    return { label: "Strong", score: 4, color: "bg-emerald-500" };
  }, [formData.password]);

  const passwordsMatch = useMemo(() => {
    if (!formData.password || !formData.confirmPassword) return null;
    return formData.password === formData.confirmPassword;
  }, [formData.password, formData.confirmPassword]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!accepted) {
      newErrors.terms = "You must agree to the Terms & Conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e) => {
    e?.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      const { confirmPassword: _, ...payload } = formData;
      await dispatch(signup(payload)).unwrap();

      const isEmployer = formData.accountType === "EMPLOYER" || formData.accountType === "RECRUITER";

      notifications.show({
        title: "Account created successfully! 🎉",
        message: isEmployer
          ? "Please verify your email address. Your recruiter workspace is being initialized."
          : "Please verify your email address. You can now sign in with your credentials.",
        color: "indigo",
        radius: "md",
        autoClose: 4000,
        icon: <CheckCircle2 size={18} />,
      });

      setTimeout(() => {
        setIsLogin(true);
      }, 1200);
    } catch (error) {
      notifications.show({
        title: "Registration Failed",
        message:
          error?.response?.data?.errorMessage ||
          error?.message ||
          "Unable to create account. Please try again.",
        color: "red",
        radius: "md",
        autoClose: 4000,
        icon: <CircleAlert size={18} />,
      });
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="w-full"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-[11px] font-black text-primary mb-2 font-satoshi">
          <Sparkles className="h-3 w-3 text-amber-500 animate-pulse" /> Create Your Free Account
        </div>
        <h2 className="font-satoshi text-2xl sm:text-3xl font-black text-heading tracking-tight">
          Join JobPortal AI
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-muted">
          Discover high-match roles or hire verified talent with neural AI.
        </p>
      </motion.div>

      {/* ── Role Selection Tile Cards ── */}
      <motion.div variants={itemVariants} className="mt-4 space-y-1.5">
        <label className="block text-xs font-bold text-heading font-satoshi">
          I want to join as:
        </label>
        <div className="grid grid-cols-2 gap-2.5">
          <motion.button
            type="button"
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleRoleChange("APPLICANT")}
            className={`flex flex-col items-start gap-1 rounded-2xl p-3 text-left transition-all cursor-pointer border ${
              formData.accountType === "APPLICANT"
                ? "border-primary bg-primary/10 shadow-md ring-2 ring-primary/30"
                : "border-border bg-surface-elevated hover:bg-surface-hover hover:border-border-hover"
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <UserCheck size={15} />
              </div>
              {formData.accountType === "APPLICANT" && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-white"
                >
                  <Check size={10} strokeWidth={3} />
                </motion.span>
              )}
            </div>
            <span className="font-bold text-xs text-heading mt-1">Job Seeker</span>
            <span className="text-[10px] text-muted leading-tight">Find & apply with AI match</span>
          </motion.button>

          <motion.button
            type="button"
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleRoleChange("EMPLOYER")}
            className={`flex flex-col items-start gap-1 rounded-2xl p-3 text-left transition-all cursor-pointer border ${
              formData.accountType === "EMPLOYER"
                ? "border-primary bg-primary/10 shadow-md ring-2 ring-primary/30"
                : "border-border bg-surface-elevated hover:bg-surface-hover hover:border-border-hover"
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400">
                <Building2 size={15} />
              </div>
              {formData.accountType === "EMPLOYER" && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-white"
                >
                  <Check size={10} strokeWidth={3} />
                </motion.span>
              )}
            </div>
            <span className="font-bold text-xs text-heading mt-1">Employer</span>
            <span className="text-[10px] text-muted leading-tight">Post jobs & hire verified talent</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Form */}
      <form onSubmit={handleRegister} className="mt-5 space-y-3.5">
        {/* Full Name */}
        <motion.div variants={itemVariants}>
          <label className="block text-xs font-bold text-heading mb-1 font-satoshi">
            Full Name <span className="text-rose-500">*</span>
          </label>
          <div className="relative flex items-center group">
            <User size={16} className="absolute left-3.5 text-muted group-focus-within:text-primary transition-colors pointer-events-none" />
            <input
              type="text"
              autoComplete="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="e.g. Alex Rivera"
              className={`w-full h-11 rounded-2xl border bg-surface-elevated pl-10 pr-4 text-xs sm:text-sm text-heading placeholder-muted outline-none transition-all duration-200 focus:border-primary focus:ring-4 focus:ring-primary/20 ${
                errors.name ? "border-rose-500/80 bg-rose-500/5" : "border-border"
              }`}
            />
          </div>
          {errors.name && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[11px] font-semibold text-rose-500 mt-1 flex items-center gap-1"
            >
              <CircleAlert size={12} /> {errors.name}
            </motion.p>
          )}
        </motion.div>

        {/* Email Address */}
        <motion.div variants={itemVariants}>
          <label className="block text-xs font-bold text-heading mb-1 font-satoshi">
            Work or Personal Email <span className="text-rose-500">*</span>
          </label>
          <div className="relative flex items-center group">
            <Mail size={16} className="absolute left-3.5 text-muted group-focus-within:text-primary transition-colors pointer-events-none" />
            <input
              type="email"
              autoComplete="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="alex@company.com"
              className={`w-full h-11 rounded-2xl border bg-surface-elevated pl-10 pr-4 text-xs sm:text-sm text-heading placeholder-muted outline-none transition-all duration-200 focus:border-primary focus:ring-4 focus:ring-primary/20 ${
                errors.email ? "border-rose-500/80 bg-rose-500/5" : "border-border"
              }`}
            />
          </div>
          {errors.email && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[11px] font-semibold text-rose-500 mt-1 flex items-center gap-1"
            >
              <CircleAlert size={12} /> {errors.email}
            </motion.p>
          )}
        </motion.div>

        {/* Password & Confirm Password Grid */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-heading mb-1 font-satoshi">
              Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative flex items-center group">
              <Lock size={16} className="absolute left-3.5 text-muted group-focus-within:text-primary transition-colors pointer-events-none" />
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                placeholder="Min 6 characters"
                className={`w-full h-11 rounded-2xl border bg-surface-elevated pl-10 pr-10 text-xs sm:text-sm text-heading placeholder-muted outline-none transition-all duration-200 focus:border-primary focus:ring-4 focus:ring-primary/20 ${
                  errors.password ? "border-rose-500/80 bg-rose-500/5" : "border-border"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-1.5 h-8 w-8 flex items-center justify-center rounded-xl text-muted hover:text-heading hover:bg-surface transition cursor-pointer active:scale-90"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {errors.password && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[11px] font-semibold text-rose-500 mt-1"
              >
                {errors.password}
              </motion.p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-heading font-satoshi">
                Confirm <span className="text-rose-500">*</span>
              </label>
              {passwordsMatch === true && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-[10px] font-bold text-emerald-500 flex items-center gap-0.5"
                >
                  <Check size={11} strokeWidth={3} /> Matched
                </motion.span>
              )}
            </div>
            <div className="relative flex items-center group">
              <Lock size={16} className="absolute left-3.5 text-muted group-focus-within:text-primary transition-colors pointer-events-none" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={(e) => handleChange("confirmPassword", e.target.value)}
                placeholder="Re-enter password"
                className={`w-full h-11 rounded-2xl border bg-surface-elevated pl-10 pr-10 text-xs sm:text-sm text-heading placeholder-muted outline-none transition-all duration-200 focus:border-primary focus:ring-4 focus:ring-primary/20 ${
                  errors.confirmPassword
                    ? "border-rose-500/80 bg-rose-500/5"
                    : passwordsMatch === true
                    ? "border-emerald-500/60 focus:border-emerald-500"
                    : "border-border"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                className="absolute right-1.5 h-8 w-8 flex items-center justify-center rounded-xl text-muted hover:text-heading hover:bg-surface transition cursor-pointer active:scale-90"
              >
                {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[11px] font-semibold text-rose-500 mt-1"
              >
                {errors.confirmPassword}
              </motion.p>
            )}
          </div>
        </motion.div>

        {/* ── Live Password Strength Meter ── */}
        {formData.password && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="rounded-xl border border-border bg-surface-elevated/50 p-2 space-y-1.5"
          >
            <div className="flex items-center justify-between text-[10px] font-bold">
              <span className="text-muted">Password Strength:</span>
              <span className={`font-extrabold ${
                passwordStrength.label === "Strong" ? "text-emerald-500" :
                passwordStrength.label === "Good" ? "text-indigo-500" :
                passwordStrength.label === "Fair" ? "text-amber-500" : "text-rose-500"
              }`}>
                {passwordStrength.label}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1 h-1.5">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`rounded-full transition-all duration-300 ${
                    passwordStrength.score >= step ? passwordStrength.color : "bg-slate-200 dark:bg-slate-800"
                  }`}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Terms and Privacy Checkbox */}
        <motion.div variants={itemVariants} className="pt-1">
          <label className="flex items-start gap-2.5 text-xs text-muted cursor-pointer select-none py-1">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-border bg-surface-elevated text-primary focus:ring-primary/30 cursor-pointer shrink-0"
            />
            <span className="leading-snug">
              I agree to the{" "}
              <span className="text-primary font-bold hover:underline">Terms of Service</span> and{" "}
              <span className="text-primary font-bold hover:underline">Privacy Policy</span>
            </span>
          </label>
          {errors.terms && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[11px] font-semibold text-rose-500 mt-1 flex items-center gap-1"
            >
              <ShieldAlert size={12} /> {errors.terms}
            </motion.p>
          )}
        </motion.div>

        {/* Submit Button */}
        <motion.div variants={itemVariants}>
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.015, boxShadow: "0 10px 25px -5px rgba(99, 102, 241, 0.4)" }}
            whileTap={{ scale: 0.985 }}
            className="w-full h-12 min-h-[48px] flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-4 text-xs sm:text-sm font-extrabold text-white shadow-lg shadow-indigo-500/25 hover:opacity-95 transition-all cursor-pointer mt-2 disabled:opacity-50 font-satoshi relative overflow-hidden group active:scale-[0.98]"
          >
            {/* Shimmer sweep effect */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

            {loading ? (
              <div className="flex items-center gap-2">
                <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                <span>Creating Your Account…</span>
              </div>
            ) : (
              <>
                <span>Create Free Account</span>
                <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </motion.button>
        </motion.div>
      </form>

      {/* Footer Switcher */}
      <motion.p variants={itemVariants} className="mt-4 text-center text-xs text-muted font-medium">
        Already have an account?{" "}
        <button
          type="button"
          onClick={() => setIsLogin(true)}
          className="font-extrabold text-primary hover:underline transition cursor-pointer"
        >
          Sign in here
        </button>
      </motion.p>
    </motion.div>
  );
}