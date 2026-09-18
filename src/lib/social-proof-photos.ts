import { cloudinaryFaceThumbUrl } from "@/src/lib/cloudinary-image";
import { TEST_LANDING_GRADUATES } from "@/src/lib/test-landing-graduates";

export interface SocialProofPhoto {
  readonly src: string;
  readonly alt: string;
}

export const GRADUATE_PROOF_PHOTOS: readonly SocialProofPhoto[] =
  TEST_LANDING_GRADUATES.map((graduate) => ({
    src: cloudinaryFaceThumbUrl(graduate.imageUrl, 96),
    alt: graduate.fullName,
  }));
