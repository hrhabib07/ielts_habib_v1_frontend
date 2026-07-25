import { redirect } from "next/navigation";

/** Legacy demo stage runner → short Mission Zero. */
export default function DemoStageRedirectPage() {
  redirect("/demo");
}
