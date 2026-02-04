import { Suspense } from "react";
import ReturnClient from "./ReturnClient";

export default function Page() {
  return (
    <Suspense fallback={<p>Loading payment result…</p>}>
      <ReturnClient />
    </Suspense>
  );
}
