import { Alert } from "react-native";
import { supabase } from "../../../../lib/supabase";

// Fecha a mesa tradicional
export async function fecharMesaTradicional(
  id,
  formaPagamento,
  setMesaFechada,
  setPedidoEnviado,
  setConfirmModalVisible
) {
  try {
    const { data: pedidoAberto, error: fetchError } = await supabase
      .from("pedidos")
      .select("id, itens")
      .eq("mesa_id", id)
      .eq("pessoa_id", null)
      .eq("status", "aberto")
      .limit(1)
      .maybeSingle();

    if (fetchError || !pedidoAberto) {
      Alert.alert("Aviso", "Nenhum pedido aberto encontrado para esta mesa.");
      return;
    }

    const { error } = await supabase
      .from("pedidos")
      .update({
        status: "fechado",
        pagamento: formaPagamento,
      })
      .eq("id", pedidoAberto.id);

    if (!error) {
      console.log("✅ Mesa fechada com sucesso.");
      setMesaFechada(true);
      setPedidoEnviado([]);
      setConfirmModalVisible(false);
    } else {
      console.error("Erro ao fechar mesa:", error);
      Alert.alert("Erro", "Erro ao fechar a mesa. Tente novamente.");
    }
  } catch (err) {
    console.error("Erro inesperado ao fechar a mesa:", err);
    Alert.alert("Erro inesperado", "Tente novamente.");
  }
}

// Soma todos os pedidos abertos da mesa
export async function totalMesaGeral(id) {
  try {
    const { data, error } = await supabase
      .from("pedidos")
      .select("total")
      .eq("mesa_id", id)
      .eq("status", "aberto");

    if (!error) {
      return (data || []).reduce((s, r) => s + (r.total || 0), 0);
    }
    return 0;
  } catch {
    return 0;
  }
}

// Calcula o total de consumo agrupando por pessoa
export function calcularTotaisPorConsumo(pedidos) {
  if (!Array.isArray(pedidos)) return [];
  const totais = {};

  pedidos.forEach((pedido) => {
    const pessoa = pedido.pessoa_nome || "Mesa";
    const total = Number(pedido.total) || 0;
    totais[pessoa] = (totais[pessoa] || 0) + total;
  });

  return Object.entries(totais).map(([pessoa, total]) => ({ pessoa, total }));
}

// Confirma divisão de conta
export async function confirmarDivisao() {
  try {
    console.log("✅ Divisão confirmada!");
    Alert.alert("Sucesso", "Divisão confirmada com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao confirmar divisão:", error);
    Alert.alert("Erro", "Não foi possível confirmar a divisão.");
  }
}
