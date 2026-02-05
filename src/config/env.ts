import { z } from "zod";

/**
 * Environment variable schema with runtime validation
 * This ensures all required env vars are present and correctly typed
 */
const envSchema = z.object({
    // Strava OAuth
    STRAVA_CLIENT_ID: z.string().min(1, "STRAVA_CLIENT_ID is required"),
    STRAVA_CLIENT_SECRET: z.string().min(1, "STRAVA_CLIENT_SECRET is required"),

    // NextAuth
    NEXTAUTH_SECRET: z.string().min(1, "NEXTAUTH_SECRET is required"),
    NEXTAUTH_URL: z.string().url().optional(),

    // AI Briefing (Optional)
    GEMINI_API_KEY: z.string().optional(),
    QWEN_API_KEY: z.string().optional(),

    // Node environment
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

/**
 * Validated environment variables
 * Will throw at build/startup time if validation fails
 */
function validateEnv() {
    // In the browser, only public env vars are available
    if (typeof window !== "undefined") {
        return {} as z.infer<typeof envSchema>;
    }

    const parsed = envSchema.safeParse(process.env);

    if (!parsed.success) {
        console.error("❌ Invalid environment variables:", parsed.error.flatten().fieldErrors);

        // In development, warn but don't crash
        if (process.env.NODE_ENV === "development") {
            console.warn("⚠️ Running with missing env vars in development mode");
            return process.env as unknown as z.infer<typeof envSchema>;
        }

        throw new Error("Invalid environment variables");
    }

    return parsed.data;
}

export const env = validateEnv();

/**
 * Type-safe environment variable access
 */
export type Env = z.infer<typeof envSchema>;
