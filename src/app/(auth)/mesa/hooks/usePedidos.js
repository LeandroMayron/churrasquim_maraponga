import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";

export function usePedidos(mesaId) {
  const [pedidos, setPedidos] = useState([]);

  useEffect(() => {
    fetchPedidos();

    const subscription = supabase
      .from(`pedidos:mesa_id=eq.${mesaId}`)
      .on("INSERT", (payload) => setPedidos((prev) => [...prev, payload.new]))
      .on("UPDATE", (payload) =>
        setPedidos((prev) =>
          prev.map((p) => (p.id === payload.new.id ? payload.new : p))
        )
      )
      .on("DELETE", (payload) =>
        setPedidos((prev) => prev.filter((p) => p.id !== payload.old.id))
      )
      .subscribe();

    return () => supabase.removeSubscription(subscription);
  }, [mesaId]);

  async function fetchPedidos() {
    const { data } = await supabase
      .from("pedidos")
      .select("*")
      .eq("mesa_id", mesaId);
    setPedidos(data || []);
  }

  return { pedidos, fetchPedidos };
}
