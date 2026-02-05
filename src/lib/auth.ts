import { NextAuthOptions } from "next-auth";

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
            token: "https://www.strava.com/api/v3/oauth/token",
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
            clientId: process.env.STRAVA_CLIENT_ID,
            clientSecret: process.env.STRAVA_CLIENT_SECRET,
        },
    ],
    callbacks: {
        async jwt({ token, account }) {
            if (account) {
                token.accessToken = account.access_token;
            }
            return token;
        },
        async session({ session, token }) {
            session.accessToken = token.accessToken as string;
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
};
