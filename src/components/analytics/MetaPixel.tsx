import { META_PIXEL_ID, isMetaPixelConfigured } from "@/src/lib/meta-pixel";

/**
 * Standard Meta Pixel base code for <head>.
 * Init only. PageView is fired on route changes (see MetaPageViewTracker).
 */
export function MetaPixelHead() {
  if (!isMetaPixelConfigured()) return null;

  const pixelId = META_PIXEL_ID;
  // disablePushState: Meta must NOT auto-fire PageView on SPA history changes.
  // MetaPageViewTracker owns PageView so GTM/history do not double-count.
  const snippet = `
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq.disablePushState=true;
fbq('init','${pixelId}');
`.replace(/\n/g, "");

  return (
    <script
      id="meta-pixel-base"
      dangerouslySetInnerHTML={{ __html: snippet }}
    />
  );
}

/** Noscript fallback image for users without JS. */
export function MetaPixelBody() {
  if (!isMetaPixelConfigured()) return null;

  const src = `https://www.facebook.com/tr?id=${encodeURIComponent(META_PIXEL_ID)}&ev=PageView&noscript=1`;

  return (
    <noscript>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img height="1" width="1" className="hidden" src={src} alt="" />
    </noscript>
  );
}
