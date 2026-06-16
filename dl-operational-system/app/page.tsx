import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/routes";

/** Raiz redireciona para o dashboard (entrada padrão do sistema). */
export default function Home() {
  redirect(ROUTES.dashboard);
}
