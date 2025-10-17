import supabase from "../../../../lib/supabase";

// -------------------------
// 🔹 CARREGAR CARDÁPIO
// -------------------------
export async function carregarCardapio() {
  try {
    const response = await fetch(
      "https://6644-fontend.github.io/menu-churrasquinho-maraponga/menu.json"
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao carregar cardápio:", error);
    return {};
  }
}

// -------------------------
// 🔹 CALCULAR TOTAL DO PEDIDO
// -------------------------
export function calcularTotal(pedidos = []) {
  try {
    return pedidos.reduce(
      (acc, item) => acc + (item.quantity || 0) * (item.price || 0),
      0
    );
  } catch (err) {
    console.error("Erro ao calcular total:", err);
    return 0;
  }
}

// -------------------------
// 🔹 ENVIAR PEDIDO PARA O SUPABASE
// -------------------------
export async function enviarPedidoSupabase(mesaId, itensSelecionados) {
  if (!mesaId || !Array.isArray(itensSelecionados)) return;

  try {
    const { error } = await supabase.from("pedidos").insert(
      itensSelecionados.map((item) => ({
        mesa_id: mesaId,
        nome_item: item.name,
        quantidade: item.quantity,
        preco_unitario: item.price,
        total_item: item.quantity * item.price,
        status: "pendente",
      }))
    );

    if (error) throw error;
  } catch (err) {
    console.error("Erro ao enviar pedido:", err);
  }
}

// -------------------------
// 🔹 FECHAR MESA
// -------------------------
export async function fecharMesaSupabase(mesaId, pedidos, formaPagamento) {
  if (!mesaId || !Array.isArray(pedidos)) return;

  const total = calcularTotal(pedidos);

  try {
    const { error } = await supabase.from("mesas_fechadas").insert([
      {
        mesa_id: mesaId,
        pedidos: pedidos.map((p) => ({
          nome: p.name,
          quantidade: p.quantity,
          preco: p.price,
        })),
        total,
        forma_pagamento: formaPagamento,
        data_fechamento: new Date().toISOString(),
      },
    ]);

    if (error) throw error;

    console.log("Mesa fechada com sucesso:", mesaId);
  } catch (err) {
    console.error("Erro ao fechar mesa:", err);
  }
}

// -------------------------
// 🔹 REMOVER ITEM DO PEDIDO
// -------------------------
export function removerItem(pedidos, setPedidos, index) {
  const novosPedidos = [...pedidos];
  novosPedidos.splice(index, 1);
  setPedidos(novosPedidos);
}

// -------------------------
// 🔹 FORMATAR VALOR EM REAL
// -------------------------
export function formatarValor(valor) {
  return `R$ ${Number(valor || 0)
    .toFixed(2)
    .replace(".", ",")}`;
}
