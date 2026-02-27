import { clerkMiddleware } from "@clerk/astro/server";
import { defineMiddleware, sequence } from "astro:middleware";
import { resolveApiUrl } from "./utils/api-url";

function isDocumentRequest(acceptHeader: string | null): boolean {
    if (!acceptHeader) {
        return true;
    }
    return acceptHeader.includes("text/html") || acceptHeader.includes("application/xhtml+xml");
}

const ensureRequestContext = defineMiddleware(async (context, next) => {
    context.locals.apiUrl = resolveApiUrl(context.locals.runtime?.env?.API_URL);

    const pathname = context.url.pathname;
    const isAdminPath = pathname === "/admin" || pathname.startsWith("/admin/");
    const shouldHydrateAuth =
        isDocumentRequest(context.request.headers.get("accept")) ||
        isAdminPath ||
        pathname === "/register";

    if (shouldHydrateAuth && !context.locals.authToken && typeof context.locals.auth === "function") {
        try {
            const authContext = context.locals.auth();
            if (authContext.isAuthenticated) {
                const token =
                    (await authContext.getToken()) ??
                    (await authContext.getToken({ expiresInSeconds: 60 }));
                if (token) {
                    context.locals.authToken = token;
                }
            }
        } catch {
            // Leave authToken as-is; guarded routes handle missing token.
        }
    }

    return next();
});

const adminGuard = defineMiddleware(async (context, next) => {
    const pathname = context.url.pathname;
    const isAdminPath = pathname === "/admin" || pathname.startsWith("/admin/");

    if (!isAdminPath) {
        return next();
    }

    const token = context.locals.authToken;
    if (!token) {
        return context.redirect("/");
    }

    return next();
});

export const onRequest = sequence(clerkMiddleware(), ensureRequestContext, adminGuard);
