/**
 * Images under /public go through Next.js image optimization (resized and converted to AVIF or
 * WebP). Uploaded files under /media and external URLs are served as they are.
 */
export function isOptimizable(src: string) {
  return src.startsWith("/") && !src.startsWith("/media/")
}
