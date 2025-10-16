import { supabase } from "../../../../lib/supabase";

export async function carregarPedidosMesa(
  mesaId,
  setPedidoEnviado,
  setPedidosPorPessoa,
  setMesaFechada
) {
  try {
    const { data, error } = await supabase
      .from("pedidos")
      .select("*")
      .eq("mesa_id", mesaId)
      .in("status", ["aberto"]);

    if (error) throw error;

    const pedidos = data || [];
    const geral = pedidos.find((p) => !p.pessoa_id);
    setPedidoEnviado(geral ? geral.itens || [] : []);
    setMesaFechada(!geral);

    const map = {};
    pedidos.forEach((p) => {
      if (p.pessoa_id) map[p.pessoa_id] = p.itens || [];
    });
    setPedidosPorPessoa(map);
  } catch (err) {
    console.error("Erro ao carregar pedidos:", err);
  }
}

export function configurarRealtimePedidos(
  mesaId,
  setPedidoEnviado,
  setPedidosPorPessoa
) {
  const channel = supabase
    .channel("pedidos-realtime-mesa")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "pedidos",
        filter: `mesa_id=eq.${mesaId}`,
      },
      async () => {
        const { data, error } = await supabase
          .from("pedidos")
          .select("*")
          .eq("mesa_id", mesaId)
          .in("status", ["aberto"]);

        if (error) return console.error(error);

        const geral = data.find((p) => !p.pessoa_id);
        setPedidoEnviado(geral ? geral.itens || [] : []);

        const map = {};
        for (const p of data) {
          if (p.pessoa_id) map[p.pessoa_id] = p.itens || [];
        }
        setPedidosPorPessoa(map);
      }
    )
    .subscribe();

  return channel;
}
