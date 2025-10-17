// Retorna o total de um array de pedidos
export function calcularTotal(pedidos = []) {
  return pedidos.reduce(
    (acc, item) => acc + (item.quantity || 0) * (item.price || 0),
    0
  );
}
