import { NextAuthOptions } from "next-auth";
import { env } from "@/config/env";

export const authOptions: NextAuthOptions = {
    providers: [
        {
            id: "strava",
            name: "Strava",
            type: "oauth",
            authorization: {
                url: "https://www.strava.com/api/v3/oauth/authorize",
                params: {
                    scope: "read,activity:read,activity:read_all,profile:read_all",
                    response_type: "code",
                },
            },
            token: {
                url: "https://www.strava.com/api/v3/oauth/token",
            },
            userinfo: "https://www.strava.com/api/v3/athlete",
            client: {
                token_endpoint_auth_method: "client_secret_post",
            },
            profile(profile) {
                return {
                    id: profile.id.toString(),
                    name: `${profile.firstname} ${profile.lastname}`,
                    image: profile.profile,
                };
            },
            clientId: env.STRAVA_CLIENT_ID,
            clientSecret: env.STRAVA_CLIENT_SECRET,
        },
    ],
    callbacks: {
        async jwt({ token, account, user }) {
            // Initial sign in
            if (account && user) {
                return {
                    ...token,
                    accessToken: account.access_token,
                    refreshToken: account.refresh_token,
                    expiresAt: account.expires_at ? account.expires_at * 1000 : 0,
                };
            }

            // Return previous token if the access token has not expired yet
            if (Date.now() < (token.expiresAt as number)) {
                return token;
            }

            // If the access token has expired, try to refresh it
            try {
                const response = await fetch("https://www.strava.com/api/v3/oauth/token", {
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: new URLSearchParams({
                        client_id: env.STRAVA_CLIENT_ID,
                        client_secret: env.STRAVA_CLIENT_SECRET,
                        grant_type: "refresh_token",
                        refresh_token: token.refreshToken as string,
                    }),
                    method: "POST",
                });

                const tokens = await response.json();

                if (!response.ok) throw tokens;

                return {
                    ...token,
                    accessToken: tokens.access_token,
                    expiresAt: Date.now() + tokens.expires_in * 1000,
                    refreshToken: tokens.refresh_token ?? token.refreshToken, // Fall back to old refresh token
                };
            } catch (error) {
                console.error("RefreshAccessTokenError", error);
                return { ...token, error: "RefreshAccessTokenError" };
            }
        },
        async session({ session, token }) {
            session.accessToken = token.accessToken as string;
            session.error = token.error as string;
            return session;
        },
    },
    secret: env.NEXTAUTH_SECRET,
    debug: env.NODE_ENV === 'development',
};
