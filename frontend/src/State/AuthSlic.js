import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../config/Api";

// ─── Register ────────────────────────────────────────────────────────────────
export const signup = createAsyncThunk(
    "auth/signup",
    async (signupRequest, { rejectWithValue }) => {
        try {
            const response = await api.post("/auth/register", signupRequest);
            return response.data;
        } catch (error) {
            console.error("Signup failed:", error);
            return rejectWithValue(
                error.response?.data || { message: "Signup failed. Please try again." }
            );
        }
    }
);

// ─── Sign In ─────────────────────────────────────────────────────────────────
// On success, the backend sets the HttpOnly access_token cookie automatically.
// The JWT is never exposed to JavaScript.
export const signin = createAsyncThunk(
    "auth/signin",
    async (loginRequest, { rejectWithValue }) => {
        try {
            const response = await api.post("/auth/login", loginRequest);
            return response.data;
        } catch (error) {
            console.error("Login failed:", error);
            return rejectWithValue(
                error.response?.data || { message: "Login failed. Please try again." }
            );
        }
    }
);

// ─── Fetch Current User ───────────────────────────────────────────────────────
// GET /api/auth/me (or /api/users/me) — cookie-authenticated
export const getUserProfile = createAsyncThunk(
    "auth/getUserProfile",
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get("/auth/me");
            return response.data?.data ?? response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data || { message: "Failed to fetch user" }
            );
        }
    }
);

// ─── Restore Auth on Startup ─────────────────────────────────────────────────
// Called once when the app mounts. Hits /api/auth/me with credentials + Bearer token.
// On success, updates the profile in Redux & localStorage.
// On 401/403, clears the stored session. On network timeout/cold start, preserves cached state.
export const restoreAuthState = createAsyncThunk(
    "auth/restoreAuthState",
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get("/auth/me", { timeout: 15000 });
            return response.data?.data ?? response.data;
        } catch (error) {
            return rejectWithValue({
                message: error.response?.data?.message || error.userMessage || "Not authenticated",
                status: error.response?.status,
            });
        }
    }
);

// ─── Logout ──────────────────────────────────────────────────────────────────
// Sends POST /api/auth/logout to clear the HttpOnly cookie on the server.
export const logoutUser = createAsyncThunk(
    "auth/logoutUser",
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.post("/auth/logout");
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data || { message: "Logout failed" }
            );
        }
    }
);

// ─── Send OTP ────────────────────────────────────────────────────────────────
export const sendOtp = createAsyncThunk(
    "auth/sendOtp",
    async (email, { rejectWithValue }) => {
        try {
            const cleanEmail = encodeURIComponent((email || "").trim());
            const response = await api.post(`/auth/send-otp/${cleanEmail}`);
            return response.data;
        } catch (error) {
            const data = error.response?.data;
            const message = data?.message || data?.error || error.message || "Failed to send OTP.";
            return rejectWithValue({ message, ...data });
        }
    }
);

// ─── Verify OTP ──────────────────────────────────────────────────────────────
export const verifyOtp = createAsyncThunk(
    "auth/verifyOtp",
    async (request, { rejectWithValue }) => {
        try {
            const response = await api.post("/auth/verify-otp", {
                email: (request.email || "").trim(),
                otp: (request.otp || "").trim(),
            });
            return response.data;
        } catch (error) {
            const data = error.response?.data;
            const message = data?.message || data?.error || error.message || "OTP verification failed.";
            return rejectWithValue({ message, ...data });
        }
    }
);

// ─── Reset Password ──────────────────────────────────────────────────────────
export const resetPassword = createAsyncThunk(
    "auth/resetPassword",
    async (request, { rejectWithValue }) => {
        try {
            const response = await api.post("/auth/reset-password", {
                email: (request.email || "").trim(),
                newPassword: request.newPassword,
            });
            return response.data;
        } catch (error) {
            const data = error.response?.data;
            const message = data?.message || data?.error || error.message || "Password reset failed.";
            return rejectWithValue({ message, ...data });
        }
    }
);

// ─── Initial State ───────────────────────────────────────────────────────────
const storedProfile = (() => {
    try {
        const u = localStorage.getItem("jobportal_profile");
        return u ? JSON.parse(u) : null;
    } catch {
        return null;
    }
})();

const storedToken = (() => {
    try {
        return localStorage.getItem("jobportal_token") || null;
    } catch {
        return null;
    }
})();

const initialState = {
    profile: storedProfile,
    user: storedProfile,
    token: storedToken,
    loading: false,
    error: null,
    success: false,
    message: null,
    // If user profile is already present in localStorage, restore immediately on frame 0!
    isAuthRestored: !!storedProfile,
};

// ─── Slice ───────────────────────────────────────────────────────────────────
const authSlice = createSlice({
    name: "auth",
    initialState,

    reducers: {
        logout: (state) => {
            // Fire API call to clear HttpOnly cookie on backend
            api.post("/auth/logout").catch(() => {});
            try {
                localStorage.removeItem("jobportal_token");
                localStorage.removeItem("jobportal_profile");
            } catch {}
            state.profile = null;
            state.user = null;
            state.token = null;
            state.loading = false;
            state.error = null;
            state.success = false;
            state.message = null;
            state.isAuthRestored = true;
        },

        clearError: (state) => {
            state.error = null;
        },

        clearMessage: (state) => {
            state.message = null;
        },

        clearSuccess: (state) => {
            state.success = false;
        },

        forceAuthRestored: (state) => {
            state.isAuthRestored = true;
            state.loading = false;
        },
    },

    extraReducers: (builder) => {
        builder

            // ═══════════════════ RESTORE AUTH (startup) ══════════════════════
            .addCase(restoreAuthState.pending, (state) => {
                state.loading = true;
            })
            .addCase(restoreAuthState.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload) {
                    state.profile = { ...(state.profile || {}), ...action.payload };
                    state.user = state.profile;
                    try {
                        localStorage.setItem("jobportal_profile", JSON.stringify(state.profile));
                    } catch {}
                }
                state.isAuthRestored = true;
            })
            .addCase(restoreAuthState.rejected, (state, action) => {
                state.loading = false;
                state.isAuthRestored = true;
                const status = action.payload?.status;
                // Only clear credentials if backend explicitly returned 401/403.
                // Never wipe on network timeout, cold start, or offline.
                if (status === 401 || status === 403) {
                    state.profile = null;
                    state.user = null;
                    state.token = null;
                    try {
                        localStorage.removeItem("jobportal_token");
                        localStorage.removeItem("jobportal_profile");
                    } catch {}
                }
            })

            // ═══════════════════════ SIGNUP ══════════════════════════════════
            .addCase(signup.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.message = null;
                state.success = false;
            })
            .addCase(signup.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = action.payload?.message || "Registration successful";
            })
            .addCase(signup.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.error =
                    action.payload?.errorMessage ||
                    action.payload?.message ||
                    action.payload ||
                    "Registration failed";
            })

            // ═══════════════════════ SIGNIN ══════════════════════════════════
            .addCase(signin.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.message = null;
                state.success = false;
            })
            .addCase(signin.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = "Login successful";
                const userPayload = action.payload?.data || action.payload;
                const token = action.payload?.token || action.payload?.data?.token;

                if (token) {
                    state.token = token;
                    try {
                        localStorage.setItem("jobportal_token", token);
                    } catch {}
                }

                if (userPayload && (userPayload.email || userPayload.id || userPayload.name)) {
                    state.profile = userPayload;
                    state.user = userPayload;
                    try {
                        localStorage.setItem("jobportal_profile", JSON.stringify(userPayload));
                    } catch {}
                }
                state.isAuthRestored = true;
            })
            .addCase(signin.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.error =
                    action.payload?.errorMessage ||
                    action.payload?.message ||
                    action.payload ||
                    "Login failed";
            })

            // ═══════════════════ GET USER PROFILE ════════════════════════════
            .addCase(getUserProfile.pending, (state) => {
                state.loading = true;
            })
            .addCase(getUserProfile.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload) {
                    state.profile = { ...(state.profile || {}), ...action.payload };
                    state.user = state.profile;
                    try {
                        localStorage.setItem("jobportal_profile", JSON.stringify(state.profile));
                    } catch {}
                }
                state.isAuthRestored = true;
            })
            .addCase(getUserProfile.rejected, (state, action) => {
                state.loading = false;
                state.error =
                    action.payload?.message || "Failed to fetch user";
            })


            // ═══════════════════════ LOGOUT ══════════════════════════════════
            .addCase(logoutUser.fulfilled, (state) => {
                try {
                    localStorage.removeItem("jobportal_token");
                    localStorage.removeItem("jobportal_profile");
                } catch {}
                state.profile = null;
                state.user = null;
                state.token = null;
                state.loading = false;
                state.error = null;
                state.success = false;
                state.message = null;
                state.isAuthRestored = true;
            })

            // ═══════════════════════ SEND OTP ════════════════════════════════
            .addCase(sendOtp.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.message = null;
                state.success = false;
            })
            .addCase(sendOtp.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = action.payload?.message || "OTP sent successfully";
            })
            .addCase(sendOtp.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.error =
                    action.payload?.errorMessage ||
                    action.payload?.message ||
                    action.payload ||
                    "Failed to send OTP";
            })

            // ══════════════════════ VERIFY OTP ═══════════════════════════════
            .addCase(verifyOtp.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.message = null;
                state.success = false;
            })
            .addCase(verifyOtp.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = action.payload?.message || "OTP verified successfully";
            })
            .addCase(verifyOtp.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.error =
                    action.payload?.errorMessage ||
                    action.payload?.message ||
                    action.payload ||
                    "OTP verification failed";
            })

            // ══════════════════════ RESET PASSWORD ═══════════════════════════
            .addCase(resetPassword.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.message = null;
                state.success = false;
            })
            .addCase(resetPassword.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = action.payload?.message || "Password reset successful";
            })
            .addCase(resetPassword.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.error =
                    action.payload?.errorMessage ||
                    action.payload?.message ||
                    action.payload ||
                    "Password reset failed";
            });
    },
});

export const { logout, clearError, clearMessage, clearSuccess, forceAuthRestored } = authSlice.actions;

export default authSlice.reducer;