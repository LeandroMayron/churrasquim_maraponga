import { StyleSheet } from "react-native";
import Colors from "../../../../../constants/Colors";

export default StyleSheet.create({
  // Container principal
  container: {
    flex: 1,
    paddingTop: 50,
    backgroundColor: Colors.black,
    alignItems: "center",
  },
  title: {
    color: Colors.gold,
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },

  // Botões principais
  button: {
    backgroundColor: Colors.acafrao,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
    elevation: 3,
    marginBottom: 10,
  },
  buttonText: {
    color: Colors.white,
    fontWeight: "bold",
    fontSize: 16,
  },

  // Lista de pedidos
  pedidoContainer: { marginTop: 30, width: "90%" },
  pedidoContentContainer: { alignItems: "center", paddingVertical: 10 },
  pedidoTitulo: {
    color: Colors.gold,
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  pedidoItemContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  pedidoItem: {
    color: Colors.white,
    fontSize: 16,
    marginVertical: 4,
  },
  emptyText: { color: Colors.gray, fontStyle: "italic" },

  totalContainer: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: Colors.gold,
    width: "100%",
    alignItems: "center",
  },
  totalText: { color: Colors.gold, fontSize: 18, fontWeight: "bold" },
  totalValue: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 4,
  },

  // Botão voltar
  backButton: {
    position: "absolute",
    width: 40,
    height: 40,
    top: 0,
    left: 0,
    alignSelf: "center",
    borderRadius: 8,
    zIndex: 0,
    backgroundColor: Colors.acafrao,
  },

  // Modal overlay
  modalOverlay: {
    flex: 1,
    backgroundColor: "#000000aa",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  // Modal base
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    width: "100%",
    maxHeight: "90%",
  },
  modalContentScroll: { paddingVertical: 10, alignItems: "center" }, // Para ScrollViews dentro de modais

  confirmModalContent: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: {
    color: Colors.gold,
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },

  // Categorias de itens
  categoriaContainer: { marginBottom: 16 },
  categoriaTitulo: {
    color: Colors.acafrao,
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    textTransform: "capitalize",
  },

  // Itens
  itemContainer: {
    backgroundColor: Colors.gold,
    padding: 10,
    borderRadius: 8,
    marginBottom: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemText: { color: Colors.black, fontWeight: "bold", fontSize: 15 },
  itemPrice: { color: Colors.black, fontWeight: "600" },

  // Controle de quantidade
  quantityControl: { flexDirection: "row", alignItems: "center" },
  qtyButton: {
    backgroundColor: Colors.acafrao,
    padding: 6,
    borderRadius: 6,
    marginHorizontal: 6,
  },
  qtyButtonText: { color: Colors.white, fontWeight: "bold", fontSize: 18 },
  quantityText: { color: Colors.black, fontWeight: "bold", fontSize: 16 },

  // Botões gerais
  closeButton: {
    marginTop: 16,
    backgroundColor: Colors.acafrao,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  closeButtonText: { color: Colors.white, fontWeight: "bold", fontSize: 16 },
  deleteButton: { padding: 5, marginLeft: 10 },
  smallBtn: {
    backgroundColor: Colors.acafrao,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },

  // Modal divisão de conta
  optionButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginHorizontal: 4,
  },
  optionButtonActive: {
    backgroundColor: Colors.gold,
    borderColor: Colors.gold,
  },
});
