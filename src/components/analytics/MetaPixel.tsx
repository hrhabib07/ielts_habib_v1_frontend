import { META_PIXEL_ID, isMetaPixelConfigured } from "@/src/lib/meta-pixel";

/**
 * Standard Meta Pixel base code for <head>.
 * Init only. PageView is fired on route changes (see MetaPageViewTracker).
 * Single init for this pixel · skip if already bootstrapped (avoids conflicting versions).
 */
export function MetaPixelHead() {
  if (!isMetaPixelConfigured()) return null;

  const pixelId = META_PIXEL_ID;
  // disablePushState: Meta must NOT auto-fire PageView on SPA history changes.
  // MetaPageViewTracker owns PageView so GTM/history do not double-count.
  // Guard: do not inject a second fbevents.js or re-init the same pixel id.
  const snippet = `
!function(f,b,e,v,n,t,s){
  if(!f.fbq){
    n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];
    if(!b.querySelector('script[src*="fbevents.js"]')){
      t=b.createElement(e);t.async=!0;t.src=v;
      s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s);
    }
  }
  f.fbq.disablePushState=true;
  if(!f.__gamlishMetaPixelInited){
    f.__gamlishMetaPixelInited='${pixelId}';
    fbq('init','${pixelId}');
  }
}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
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
