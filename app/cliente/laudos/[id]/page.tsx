"use client";

import { useParams } from "next/navigation";
import { LaudoView } from "@/components/prontuario/Laudo";

export default function PaginaLaudo() {
  const { id } = useParams<{ id: string }>();
  return <LaudoView id={id} />;
}
