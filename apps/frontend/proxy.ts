import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)", "/"]);
const isProfileRequiredRoute = createRouteMatcher(["/home(.*)", "/profile(.*)", "/calendar(.*)"]);
const isOnboardingRoute = createRouteMatcher(["/onboarding(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  // Protect non-public routes
  if (!isPublicRoute(req)) {
    await auth.protect();
  }

  // Get auth state and session claims
  const authResult = await auth();
  
  // Only check profile metadata if user is authenticated
  if (authResult.userId) {
    // Access profileExists from sessionClaims (configured in Clerk Dashboard)
    const sessionClaims = authResult.sessionClaims;
    // profileExists is now available in sessionClaims since it's configured in the session token
    const profileExists = sessionClaims?.profileExists as boolean | undefined;

    // Redirect to onboarding if profile doesn't exist (false or undefined)
    if (isProfileRequiredRoute(req) && profileExists !== true) {
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }

    // Redirect away from onboarding if profile already exists
    if (isOnboardingRoute(req) && profileExists === true) {
      return NextResponse.redirect(new URL("/home", req.url));
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
