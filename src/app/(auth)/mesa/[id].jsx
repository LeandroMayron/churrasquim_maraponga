import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BLEPrinter } from "@xyzsola/react-native-thermal-printer";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  PermissionsAndroid,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../../lib/supabase";

async function solicitarPermissoesBluetooth() {
  if (Platform.OS === "android") {
    const permissoes = [];

    if (Platform.Version >= 31) {
      permissoes.push(
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN
      );
    } else {
      // Android 10/11 (API 29/30)
      permissoes.push(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
    }

    const granted = await PermissionsAndroid.requestMultiple(permissoes);

    const todasOk = Object.values(granted).every(
      (status) => status === PermissionsAndroid.RESULTS.GRANTED
    );

    if (!todasOk) {
      alert("Permissões de Bluetooth negadas. Não é possível imprimir.");
      return false;
    }
  }

  return true;
}

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
  const [printers, setPrinters] = useState([]);
  const [printerModalVisible, setPrinterModalVisible] = useState(false);
  const [isSearchingPrinters, setIsSearchingPrinters] = useState(false);

  const buscarImpressoras = async () => {
    setIsSearchingPrinters(true);
    try {
      await solicitarPermissoesBluetooth();
      await BLEPrinter.init();
      const devices = await BLEPrinter.getDeviceList();

      if (!devices.length) {
        alert(
          "Nenhuma impressora encontrada! Verifique se o Bluetooth está ligado e a impressora pareada."
        );
        return;
      }

      setPrinters(devices);
      setPrinterModalVisible(true); // Abre o modal com a lista
    } catch (err) {
      console.error("Erro ao buscar impressoras:", err);
      alert("Erro ao buscar impressoras: " + err.message);
    } finally {
      setIsSearchingPrinters(false);
    }
  };

  const selecionarImpressora = async (impressora) => {
    try {
      await AsyncStorage.setItem("printer_mac", impressora.innerMacAddress);
      alert(`✅ Impressora ${impressora.deviceName} salva!`);
      setPrinterModalVisible(false); // Fecha o modal de seleção
    } catch (err) {
      console.error("Erro ao salvar impressora:", err);
      alert("Erro ao salvar impressora: " + err.message);
    }
  };

  const delay = (ms) => new Promise((res) => setTimeout(res, ms));

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

  // 🔹 Remover item do pedido
  const removerItemDoPedido = async (itemParaRemover) => {
    const novosItens = pedidoEnviado.filter(
      (item) => item.name !== itemParaRemover.name
    );

    try {
      const { data: pedidoAberto, error: fetchError } = await supabase
        .from("pedidos")
        .select("id")
        .eq("mesa_id", id)
        .eq("status", "aberto")
        .limit(1)
        .maybeSingle();

      if (fetchError || !pedidoAberto) {
        alert("Não foi possível encontrar o pedido aberto para atualizar.");
        return;
      }

      // Se a lista de itens ficar vazia, fecha a mesa. Senão, atualiza.
      if (novosItens.length === 0) {
        await supabase
          .from("pedidos")
          .update({ status: "fechado", itens: [] })
          .eq("id", pedidoAberto.id);
        setPedidoEnviado([]);
        setMesaFechada(true);
      } else {
        await supabase
          .from("pedidos")
          .update({ itens: novosItens, total: calcularTotal(novosItens) })
          .eq("id", pedidoAberto.id);
        setPedidoEnviado(novosItens);
      }

      alert(`Item "${itemParaRemover.name}" removido com sucesso!`);
    } catch (err) {
      console.error("Erro ao remover item:", err);
      alert("Erro ao remover o item. Tente novamente.");
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

  const printCupom = async () => {
    let printerConnection = null;
    try {
      console.log("🖨️ Iniciando impressão do recibo...");

      await BLEPrinter.init();

      const mac = await AsyncStorage.getItem("printer_mac");
      if (!mac) {
        alert("Nenhuma impressora configurada! Configure antes de imprimir.");
        return;
      }

      // Conecta à impressora
      printerConnection = await BLEPrinter.connectPrinter(mac);
      if (!printerConnection) {
        throw new Error("Não foi possível conectar à impressora.");
      }
      console.log("✅ Conectado na impressora:", mac);

      // Monta as linhas do pedido
      const linhas = dadosParaImpressao
        .map(
          (item) =>
            `<Text align='left'>${item.quantity}x ${item.name}|R$ ${(
              item.quantity * item.price
            ).toFixed(2)}</Text><NewLine />`
        )
        .join("");

      const total = calcularTotal(dadosParaImpressao).toFixed(2);

      const payload = `
        <Printout>
          <Text align='center' bold='1' fontWidth='2' fontHeight='2'>CHURRASQUINHO</Text>
          <NewLine />
          <Text align='center' bold='1' fontWidth='2' fontHeight='2'>MARAPONGA</Text>
          <NewLine />
          <Line lineChar='-' />
          <Text align='left'>Mesa ${id}</Text>
          <NewLine />
          ${linhas}
          <Line lineChar='-' />
          <Text align='right' bold='1'>TOTAL: R$ ${total}</Text>
          <NewLine />
          <Text align='center'>Obrigado pela preferencia!</Text>
          <NewLine /><NewLine />
        </Printout>
      `;

      await BLEPrinter.print(payload);

      console.log("🟢 Recibo enviado para impressão!");
    } catch (err) {
      console.error("❌ Erro ao imprimir recibo:", err);
      alert("Falha ao imprimir: " + err.message);
    } finally {
      if (printerConnection) {
        await delay(500); // Pequena pausa para garantir que a impressão foi enviada
        BLEPrinter.closeConn()
          .then(() => console.log("🔌 Impressora desconectada."))
          .catch((e) => console.error("Erro ao desconectar:", e));
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
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
              <View key={index} style={styles.pedidoItemContainer}>
                <Text style={styles.pedidoItem}>
                  {item.quantity}x {item.name} — R${" "}
                  {(item.quantity * item.price).toFixed(2)}
                </Text>
                {!mesaFechada && (
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => removerItemDoPedido(item)}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={20}
                      color={Colors.gold}
                    />
                  </TouchableOpacity>
                )}
              </View>
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
                    onPress={() => setFormaPagamento("cartao")}
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
            <Text
              style={{ fontSize: 20, fontWeight: "bold", marginBottom: 12 }}
            >
              Recibo da Mesa {id}
            </Text>

            <ScrollView style={{ maxHeight: 200, marginBottom: 12 }}>
              {dadosParaImpressao.map((item, index) => (
                <Text key={index} style={{ fontSize: 16 }}>
                  {item.quantity}x {item.name} — R${" "}
                  {(item.quantity * item.price).toFixed(2)}
                </Text>
              ))}
            </ScrollView>

            <Text
              style={{ fontSize: 18, fontWeight: "bold", marginBottom: 20 }}
            >
              Total: R$ {calcularTotal(dadosParaImpressao).toFixed(2)}
            </Text>

            <TouchableOpacity
              style={[
                styles.closeButton,
                { backgroundColor: Colors.gold, marginTop: 10 },
              ]}
              onPress={printCupom}
            >
              <Text style={styles.closeButtonText}>Impressão</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.closeButton,
                { backgroundColor: Colors.acafrao, marginTop: 10 },
              ]}
              onPress={buscarImpressoras}
              disabled={isSearchingPrinters}
            >
              {isSearchingPrinters ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.closeButtonText}>
                  Configurar Impressora
                </Text>
              )}
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

      {/* Modal de Seleção de Impressora */}
      <Modal
        visible={printerModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setPrinterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecione uma Impressora</Text>
            <ScrollView style={{ maxHeight: 300 }}>
              {printers.map((printer, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.itemContainer}
                  onPress={() => selecionarImpressora(printer)}
                >
                  <Text style={styles.itemText}>
                    <Ionicons name="print" size={18} /> {printer.deviceName}
                  </Text>
                  <Text style={styles.itemPrice}>
                    {printer.innerMacAddress}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={[
                styles.closeButton,
                { backgroundColor: Colors.acafrao, marginTop: 10 },
              ]}
              onPress={() => setPrinterModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Cancelar</Text>
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
    </SafeAreaView>
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
  deleteButton: {
    padding: 5,
    marginLeft: 10,
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
