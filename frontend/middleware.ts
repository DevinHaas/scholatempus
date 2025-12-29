import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)", "/"]);
const isHomeRoute = createRouteMatcher(["/home(.*)"]);
const isOnboardingRoute = createRouteMatcher(["/onboarding(.*)"]);

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export default clerkMiddleware(async (authFn, req) => {
  // Protect non-public routes
  if (!isPublicRoute(req)) {
    await authFn.protect();
  }

  // Only check profile for authenticated users on home/onboarding routes
  if (!isPublicRoute(req)) {
    const url = req.nextUrl.clone();
    const isHome = isHomeRoute(req);
    const isOnboarding = isOnboardingRoute(req);

    if (isHome || isOnboarding) {
      try {
        // Get auth token for API call
        const { getToken } = await auth();
        const token = await getToken();
        
        if (!token) {
          // If no token, let Clerk handle auth redirect
          return NextResponse.next();
        }

        // Check profile existence
        const response = await fetch(`${API_URL}/profile/exists`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          // Add cache control to prevent stale data
          cache: "no-store",
        });

        if (response.ok) {
          const data = await response.json();
          const profileExists = data.exists ?? false;

          // Redirect logic
          if (isHome && !profileExists) {
            // User trying to access home without profile -> redirect to onboarding
            url.pathname = "/onboarding";
            return NextResponse.redirect(url);
          } else if (isOnboarding && profileExists) {
            // User trying to access onboarding with profile -> redirect to home
            url.pathname = "/home";
            return NextResponse.redirect(url);
          }
        }
        // If API call fails, allow request through to avoid blocking users
        // The page components can handle the error state
      } catch (error) {
        // On error, allow request through to avoid blocking users
        // The page components can handle the error state
        console.error("Profile check error in middleware:", error);
      }
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
