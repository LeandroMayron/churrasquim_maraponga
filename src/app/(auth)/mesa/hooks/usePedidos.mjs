// hooks/usePedidos.mjs
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase"; // ajuste o caminho conforme seu projeto

export function usePedidos(mesaId) {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!mesaId) return;

    let channel;

    // Função para buscar os pedidos iniciais
    const fetchPedidos = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("pedidos")
        .select("*")
        .eq("mesa_id", mesaId);
      if (error) {
        console.error("Erro ao buscar pedidos:", error);
      } else {
        setPedidos(data || []);
      }
      setLoading(false);
    };

    fetchPedidos();

    // Criar canal Realtime
    channel = supabase
      .channel(`mesa-pedidos-${mesaId}`)
      .on(
        "postgres_changes",
        {
          event: "*", // pode ser INSERT, UPDATE, DELETE ou "*"
          schema: "public",
          table: "pedidos",
          filter: `mesa_id=eq.${mesaId}`,
        },
        (payload) => {
          console.log("Realtime payload:", payload);

          // Atualiza a lista de pedidos
          // Dependendo do evento, você pode otimizar:
          // INSERT -> adicionar
          // UPDATE -> atualizar
          // DELETE -> remover
          fetchPedidos();
        }
      )
      .subscribe();

    // Cleanup ao desmontar
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [mesaId]);

  return { pedidos, loading };
}
