import { Suspense } from "react";
import FormPage from "./FormPage";
import Loder from "@/components/Loder";


export default function Page() {
  return (
    <Suspense fallback={<Loder />}>
      <FormPage />
    </Suspense>
  );
}