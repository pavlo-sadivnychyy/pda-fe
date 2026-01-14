import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher(["/", "/sign-in(.*)", "/sign-up(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, redirectToSignIn } = await auth();
  const isAuthenticated = !!userId;

  const url = new URL(req.url);

  // ✅ 1) Залогінений не може зайти на "/"
  if (isAuthenticated && url.pathname === "/") {
    url.pathname = "/dashboard"; // <-- куди треба
    return Response.redirect(url);
  }

  // ✅ 2) Незалогінений не може на приватні роути
  if (!isAuthenticated && !isPublicRoute(req)) {
    return redirectToSignIn({ returnBackUrl: req.url });
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
