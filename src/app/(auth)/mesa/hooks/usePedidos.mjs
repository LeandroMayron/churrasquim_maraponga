import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export function usePedidos(mesaId) {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchPedidos() {
      setLoading(true);
      const { data } = await supabase
        .from("pedidos")
        .select("*")
        .eq("mesa_id", mesaId);
      setPedidos(data || []);
      setLoading(false);
    }
    fetchPedidos();
  }, [mesaId]);

  return { pedidos, loading };
}
