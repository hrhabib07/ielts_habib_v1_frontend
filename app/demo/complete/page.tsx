import { redirect } from "next/navigation";

/** Legacy demo complete → short Mission Zero (includes signup screen). */
export default function DemoCompleteRedirectPage() {
  redirect("/demo");
}
