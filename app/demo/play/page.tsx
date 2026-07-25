import { redirect } from "next/navigation";

/** Legacy multi-stage demo map → short Mission Zero. */
export default function DemoPlayRedirectPage() {
  redirect("/demo");
}
