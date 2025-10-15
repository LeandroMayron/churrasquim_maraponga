import { useState } from "react";
import { supabase } from "@/lib/supabase";

export function usePagamento(mesaId) {
  const [loading, setLoading] = useState(false);

  const fecharMesa = async () => {
    setLoading(true);
    await supabase.from("pedidos").delete().eq("mesa_id", mesaId);
    setLoading(false);
  };

  return { fecharMesa, loading };
}
