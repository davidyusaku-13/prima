import { clerkMiddleware } from "@clerk/astro/server";
import { defineMiddleware, sequence } from "astro:middleware";

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

export const onRequest = sequence(clerkMiddleware(), adminGuard);
