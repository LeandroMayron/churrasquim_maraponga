import Colors from "@/constants/Colors";
import { useLocalSearchParams } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Modal,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../../lib/supabase";
import { BLEPrinter } from "@xyzsola/react-native-thermal-printer";

export default function Mesa() {
  const { id } = useLocalSearchParams();
  const [modalVisible, setModalVisible] = useState(false);
  const [menuData, setMenuData] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [pedidoEnviado, setPedidoEnviado] = useState([]);
  const [mesaFechada, setMesaFechada] = useState(false);
  const [formaPagamento, setFormaPagamento] = useState(null);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [dadosParaImpressao, setDadosParaImpressao] = useState([]);
  const [modalImpressaoVisivel, setModalImpressaoVisivel] = useState(false);

  // 🔹 Carregar pedidos + realtime
  useEffect(() => {
    const carregarPedidos = async () => {
      const { data, error } = await supabase
        .from("pedidos")
        .select("*")
        .eq("mesa_id", id)
        .eq("status", "aberto");

      if (!error && data.length > 0) {
        setPedidoEnviado(data[0].itens);
        setMesaFechada(false);
      } else {
        setPedidoEnviado([]);
      }
    };

    carregarPedidos();

    // 🔹 Listener realtime
    const channel = supabase
      .channel("pedidos-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "pedidos",
          filter: `mesa_id=eq.${id}`,
        },
        (payload) => {
          console.log("📡 Realtime payload:", payload);

          if (payload.new?.status === "aberto") {
            setPedidoEnviado(payload.new.itens || []);
            setMesaFechada(false);
          }

          if (payload.new?.status === "fechado") {
            setMesaFechada(true);
            setPedidoEnviado([]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  // 🔹 Abrir modal e carregar menu
  const abrirModal = async () => {
    setLoading(true);
    setModalVisible(true);
    try {
      const response = await fetch(
        "https://6644-fontend.github.io/menu-churrasquinho-maraponga/menu.json"
      );
      const data = await response.json();
      setMenuData(data);
    } catch (error) {
      console.error("Erro ao buscar itens:", error);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Alterar quantidade de itens selecionados
  const toggleItemQuantity = (item, delta) => {
    setSelectedItems((prev) => {
      const exists = prev.find((i) => i.name === item.name);
      if (exists) {
        const newQuantity = exists.quantity + delta;
        if (newQuantity <= 0) {
          return prev.filter((i) => i.name !== item.name);
        } else {
          return prev.map((i) =>
            i.name === item.name ? { ...i, quantity: newQuantity } : i
          );
        }
      } else if (delta > 0) {
        return [...prev, { ...item, quantity: delta }];
      }
      return prev;
    });
  };

  // 🔹 Pegar quantidade de um item
  const getItemQuantity = (item) => {
    const found = selectedItems.find((i) => i.name === item.name);
    return found ? found.quantity : 0;
  };

  // 🔹 Calcular total do pedido
  const calcularTotal = (lista = pedidoEnviado) => {
    return lista.reduce((total, item) => total + item.quantity * item.price, 0);
  };

  // 🔹 Enviar pedido para Supabase
  // 🔹 Enviar pedido para Supabase (corrigido)
  const enviarPedido = async () => {
    const novoPedido = [...pedidoEnviado];

    // Adiciona ou atualiza os itens selecionados
    selectedItems.forEach((novoItem) => {
      const existente = novoPedido.find((p) => p.name === novoItem.name);
      if (existente) {
        existente.quantity += novoItem.quantity;
      } else {
        novoPedido.push({ ...novoItem });
      }
    });

    if (novoPedido.length === 0) {
      alert("Selecione pelo menos um item para enviar!");
      return;
    }

    setPedidoEnviado(novoPedido);
    setSelectedItems([]);
    setModalVisible(false);

    try {
      // 🔍 Verifica se já existe um pedido ABERTO para essa mesa
      const { data: pedidosExistentes, error: fetchError } = await supabase
        .from("pedidos")
        .select("id")
        .eq("mesa_id", id)
        .eq("status", "aberto")
        .limit(1)
        .maybeSingle();

      // Cria objeto do pedido para enviar
      const pedidoParaEnviar = {
        mesa_id: id,
        itens: novoPedido,
        status: "aberto",
        total: calcularTotal(novoPedido),
      };

      // Se já existe um pedido aberto, adiciona o ID para atualizar
      if (pedidosExistentes) {
        pedidoParaEnviar.id = pedidosExistentes.id;
      }

      // Envia o pedido (upsert com id se existir)
      const { error: upsertError } = await supabase
        .from("pedidos")
        .upsert(pedidoParaEnviar);

      if (!upsertError) {
        setMesaFechada(false);
      } else {
        console.error("Erro ao salvar pedido:", upsertError);
        alert("Erro ao enviar o pedido. Tente novamente.");
      }
    } catch (err) {
      console.error("Erro inesperado ao enviar pedido:", err);
      alert("Erro inesperado. Tente novamente.");
    }
  };

  // 🔹 Fechar mesa
  const fecharMesa = async () => {
    if (!formaPagamento) {
      alert("Selecione a forma de pagamento antes de fechar a mesa.");
      return;
    }

    try {
      console.log("🔒 Tentando fechar a mesa...");

      const { data: pedidoAberto, error: fetchError } = await supabase
        .from("pedidos")
        .select("id, itens")
        .eq("mesa_id", id)
        .eq("status", "aberto")
        .limit(1)
        .maybeSingle();

      if (fetchError || !pedidoAberto) {
        alert("Nenhum pedido aberto encontrado para esta mesa.");
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

        setDadosParaImpressao(pedidoAberto.itens);
        setModalImpressaoVisivel(true); // <-- ABRE O MODAL DE IMPRESSÃO
        setMesaFechada(true);
        setPedidoEnviado([]);
      } else {
        console.error("Erro ao fechar mesa:", error);
        alert("Erro ao fechar a mesa. Tente novamente.");
      }
    } catch (err) {
      console.error("Erro inesperado ao fechar a mesa:", err);
      alert("Erro inesperado. Tente novamente.");
    }
  };

  const imprimirReciboBluetooth = async () => {
    try {
      const isEnabled = await BluetoothManager.isBluetoothEnabled();
      if (!isEnabled) {
        alert("Bluetooth está desligado. Ative para imprimir.");
        return;
      }

      const paired = await BluetoothManager.enableBluetooth();
      const firstPrinter = paired?.[0];

      if (!firstPrinter) {
        alert("Nenhuma impressora Bluetooth pareada encontrada.");
        return;
      }

      await BluetoothManager.connect(firstPrinter.address);

      // Nome da empresa - centralizado, negrito, tamanho grande
      await BluetoothEscposPrinter.printText("CHURRASQUINHO MARAPONGA\n", {
        encoding: "GBK",
        codepage: 0,
        widthtimes: 3,
        heigthtimes: 3,
        fonttype: 1,
        align: BluetoothEscposPrinter.ALIGN.CENTER,
      });

      // CNPJ e endereço - centralizado, tamanho normal
      await BluetoothEscposPrinter.printText("CNPJ: 12.345.678/0001-99\n", {
        align: BluetoothEscposPrinter.ALIGN.CENTER,
      });
      await BluetoothEscposPrinter.printText(
        "Rua do Churrasco, 123 - Fortaleza\n\n",
        {
          align: BluetoothEscposPrinter.ALIGN.CENTER,
        }
      );

      // Data e hora - alinhado à esquerda
      const agora = new Date();
      await BluetoothEscposPrinter.printText(
        `Data/Hora: ${agora.toLocaleString()}\n`,
        {
          align: BluetoothEscposPrinter.ALIGN.LEFT,
        }
      );

      await BluetoothEscposPrinter.printText(
        "--------------------------------\n",
        {}
      );

      // Itens do pedido - alinhado à esquerda
      for (const item of pedidoEnviado) {
        const linha = `${item.quantity}x ${item.name} - R$ ${(
          item.quantity * item.price
        ).toFixed(2)}\n`;
        await BluetoothEscposPrinter.printText(linha, {
          align: BluetoothEscposPrinter.ALIGN.LEFT,
        });
      }

      await BluetoothEscposPrinter.printText(
        "--------------------------------\n",
        {}
      );

      // Total - negrito, tamanho maior, alinhado à esquerda
      await BluetoothEscposPrinter.printText(
        `Total: R$ ${calcularTotal().toFixed(2)}\n`,
        {
          widthtimes: 2,
          heigthtimes: 2,
          fonttype: 1,
          align: BluetoothEscposPrinter.ALIGN.LEFT,
        }
      );

      // Forma de pagamento - alinhado à esquerda
      await BluetoothEscposPrinter.printText(
        `Pagamento: ${formaPagamento?.toUpperCase()}\n\n`,
        {
          align: BluetoothEscposPrinter.ALIGN.LEFT,
        }
      );

      // Mensagem de agradecimento - centralizado
      await BluetoothEscposPrinter.printText(
        "Obrigado pela preferência!\n\n\n",
        {
          align: BluetoothEscposPrinter.ALIGN.CENTER,
        }
      );

      // Alimentar papel
      await BluetoothEscposPrinter.printText("\n\n\n", {});
    } catch (error) {
      console.error("Erro ao imprimir:", error);
      alert("Erro ao imprimir recibo.");
    }
  };

  const printCupom = async () => {
    try {
      await BLEPrinter.init();
      const devices = await BLEPrinter.getDeviceList();
      if (!devices.length) {
        alert("Nenhuma impressora Bluetooth encontrada!");
        return;
      }
      await BLEPrinter.connectPrinter(devices[0].innerMacAddress);

      const linhas = dadosParaImpressao
        .map(
          (item) =>
            `${item.quantity}x ${item.name} — R$ ${(
              item.quantity * item.price
            ).toFixed(2)}`
        )
        .join("\n");

      const total = calcularTotal(dadosParaImpressao).toFixed(2);

      const payload = `
        <Text align="center" bold="1" fontWidth="2" fontHeight="2">CHURRASQUINHO MARAPONGA</Text>
        <NewLine /><Line lineChar="-" />
        <Text align="left">Mesa ${id}</Text><NewLine />
        ${linhas}
        <Line lineChar="-" />
        <Text align="right" bold="1">Total: R$ ${total}</Text>
        <NewLine />
        <Text align="left">Pagamento: ${formaPagamento?.toUpperCase()}</Text>
        <NewLine />
        <Text align="center">Obrigado pela preferência!</Text>
        <NewLine /><NewLine />
        `;

      await BLEPrinter.print(payload, {
        beep: true,
        cut: true,
        tailingLine: true,
      });
    } catch (err) {
      console.error("Erro ao imprimir:", err);
      alert("Falha ao imprimir no Bluetooth.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mesa {id}</Text>
      {!mesaFechada && (
        <TouchableOpacity style={styles.button} onPress={abrirModal}>
          <Text style={styles.buttonText}>Fazer Pedido</Text>
        </TouchableOpacity>
      )}
      {/* Lista de pedidos enviados */}
      <View style={styles.pedidoContainer}>
        <Text style={styles.pedidoTitulo}>Pedidos Feitos</Text>
        {pedidoEnviado.length === 0 ? (
          <Text style={styles.emptyText}>
            {mesaFechada ? "Mesa já fechada." : "Nenhum pedido ainda."}
          </Text>
        ) : (
          <>
            {pedidoEnviado.map((item, index) => (
              <Text key={index} style={styles.pedidoItem}>
                {item.quantity}x {item.name} — R${" "}
                {(item.quantity * item.price).toFixed(2)}
              </Text>
            ))}

            <View style={styles.totalContainer}>
              <Text style={styles.totalText}>Total a Pagar:</Text>
              <Text style={styles.totalValue}>
                R$ {calcularTotal().toFixed(2)}
              </Text>
            </View>

            {!mesaFechada && (
              <View style={{ marginTop: 20, alignItems: "center" }}>
                <Text style={{ color: Colors.gold, marginBottom: 10 }}>
                  Selecione a forma de pagamento:
                </Text>
                <View style={{ flexDirection: "row", gap: 10 }}>
                  <TouchableOpacity
                    style={[
                      styles.closeButton,
                      {
                        backgroundColor:
                          formaPagamento === "dinheiro"
                            ? Colors.gold
                            : Colors.acafrao,
                      },
                    ]}
                    onPress={() => setFormaPagamento("dinheiro")}
                  >
                    <Text style={styles.closeButtonText}>Dinheiro</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.closeButton,
                      {
                        backgroundColor:
                          formaPagamento === "cartao"
                            ? Colors.gold
                            : Colors.acafrao,
                      },
                    ]}
                    onPress={() => setFormaPagamento("cartão")}
                  >
                    <Text style={styles.closeButtonText}>Cartão</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.closeButton,
                      {
                        backgroundColor:
                          formaPagamento === "pix"
                            ? Colors.gold
                            : Colors.acafrao,
                      },
                    ]}
                    onPress={() => setFormaPagamento("pix")}
                  >
                    <Text style={styles.closeButtonText}>PIX</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={[
                    styles.closeButton,
                    { backgroundColor: Colors.gold, marginTop: 12 },
                  ]}
                  onPress={() => {
                    if (!formaPagamento) {
                      alert(
                        "Selecione a forma de pagamento antes de fechar a mesa."
                      );
                    } else {
                      setConfirmModalVisible(true);
                    }
                  }}
                >
                  <Text
                    style={[styles.closeButtonText, { color: Colors.black }]}
                  >
                    Fechar Mesa
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons
            name="arrow-back"
            size={24}
            color={Colors.gold}
            style={{ alignSelf: "center", marginTop: 8 }}
          />
        </Pressable>
      </View>
      {/* Modal de confirmação para fechar a mesa */}
      <Modal
        visible={confirmModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setConfirmModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModalContent}>
            <Text
              style={{ fontSize: 18, fontWeight: "bold", marginBottom: 12 }}
            >
              Deseja realmente fechar a mesa?
            </Text>
            <Text style={{ marginBottom: 20 }}>
              Isso encerrará os pedidos e enviará o cupom para impressão.
            </Text>
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: Colors.gold }]}
              onPress={async () => {
                console.log("🟡 Confirmar Fechamento pressionado");
                setConfirmModalVisible(false);
                await fecharMesa();
              }}
            >
              <Text style={[styles.closeButtonText, { color: Colors.black }]}>
                Confirmar Fechamento
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.closeButton, { marginTop: 10 }]}
              onPress={() => setConfirmModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      <Modal
        visible={modalImpressaoVisivel}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setModalImpressaoVisivel(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModalContent}>
            {/* ... (conteúdo existente) ... */}

            <TouchableOpacity
              style={[
                styles.closeButton,
                { backgroundColor: Colors.acafrao, marginTop: 20 },
              ]}
              onPress={printCupom}
            >
              <Text style={styles.closeButtonText}>Imprimir Recibo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.closeButton,
                { backgroundColor: Colors.gold, marginTop: 10 },
              ]}
              onPress={() => setModalImpressaoVisivel(false)}
            >
              <Text style={[styles.closeButtonText, { color: Colors.black }]}>
                Fechar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* Modal de Itens */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecione os Itens</Text>

            {loading ? (
              <ActivityIndicator size="large" color={Colors.gold} />
            ) : (
              <ScrollView style={{ maxHeight: "75%" }}>
                {Object.entries(menuData).map(([categoria, itens]) => (
                  <View key={categoria} style={styles.categoriaContainer}>
                    <Text style={styles.categoriaTitulo}>{categoria}</Text>
                    {Array.isArray(itens) &&
                      itens.map((item, index) => {
                        const quantity = getItemQuantity(item);
                        return (
                          <View key={index} style={styles.itemContainer}>
                            <View style={{ flex: 1 }}>
                              <Text style={styles.itemText}>{item.name}</Text>
                              <Text style={styles.itemPrice}>
                                R$ {item.price.toFixed(2)}
                              </Text>
                            </View>
                            <View style={styles.quantityControl}>
                              <TouchableOpacity
                                style={styles.qtyButton}
                                onPress={() => toggleItemQuantity(item, -1)}
                              >
                                <Text style={styles.qtyButtonText}>-</Text>
                              </TouchableOpacity>
                              <Text style={styles.quantityText}>
                                {quantity}
                              </Text>
                              <TouchableOpacity
                                style={styles.qtyButton}
                                onPress={() => toggleItemQuantity(item, 1)}
                              >
                                <Text style={styles.qtyButtonText}>+</Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        );
                      })}
                  </View>
                ))}
              </ScrollView>
            )}

            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: Colors.gold }]}
              onPress={enviarPedido}
            >
              <Text style={[styles.closeButtonText, { color: Colors.black }]}>
                Enviar Pedido
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// 🔹 Styles
const styles = StyleSheet.create({
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
  button: {
    backgroundColor: Colors.acafrao,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
    elevation: 3,
  },
  buttonText: { color: Colors.white, fontWeight: "bold", fontSize: 16 },
  pedidoContainer: { marginTop: 30, width: "90%", alignItems: "center" },
  pedidoTitulo: {
    color: Colors.gold,
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  pedidoItem: { color: Colors.white, fontSize: 16, marginVertical: 2 },
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "#000000aa",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    width: "100%",
    maxHeight: "90%",
  },
  modalTitle: {
    color: Colors.gold,
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  categoriaContainer: { marginBottom: 16 },
  categoriaTitulo: {
    color: Colors.acafrao,
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    textTransform: "capitalize",
  },
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
  quantityControl: { flexDirection: "row", alignItems: "center" },
  qtyButton: {
    backgroundColor: Colors.acafrao,
    padding: 6,
    borderRadius: 6,
    marginHorizontal: 6,
  },
  qtyButtonText: { color: Colors.white, fontWeight: "bold", fontSize: 18 },
  quantityText: { color: Colors.black, fontWeight: "bold", fontSize: 16 },
  closeButton: {
    marginTop: 16,
    backgroundColor: Colors.acafrao,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  closeButtonText: { color: Colors.white, fontWeight: "bold", fontSize: 16 },
  confirmModalContent: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    width: "80%",
    alignItems: "center",
  },
});
