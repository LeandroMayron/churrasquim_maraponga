export const calcularTotalPessoa = (pessoaId, pedidosPorPessoa) => {
  const itens = pedidosPorPessoa[pessoaId] || [];
  return itens.reduce((t, i) => t + i.price * i.quantity, 0);
};
