// Job: redirect / to /count.
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/count");
}
