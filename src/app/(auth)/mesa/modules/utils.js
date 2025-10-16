export const delay = (ms) => new Promise((res) => setTimeout(res, ms));

export const calcularTotal = (lista = []) =>
  lista.reduce((total, item) => total + item.quantity * item.price, 0);

export const toggleItemQuantity = (
  selectedItems,
  setSelectedItems,
  item,
  delta
) => {
  setSelectedItems((prev) => {
    const exists = prev.find((i) => i.name === item.name);
    if (exists) {
      const newQuantity = exists.quantity + delta;
      if (newQuantity <= 0) return prev.filter((i) => i.name !== item.name);
      return prev.map((i) =>
        i.name === item.name ? { ...i, quantity: newQuantity } : i
      );
    } else if (delta > 0) {
      return [...prev, { ...item, quantity: delta }];
    }
    return prev;
  });
};

export const getItemQuantity = (selectedItems, item) => {
  const found = selectedItems.find((i) => i.name === item.name);
  return found ? found.quantity : 0;
};
