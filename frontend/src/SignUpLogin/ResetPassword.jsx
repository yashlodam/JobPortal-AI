import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Lock,
    Mail,
    Eye,
    EyeOff,
    ShieldCheck,
    ArrowLeft,
    Pencil,
} from "lucide-react";
import { notifications } from "@mantine/notifications";
import { useAppDispatch } from "../State/Store";
import { sendOtp, verifyOtp, resetPassword } from "../State/AuthSlic";


const MIN_PASSWORD_LENGTH = 8;
const RESEND_COOLDOWN_SECONDS = 30;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* Single source of truth for the accent gradient — light blue → deep blue,
   reused across the icon badge, the top accent bar, and both CTA buttons
   so the theme reads as one deliberate palette instead of ad-hoc colors. */
const ACCENT_GRADIENT = "linear-gradient(135deg, #38BDF8 0%, #3B82F6 55%, #1D4ED8 100%)";

const INPUT_CLASSES =
    "w-full rounded-xl border border-border bg-surface text-heading placeholder:text-muted py-4 px-4 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-500/20 disabled:opacity-60";

function ResetPassword() {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const [otpSent, setOtpSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [formData, setFormData] = useState({
        email: "",
        otp: "",
        newPassword: "",
        confirmPassword: "",
    });

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    // Keep the OTP field numeric-only, regardless of what the keyboard allows through.
    const handleOtpChange = (e) => {
        const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 6);
        setFormData((prev) => ({ ...prev, otp: digitsOnly }));
    };

    // Cooldown ticks down once a second while active.
    useEffect(() => {
        if (resendCooldown <= 0) return;
        const timer = setInterval(() => {
            setResendCooldown((s) => s - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [resendCooldown]);

    // SEND OTP (also used for resend)
    const handleSendOtp = async () => {
        if (!formData.email) {
            notifications.show({
                color: "red",
                title: "Email required",
                message: "Enter your email address.",
            });
            return;
        }

        if (!EMAIL_PATTERN.test(formData.email)) {
            notifications.show({
                color: "red",
                title: "Invalid email",
                message: "Enter a valid email address.",
            });
            return;
        }

        try {
            setLoading(true);
            const cleanEmail = formData.email.trim().toLowerCase();

            await dispatch(sendOtp(cleanEmail)).unwrap();

            notifications.show({
                color: "green",
                title: "Code sent",
                message: "Check your inbox for the 6-digit verification code.",
            });

            setOtpSent(true);
            setResendCooldown(RESEND_COOLDOWN_SECONDS);
        } catch (e) {
            const errorMsg = typeof e === "string"
                ? e
                : e?.message || e?.error || "Unable to send verification code. Ensure this email is registered.";
            notifications.show({
                color: "red",
                title: "Couldn't send code",
                message: errorMsg,
            });
        } finally {
            setLoading(false);
        }
    };

    // Let the user fix a mistyped email instead of being locked in.
    const handleChangeEmail = () => {
        setOtpSent(false);
        setResendCooldown(0);
        setFormData((prev) => ({ ...prev, otp: "", newPassword: "", confirmPassword: "" }));
    };

    // RESET PASSWORD
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.otp) {
            notifications.show({
                color: "red",
                title: "Code required",
                message: "Enter the verification code sent to your email.",
            });
            return;
        }

        if (formData.newPassword.length < MIN_PASSWORD_LENGTH) {
            notifications.show({
                color: "red",
                title: "Password too short",
                message: `Use at least ${MIN_PASSWORD_LENGTH} characters.`,
            });
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            notifications.show({
                color: "red",
                title: "Passwords don't match",
                message: "Make sure both passwords are identical.",
            });
            return;
        }

        try {
            setLoading(true);
            const cleanEmail = formData.email.trim().toLowerCase();

            const verifyRequest = {
                email: cleanEmail,
                otp: formData.otp.trim(),
            };
            const resetRequest = {
                email: cleanEmail,
                newPassword: formData.newPassword,
            };

            // Step 1: verify OTP
            await dispatch(verifyOtp(verifyRequest)).unwrap();

            // Step 2: reset password
            await dispatch(resetPassword(resetRequest)).unwrap();

            notifications.show({
                color: "green",
                title: "Password updated",
                message: "Your password has been reset. Sign in with your new password.",
            });

            navigate("/auth");
        } catch (e) {
            const errorMsg = typeof e === "string"
                ? e
                : e?.message || e?.error || "Reset failed. Please check your verification code.";
            notifications.show({
                color: "red",
                title: "Reset failed",
                message: errorMsg,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-background flex items-center justify-center px-6 py-10 font-[Inter,sans-serif]">

            {/* Ambient glow */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-32 -left-20 h-96 w-96 rounded-full bg-sky-500/15 blur-[120px]"
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-blue-600/15 blur-[120px]"
            />

            <div className="relative w-full max-w-lg rounded-3xl border border-border bg-surface backdrop-blur-2xl shadow-[0_25px_80px_rgba(0,0,0,0.25)] overflow-hidden">

                {/* Top accent */}
                <div className="h-1.5" style={{ background: ACCENT_GRADIENT }} />

                <div className="p-8 sm:p-10">

                    {/* Logo */}
                    <div className="flex justify-center">
                        <div
                            className="flex h-16 w-16 items-center justify-center rounded-full shadow-lg shadow-blue-500/20"
                            style={{ background: ACCENT_GRADIENT }}
                        >
                            <ShieldCheck size={30} className="text-white" />
                        </div>
                    </div>

                    {/* Heading */}
                    <h1 className="mt-6 text-center font-satoshi font-extrabold text-3xl text-heading">
                        Reset your password
                    </h1>

                    <p className="mt-2 text-center text-sm text-muted">
                        Securely recover access to your JobPortal AI account.
                    </p>

                    <form onSubmit={handleSubmit} className="mt-9 space-y-6" noValidate>

                        {/* Email */}
                        <div>
                            <div className="mb-2 flex items-center justify-between">
                                <label htmlFor="email" className="text-sm font-semibold text-heading">
                                    Email address
                                </label>
                                {otpSent && (
                                    <button
                                        type="button"
                                        onClick={handleChangeEmail}
                                        className="flex items-center gap-1 text-xs font-medium text-sky-500 hover:text-sky-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/60 rounded"
                                    >
                                        <Pencil size={12} />
                                        Change
                                    </button>
                                )}
                            </div>

                            <div className="relative">
                                <Mail size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    autoComplete="email"
                                    value={formData.email}
                                    disabled={otpSent}
                                    onChange={handleChange}
                                    placeholder="john@example.com"
                                    className={`${INPUT_CLASSES} pl-12 pr-4`}
                                />
                            </div>
                        </div>

                        {!otpSent ? (
                            <button
                                type="button"
                                onClick={handleSendOtp}
                                disabled={loading}
                                style={{ background: ACCENT_GRADIENT }}
                                className="w-full rounded-xl border border-sky-400/30 py-4 font-semibold text-white transition-all duration-300 hover:shadow-[0_0_35px_rgba(59,130,246,0.45)] hover:scale-[1.02] active:scale-100 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100 disabled:hover:shadow-none"
                            >
                                {loading ? "Sending code…" : "Send verification code"}
                            </button>
                        ) : (
                            <>
                                {/* OTP */}
                                <div>
                                    <label htmlFor="otp" className="mb-2 block text-sm font-semibold text-heading">
                                        Verification code
                                    </label>

                                    <input
                                        id="otp"
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        name="otp"
                                        autoComplete="one-time-code"
                                        value={formData.otp}
                                        onChange={handleOtpChange}
                                        placeholder="123456"
                                        maxLength={6}
                                        className={`${INPUT_CLASSES} text-center text-2xl tracking-[10px] placeholder:text-muted`}
                                    />

                                    <div className="mt-2 text-center">
                                        <button
                                            type="button"
                                            onClick={handleSendOtp}
                                            disabled={resendCooldown > 0 || loading}
                                            className="text-xs font-medium text-muted transition hover:text-sky-500 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {resendCooldown > 0
                                                ? `Resend code in ${resendCooldown}s`
                                                : "Resend code"}
                                        </button>
                                    </div>
                                </div>

                                {/* New password */}
                                <div>
                                    <label htmlFor="newPassword" className="mb-2 block text-sm font-semibold text-heading">
                                        New password
                                    </label>

                                    <div className="relative">
                                        <Lock size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                                        <input
                                            id="newPassword"
                                            type={showPassword ? "text" : "password"}
                                            name="newPassword"
                                            autoComplete="new-password"
                                            value={formData.newPassword}
                                            onChange={handleChange}
                                            placeholder="Enter new password"
                                            className={`${INPUT_CLASSES} pl-12 pr-12`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword((v) => !v)}
                                            aria-label={showPassword ? "Hide password" : "Show password"}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-heading focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/60 rounded"
                                        >
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                    <p className="mt-1.5 text-xs text-muted">
                                        At least {MIN_PASSWORD_LENGTH} characters.
                                    </p>
                                </div>

                                {/* Confirm password */}
                                <div>
                                    <label htmlFor="confirmPassword" className="mb-2 block text-sm font-semibold text-heading">
                                        Confirm password
                                    </label>

                                    <div className="relative">
                                        <Lock size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                                        <input
                                            id="confirmPassword"
                                            type={showConfirm ? "text" : "password"}
                                            name="confirmPassword"
                                            autoComplete="new-password"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            placeholder="Confirm password"
                                            className={`${INPUT_CLASSES} pl-12 pr-12`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirm((v) => !v)}
                                            aria-label={showConfirm ? "Hide password" : "Show password"}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-heading focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/60 rounded"
                                        >
                                            {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                    {formData.confirmPassword.length > 0 &&
                                        formData.newPassword !== formData.confirmPassword && (
                                            <p className="mt-1.5 text-xs text-red-400">
                                                Passwords don't match yet.
                                            </p>
                                        )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    style={{ background: ACCENT_GRADIENT }}
                                    className="w-full rounded-xl py-4 font-semibold text-white transition-all duration-300 hover:shadow-[0_0_35px_rgba(59,130,246,0.45)] hover:scale-[1.02] active:scale-100 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100 disabled:hover:shadow-none"
                                >
                                    {loading ? "Updating password…" : "Reset password"}
                                </button>
                            </>
                        )}
                    </form>

                    <div className="mt-8 flex justify-center">
                        <Link
                            to="/auth"
                            className="flex items-center gap-2 text-sm text-muted transition hover:text-sky-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/60 rounded"
                        >
                            <ArrowLeft size={16} />
                            Back to login
                        </Link>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default ResetPassword;