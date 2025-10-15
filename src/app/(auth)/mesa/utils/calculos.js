export function calcularTotal(pedidos) {
  return pedidos.reduce((sum, item) => sum + item.preco * item.quantidade, 0);
}
