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
  TextInput,
  TouchableOpacity,
  View,
  Alert,
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

  // Modos: 'mesa' | 'por_pessoa'
  const [modoMesa, setModoMesa] = useState(null); // null => ainda não escolhido

  // UI e states gerais
  const [modalVisible, setModalVisible] = useState(false);
  const [menuData, setMenuData] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [pedidoEnviado, setPedidoEnviado] = useState([]); // quando modo 'mesa' mostra o pedido geral
  const [mesaFechada, setMesaFechada] = useState(false);
  const [formaPagamento, setFormaPagamento] = useState(null);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [dadosParaImpressao, setDadosParaImpressao] = useState([]);
  const [modalImpressaoVisivel, setModalImpressaoVisivel] = useState(false);
  const [printers, setPrinters] = useState([]);
  const [printerModalVisible, setPrinterModalVisible] = useState(false);
  const [isSearchingPrinters, setIsSearchingPrinters] = useState(false);

  // Novos estados para divisão / pessoas
  const [modalEscolhaFechamento, setModalEscolhaFechamento] = useState(false);
  const [modalDividirConta, setModalDividirConta] = useState(false);
  const [modoDivisao, setModoDivisao] = useState("consumo");
  const [numPessoas, setNumPessoas] = useState(2);
  const [itemOwners, setItemOwners] = useState([]);

  // NOVO: gerenciar pessoas da mesa
  const [pessoas, setPessoas] = useState([]); // lista de pessoas_mesa
  const [novoNomePessoa, setNovoNomePessoa] = useState("");
  const [selectedPersonId, setSelectedPersonId] = useState(null); // pessoa atualmente selecionada para pedir
  const [pedidosPorPessoa, setPedidosPorPessoa] = useState({}); // map pessoaId -> itens[]
  const [isLoadingPessoas, setIsLoadingPessoas] = useState(false);

  const delay = (ms) => new Promise((res) => setTimeout(res, ms));
  // 🔹 Carregar pedidos + realtime (agora busca todos os pedidos da mesa)
  useEffect(() => {
    const carregarPedidos = async () => {
      try {
        // busca pedidos abertos da mesa (tanto gerais quanto por pessoa)
        const { data, error } = await supabase
          .from("pedidos")
          .select("*")
          .eq("mesa_id", id)
          .in("status", ["aberto"]);
        // .order("created_at", { ascending: true }); // optional

        if (!error) {
          // monta pedidoEnviado (agregado para modo 'mesa')
          // se existir pedido com pessoa_id = null, esse é o pedido geral
          const pedidos = data || [];
          const geral = pedidos.find((p) => !p.pessoa_id);
          if (geral) {
            setPedidoEnviado(geral.itens || []);
            setMesaFechada(false);
          } else {
            setPedidoEnviado([]);
          }

          // popula pedidosPorPessoa para cada pessoaId presente
          const map = {};
          for (const p of pedidos) {
            if (p.pessoa_id) {
              map[p.pessoa_id] = p.itens || [];
            }
          }
          setPedidosPorPessoa(map);
        } else {
          console.error("Erro ao buscar pedidos:", error);
        }
      } catch (err) {
        console.error("Erro inesperado ao buscar pedidos:", err);
      }
    };

    carregarPedidos();

    // realtime: escuta alterações na tabela pedidos para essa mesa
    const channel = supabase
      .channel("pedidos-realtime-mesa")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "pedidos",
          filter: `mesa_id=eq.${id}`,
        },
        (payload) => {
          // Quando algo mudar, recarrega os pedidos
          console.log("Realtime pedidos payload:", payload);
          // Recarrega (simples): chamar a função carregarPedidos novamente
          // Como estamos em useEffect não podemos chamar a função local diretamente (a não ser que a definamos fora).
          // Simples: fazer um fetch direto aqui:
          (async () => {
            const { data, error } = await supabase
              .from("pedidos")
              .select("*")
              .eq("mesa_id", id)
              .in("status", ["aberto"]);

            if (!error) {
              const geral = data.find((p) => !p.pessoa_id);
              if (geral) setPedidoEnviado(geral.itens || []);
              else setPedidoEnviado([]);

              const map = {};
              for (const p of data) {
                if (p.pessoa_id) map[p.pessoa_id] = p.itens || [];
              }
              setPedidosPorPessoa(map);
            } else {
              console.error("Realtime fetch error:", error);
            }
          })();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  // 🔹 Carregar pessoas da mesa
  const carregarPessoas = async () => {
    setIsLoadingPessoas(true);
    try {
      const { data, error } = await supabase
        .from("pessoas_mesa")
        .select("*")
        .eq("mesa_id", id)
        .order("created_at", { ascending: true });

      if (!error) {
        setPessoas(data || []);
      } else {
        console.error("Erro ao carregar pessoas:", error);
      }
    } catch (err) {
      console.error("Erro inesperado ao carregar pessoas:", err);
    } finally {
      setIsLoadingPessoas(false);
    }
  };

  useEffect(() => {
    if (modoMesa === "por_pessoa") {
      carregarPessoas();
    }
  }, [modoMesa, id]);

  // Funções de impressora (mantidas)
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
      setPrinterModalVisible(true);
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
      setPrinterModalVisible(false);
    } catch (err) {
      console.error("Erro ao salvar impressora:", err);
      alert("Erro ao salvar impressora: " + err.message);
    }
  };
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

  const getItemQuantity = (item) => {
    const found = selectedItems.find((i) => i.name === item.name);
    return found ? found.quantity : 0;
  };

  const calcularTotal = (lista = []) => {
    return lista.reduce((total, item) => total + item.quantity * item.price, 0);
  };

  // 🔹 Enviar pedido para Supabase (mantendo comportamento antigo e adicionando pedido por pessoa)
  const enviarPedido = async () => {
    if (selectedItems.length === 0) {
      alert("Selecione pelo menos um item para enviar!");
      return;
    }

    setModalVisible(false);

    try {
      if (modoMesa === "por_pessoa") {
        // precisa ter uma pessoa selecionada
        if (!selectedPersonId) {
          alert("Selecione a pessoa que está pedindo (no painel de pessoas).");
          return;
        }

        // verifica se já existe um pedido ABERTO para essa mesa e pessoa
        const { data: existing, error: fetchError } = await supabase
          .from("pedidos")
          .select("*")
          .eq("mesa_id", id)
          .eq("pessoa_id", selectedPersonId)
          .eq("status", "aberto")
          .limit(1)
          .maybeSingle();

        let novosItens = [];
        if (existing) {
          // mescla itens (soma quantidades por nome)
          const current = existing.itens || [];
          const merged = [...current];
          selectedItems.forEach((it) => {
            const ex = merged.find((m) => m.name === it.name);
            if (ex) ex.quantity += it.quantity;
            else merged.push({ ...it });
          });
          novosItens = merged;
          // atualiza
          const { error: updErr } = await supabase
            .from("pedidos")
            .update({ itens: novosItens, total: calcularTotal(novosItens) })
            .eq("id", existing.id);

          if (updErr) throw updErr;
        } else {
          // cria novo pedido para essa pessoa
          novosItens = [...selectedItems];
          const pedidoObj = {
            mesa_id: id,
            pessoa_id: selectedPersonId,
            itens: novosItens,
            status: "aberto",
            total: calcularTotal(novosItens),
          };
          const { error: insErr } = await supabase
            .from("pedidos")
            .insert(pedidoObj);
          if (insErr) throw insErr;
        }

        // atualiza o estado local de pedidosPorPessoa
        setPedidosPorPessoa((prev) => ({
          ...prev,
          [selectedPersonId]: (prev[selectedPersonId] || []).concat(
            selectedItems
          ),
        }));
        setSelectedItems([]);
        Alert.alert("Pedido enviado", "Pedido atribuído à pessoa selecionada.");
      } else {
        // modo mesa (atual)
        // pega pedido aberto geral
        const { data: pedidosExistentes, error: fetchError } = await supabase
          .from("pedidos")
          .select("*")
          .eq("mesa_id", id)
          .eq("pessoa_id", null)
          .eq("status", "aberto")
          .limit(1)
          .maybeSingle();

        let novoPedido = [];
        if (pedidosExistentes) {
          const atual = pedidosExistentes.itens || [];
          const merged = [...atual];
          selectedItems.forEach((it) => {
            const ex = merged.find((m) => m.name === it.name);
            if (ex) ex.quantity += it.quantity;
            else merged.push({ ...it });
          });
          novoPedido = merged;
          const { error: updErr } = await supabase
            .from("pedidos")
            .update({ itens: novoPedido, total: calcularTotal(novoPedido) })
            .eq("id", pedidosExistentes.id);

          if (updErr) throw updErr;
        } else {
          novoPedido = [...selectedItems];
          const pedidoObj = {
            mesa_id: id,
            itens: novoPedido,
            status: "aberto",
            total: calcularTotal(novoPedido),
          };
          const { error: insErr } = await supabase
            .from("pedidos")
            .insert(pedidoObj);
          if (insErr) throw insErr;
        }

        setPedidoEnviado(novoPedido);
        setSelectedItems([]);
        Alert.alert("Pedido enviado", "Pedido enviado para a cozinha (mesa).");
      }
    } catch (err) {
      console.error("Erro ao enviar pedido:", err);
      alert("Erro ao enviar pedido: " + err.message);
    }
  };

  // 🔹 Remover item do pedido (aplica ao contexto: mesa geral ou item da pessoa)
  const removerItemDoPedido = async (itemParaRemover, pessoaId = null) => {
    try {
      const { data: pedidoAberto, error: fetchError } = await supabase
        .from("pedidos")
        .select("*")
        .eq("mesa_id", id)
        .eq("pessoa_id", pessoaId)
        .eq("status", "aberto")
        .limit(1)
        .maybeSingle();

      if (fetchError || !pedidoAberto) {
        alert("Não foi possível encontrar o pedido aberto para atualizar.");
        return;
      }

      const novosItens = (pedidoAberto.itens || []).filter(
        (it) => it.name !== itemParaRemover.name
      );

      if (novosItens.length === 0) {
        // fecha o pedido (não a mesa inteira)
        await supabase
          .from("pedidos")
          .update({ status: "fechado", itens: [] })
          .eq("id", pedidoAberto.id);

        if (pessoaId) {
          setPedidosPorPessoa((prev) => ({ ...prev, [pessoaId]: [] }));
        } else {
          setPedidoEnviado([]);
          setMesaFechada(true);
        }
      } else {
        await supabase
          .from("pedidos")
          .update({ itens: novosItens, total: calcularTotal(novosItens) })
          .eq("id", pedidoAberto.id);

        if (pessoaId) {
          setPedidosPorPessoa((prev) => ({ ...prev, [pessoaId]: novosItens }));
        } else {
          setPedidoEnviado(novosItens);
        }
      }

      alert(`Item "${itemParaRemover.name}" removido com sucesso!`);
    } catch (err) {
      console.error("Erro ao remover item:", err);
      alert("Erro ao remover o item. Tente novamente.");
    }
  };

  // ✨ Função para remover acentos
  const removerAcentos = (texto) => {
    if (!texto) return "";
    return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  };

  // 🔹 Gera o código PIX estático do PIX (reaproveitei sua função)
  const gerarCodigoPix = (
    chavePix,
    nome,
    cidade,
    valor,
    txid = "MESA" + id
  ) => {
    const format = (idf, value) =>
      `${idf}${String(value.length).padStart(2, "0")}${value}`;

    const valorCentavos = Number(valor).toFixed(2);
    const merchantAccount =
      format("00", "BR.GOV.BCB.PIX") + format("01", chavePix);

    const additionalData = format("05", txid);

    const payload =
      "000201" +
      format("26", merchantAccount) +
      format("52", "0000") +
      format("53", "986") +
      format("54", valorCentavos) +
      format("58", "BR") +
      format("59", nome) +
      format("60", cidade) +
      format("62", additionalData) +
      "6304";

    // CRC16
    const polinomio = 0x1021;
    let resultado = 0xffff;

    for (let i = 0; i < payload.length; i++) {
      resultado ^= payload.charCodeAt(i) << 8;
      for (let j = 0; j < 8; j++) {
        resultado =
          resultado & 0x8000 ? (resultado << 1) ^ polinomio : resultado << 1;
        resultado &= 0xffff;
      }
    }

    const crc = resultado.toString(16).toUpperCase().padStart(4, "0");
    return payload + crc;
  };

  const gerarQrBase64 = async (codigoPix) => {
    const QRCode = require("qrcode");
    return await QRCode.toDataURL(codigoPix, { margin: 1, scale: 4 });
  };

  // Função de impressão (mantive sua implementação, usando dadosParaImpressao)
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

      printerConnection = await BLEPrinter.connectPrinter(mac);
      if (!printerConnection)
        throw new Error("Não foi possível conectar à impressora.");

      console.log("✅ Conectado na impressora:", mac);

      const linhas = dadosParaImpressao
        .map(
          (item) =>
            `<Text align='left'>${item.quantity}x ${removerAcentos(
              item.name
            )} | R$ ${(item.quantity * item.price).toFixed(
              2
            )}</Text><NewLine />`
        )
        .join("");

      const total = calcularTotal(dadosParaImpressao).toFixed(2);

      const codigoPix = gerarCodigoPix(
        "06943961411", // SUA CHAVE PIX
        "CHURRASQUIM MARAPONGA",
        "FORTALEZA",
        parseFloat(total)
      );
      const qrBase64 = await gerarQrBase64(codigoPix);

      const payload = `
      <Printout>
        <Text align='center' bold='1' fontWidth='2' fontHeight='2'>CHURRASQUIM</Text>
        <NewLine />
        <Text align='center' bold='1' fontWidth='2' fontHeight='2'>MARAPONGA</Text>
        <NewLine />
        <Line lineChar='-' />
        <Text align='left'>Mesa ${id}</Text>
        <NewLine />
        ${linhas}
        <Line lineChar='-' />
        <Text align='right' bold='1'>TOTAL: R$ ${total}</Text>
        <NewLine /><NewLine />
        <Text align='center'>PAGUE PELO PIX:</Text>
        <NewLine />
        <Image>${qrBase64}</Image>
        <NewLine /><NewLine />
        <Text align='center'>${removerAcentos(
          "Obrigado pela preferência!"
        )}</Text>
        <NewLine /><NewLine />
      </Printout>
    `;

      await BLEPrinter.print(payload);
      console.log("🟢 Recibo enviado para impressão!");
    } catch (err) {
      console.error("❌ Erro ao imprimir recibo:", err);
      alert("Falha ao imprimir: " + (err.message || err));
    } finally {
      if (printerConnection) {
        await delay(500);
        BLEPrinter.closeConn()
          .then(() => console.log("🔌 Impressora desconectada."))
          .catch((e) => console.error("Erro ao desconectar:", e));
      }
    }
  };
  // ---------- Pessoas na mesa ----------
  const adicionarPessoa = async () => {
    const nome = (novoNomePessoa || "").trim();
    if (!nome) {
      alert("Digite o nome da pessoa.");
      return;
    }
    try {
      const { error } = await supabase.from("pessoas_mesa").insert({
        mesa_id: id,
        nome,
        status: "ativo",
      });

      if (error) throw error;
      setNovoNomePessoa("");
      await carregarPessoas();
      Alert.alert("Pessoa adicionada", `${nome} adicionada à mesa.`);
    } catch (err) {
      console.error("Erro ao adicionar pessoa:", err);
      alert("Erro ao adicionar pessoa: " + err.message);
    }
  };

  const removerPessoa = async (pessoaId) => {
    try {
      const { error } = await supabase
        .from("pessoas_mesa")
        .delete()
        .eq("id", pessoaId);

      if (error) throw error;
      await carregarPessoas();
      Alert.alert("Removida", "Pessoa removida da mesa.");
    } catch (err) {
      console.error("Erro ao remover pessoa:", err);
      alert("Erro ao remover pessoa: " + err.message);
    }
  };

  // Calcula total de uma pessoa por seus pedidos abertos
  const calcularTotalPessoa = (pessoaId) => {
    const itens = pedidosPorPessoa[pessoaId] || [];
    return itens.reduce((t, it) => t + (it.quantity || 0) * (it.price || 0), 0);
  };

  // Gera QR e mostra modal de impressão/pagamento para pessoa
  const pagarPessoaComPix = async (pessoa) => {
    try {
      const total = calcularTotalPessoa(pessoa.id);
      if (!total || total <= 0) {
        alert("Essa pessoa não tem consumo pendente.");
        return;
      }

      // gera codigo pix (txid único por pessoa e mesa)
      const txid = `MESA${id}_PESSOA${pessoa.id}`;
      const codigoPix = gerarCodigoPix(
        "06943961411", // SUA CHAVE PIX
        pessoa.nome ||
          `Pessoa ${pessoas.findIndex((p) => p.id === pessoa.id) + 1}`,
        "FORTALEZA",
        parseFloat(total),
        txid
      );
      const qrBase64 = await gerarQrBase64(codigoPix);

      // mostra modal de impressão/qr para essa pessoa
      // reusar modalImpressaoVisivel, mas setando dadosParaImpressao para itens dessa pessoa
      setDadosParaImpressao(pedidosPorPessoa[pessoa.id] || []);
      setModalImpressaoVisivel(true);

      // Salva um pequeno estado temporário para saber que estamos imprimindo/pagando para essa pessoa
      // (podemos realizar marcar pago após confirmação manual)
      // Vou criar um fluxo simples: após confirmar pagamento (botão abaixo), marcamos pessoa como paga.
      // Para isto, abrimos o modal e você pressiona "Confirmar Pagamento" quando o pix for compensado.
      // (automação de verificação PIX requer integração externa; aqui é manual)
      // armazenamos o ID da pessoa em AsyncStorage temporariamente (ou state). Usarei state:
      setSelectedPersonId(pessoa.id);
    } catch (err) {
      console.error("Erro ao gerar QR PIX:", err);
      alert("Erro ao gerar QR PIX: " + err.message);
    }
  };

  // Confirma manualmente que a pessoa pagou (botão no modal)
  const confirmarPagamentoPessoa = async (pessoaId) => {
    try {
      // marca pessoa como paga
      const { error: updErr } = await supabase
        .from("pessoas_mesa")
        .update({ status: "pago" })
        .eq("id", pessoaId);

      if (updErr) throw updErr;

      // fecha todos os pedidos abertos dessa pessoa
      const { error: closeErr } = await supabase
        .from("pedidos")
        .update({ status: "fechado", pagamento: "pix" })
        .eq("mesa_id", id)
        .eq("pessoa_id", pessoaId)
        .eq("status", "aberto");

      if (closeErr) throw closeErr;

      // atualiza estados locais
      setPessoas((prev) =>
        prev.map((p) => (p.id === pessoaId ? { ...p, status: "pago" } : p))
      );
      setPedidosPorPessoa((prev) => ({ ...prev, [pessoaId]: [] }));
      setModalImpressaoVisivel(false);
      Alert.alert(
        "Pagamento confirmado",
        "Pagamento registrado para a pessoa."
      );
    } catch (err) {
      console.error("Erro ao confirmar pagamento:", err);
      alert("Erro ao confirmar pagamento: " + (err.message || err));
    }
  };

  // Fechar mesa (mantive sua lógica, mas só permite se todas as pessoas pagaram no modo por_pessoa)
  const fecharMesa = async () => {
    if (!formaPagamento && modoMesa !== "por_pessoa") {
      alert("Selecione a forma de pagamento antes de fechar a mesa.");
      return;
    }

    try {
      console.log("🔒 Tentando fechar a mesa...");

      // Busca pedido(s) aberto(s) da mesa (somente geral se modo mesa, ou se modo por pessoa não fecha aqui)
      if (modoMesa === "por_pessoa") {
        // Só permite fechar mesa se todas as pessoas estiverem com status = 'pago'
        const { data: pessoasAtual, error: pErr } = await supabase
          .from("pessoas_mesa")
          .select("*")
          .eq("mesa_id", id);
        if (pErr) throw pErr;
        const existemAtivas = (pessoasAtual || []).some(
          (p) => p.status !== "pago"
        );
        if (existemAtivas) {
          Alert.alert(
            "Existem consumos pendentes",
            "Nem todas as pessoas quitaram. Marque os pagamentos individuais antes de fechar a mesa."
          );
          return;
        }

        // Se todas pagaram, marca pedidos da mesa como fechados (caso haja algum geral)
        const { error: closeErr } = await supabase
          .from("pedidos")
          .update({ status: "fechado" })
          .eq("mesa_id", id)
          .eq("status", "aberto");

        if (closeErr) throw closeErr;

        // opcional: marcar mesa como fechada em tabela 'mesas' se existir
        setMesaFechada(true);
        setPedidoEnviado([]);
        setConfirmModalVisible(false);
        Alert.alert(
          "Mesa fechada",
          "Todos os pagamentos registrados. Mesa fechada."
        );
        return;
      }

      // modo mesa tradicional
      const { data: pedidoAberto, error: fetchError } = await supabase
        .from("pedidos")
        .select("id, itens")
        .eq("mesa_id", id)
        .eq("pessoa_id", null)
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
        setMesaFechada(true);
        setPedidoEnviado([]);
        setConfirmModalVisible(false);
      } else {
        console.error("Erro ao fechar mesa:", error);
        alert("Erro ao fechar a mesa. Tente novamente.");
      }
    } catch (err) {
      console.error("Erro inesperado ao fechar a mesa:", err);
      alert("Erro inesperado. Tente novamente.");
    }
  };
  // UI helpers mínimos para exibir subtotais
  const totalMesaGeral = async () => {
    // soma todos os pedidos abertos da mesa
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
  };

  // Função auxiliar para calcular o total de consumo por pessoa
  const calcularTotaisPorConsumo = (pedidos) => {
    if (!Array.isArray(pedidos)) return [];

    const totais = {};

    pedidos.forEach((pedido) => {
      const pessoa = pedido.pessoa_nome || "Mesa";
      const total = Number(pedido.total) || 0;
      totais[pessoa] = (totais[pessoa] || 0) + total;
    });

    // Retorna em formato de array [{ pessoa, total }]
    return Object.entries(totais).map(([pessoa, total]) => ({ pessoa, total }));
  };

  const confirmarDivisao = async () => {
    try {
      // Aqui você define o que deve acontecer quando a divisão for confirmada
      console.log("✅ Divisão confirmada!");
      Alert.alert("Sucesso", "Divisão confirmada com sucesso!");
      // exemplo: router.back() ou router.push("/painel")
    } catch (error) {
      console.error("❌ Erro ao confirmar divisão:", error);
      Alert.alert("Erro", "Não foi possível confirmar a divisão.");
    }
  };


  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Mesa {id}</Text>

      {/* Se ainda não escolheu modo, mostra escolha */}
      {modoMesa === null && (
        <View style={{ alignItems: "center", marginBottom: 10 }}>
          <Text style={{ color: Colors.gold, marginBottom: 8 }}>
            Como deseja iniciar os pedidos?
          </Text>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: Colors.gold }]}
              onPress={() => {
                setModoMesa("mesa");
                // carrega pedidos para mesa
              }}
            >
              <Text style={[styles.closeButtonText, { color: Colors.black }]}>
                Pedido (mesa inteira)
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: Colors.acafrao }]}
              onPress={() => {
                setModoMesa("por_pessoa");
                // carrega pessoas/pedidos por pessoa
                carregarPessoas();
              }}
            >
              <Text style={styles.closeButtonText}>Pedido por pessoa</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Se modo por pessoa, painel de pessoas */}
      {modoMesa === "por_pessoa" && (
        <View style={{ width: "90%", marginBottom: 12 }}>
          <Text
            style={{ color: Colors.gold, fontWeight: "700", marginBottom: 8 }}
          >
            Pessoas na mesa
          </Text>

          {/* adicionar pessoa */}
          <View style={{ flexDirection: "row", gap: 8, marginBottom: 8 }}>
            <TextInput
              placeholder="Nome da pessoa"
              value={novoNomePessoa}
              onChangeText={setNovoNomePessoa}
              style={{
                flex: 1,
                backgroundColor: Colors.white,
                padding: 8,
                borderRadius: 8,
              }}
            />
            <TouchableOpacity
              style={[
                styles.closeButton,
                { paddingHorizontal: 12, alignSelf: "center" },
              ]}
              onPress={adicionarPessoa}
            >
              <Text style={styles.closeButtonText}>Adicionar</Text>
            </TouchableOpacity>
          </View>

          {/* lista de pessoas */}
          <ScrollView style={{ maxHeight: 140, marginBottom: 8 }}>
            {isLoadingPessoas ? (
              <ActivityIndicator color={Colors.gold} />
            ) : pessoas.length === 0 ? (
              <Text style={{ color: Colors.gray }}>
                Nenhuma pessoa cadastrada.
              </Text>
            ) : (
              pessoas.map((p) => (
                <View
                  key={p.id}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingVertical: 8,
                    borderBottomWidth: 0.5,
                    borderColor: "#ddd",
                  }}
                >
                  <View>
                    <Text style={{ fontWeight: "700" }}>{p.nome}</Text>
                    <Text>
                      Pendência: R$ {calcularTotalPessoa(p.id).toFixed(2)} —{" "}
                      {p.status === "pago" ? "Pago" : "Pendente"}
                    </Text>
                  </View>

                  <View style={{ flexDirection: "row", gap: 8 }}>
                    <TouchableOpacity
                      style={[styles.smallBtn, { alignSelf: "center" }]}
                      onPress={() => {
                        setSelectedPersonId(p.id);
                        // opcional: carregar pedido dessa pessoa para visualização
                      }}
                    >
                      <Text style={{ fontWeight: "700" }}>Selecionar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.smallBtn, { alignSelf: "center" }]}
                      onPress={() => pagarPessoaComPix(p)}
                    >
                      <Text style={{ fontWeight: "700" }}>PIX</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => removerPessoa(p.id)}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={20}
                        color={Colors.gold}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      )}

      {/* Botão para abrir modal de itens */}
      {!mesaFechada && modoMesa !== null && (
        <TouchableOpacity style={styles.button} onPress={abrirModal}>
          <Text style={styles.buttonText}>
            {modoMesa === "por_pessoa"
              ? "Fazer Pedido (pessoa selecionada)"
              : "Fazer Pedido"}
          </Text>
        </TouchableOpacity>
      )}

      {/* Lista de pedidos enviados */}
      <View style={styles.pedidoContainer}>
        <Text style={styles.pedidoTitulo}>Pedidos Feitos</Text>

        {/* Exibição diferente: se modo por pessoa mostramos sumário das pessoas e pedidos individuais,
            se modo mesa mostramos o pedidoEnviado geral */}
        {modoMesa === "por_pessoa" ? (
          <View style={{ width: "100%" }}>
            {pessoas.length === 0 ? (
              <Text style={styles.emptyText}>Nenhuma pessoa cadastrada.</Text>
            ) : (
              pessoas.map((p) => {
                const itens = pedidosPorPessoa[p.id] || [];
                return (
                  <View
                    key={p.id}
                    style={{ marginBottom: 8, paddingVertical: 6 }}
                  >
                    <Text style={{ fontWeight: "700" }}>
                      {p.nome} — R$ {calcularTotalPessoa(p.id).toFixed(2)} —{" "}
                      {p.status}
                    </Text>
                    {itens.length === 0 ? (
                      <Text style={{ color: Colors.gray, fontStyle: "italic" }}>
                        Sem itens
                      </Text>
                    ) : (
                      itens.map((it, i) => (
                        <View
                          key={i}
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            paddingVertical: 2,
                          }}
                        >
                          <Text style={{ color: Colors.white }}>
                            {it.quantity}x {it.name}
                          </Text>
                          <Text style={{ color: Colors.white }}>
                            R$ {(it.quantity * it.price).toFixed(2)}
                          </Text>
                        </View>
                      ))
                    )}
                  </View>
                );
              })
            )}
          </View>
        ) : (
          <>
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
                        onPress={() => removerItemDoPedido(item, null)}
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
                    R$ {calcularTotal(pedidoEnviado).toFixed(2)}
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
                          setModalEscolhaFechamento(true);
                        }
                      }}
                    >
                      <Text
                        style={[
                          styles.closeButtonText,
                          { color: Colors.black },
                        ]}
                      >
                        Fechar Mesa
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.closeButton,
                        { backgroundColor: Colors.gold, marginTop: 12 },
                      ]}
                      onPress={() => {
                        setDadosParaImpressao(pedidoEnviado);
                        setModalImpressaoVisivel(true);
                      }}
                    >
                      <Text style={[styles.closeButtonText]}>
                        Imprimir Pedido
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
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

      {/* Modal de Escolha de Fechamento */}
      <Modal
        visible={modalEscolhaFechamento}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setModalEscolhaFechamento(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModalContent}>
            <Text
              style={{ fontSize: 18, fontWeight: "bold", marginBottom: 12 }}
            >
              Como deseja finalizar?
            </Text>

            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: Colors.gold }]}
              onPress={() => {
                setModalEscolhaFechamento(false);
                setConfirmModalVisible(true);
              }}
            >
              <Text style={[styles.closeButtonText, { color: Colors.black }]}>
                Fechar Conta
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.closeButton,
                { backgroundColor: Colors.acafrao, marginTop: 10 },
              ]}
              onPress={() => {
                setModalEscolhaFechamento(false);
                setModalDividirConta(true);
              }}
            >
              <Text style={styles.closeButtonText}>Dividir Conta</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.closeButton, { marginTop: 10 }]}
              onPress={() => setModalEscolhaFechamento(false)}
            >
              <Text style={styles.closeButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
              Isso encerrará os pedidos para esta mesa.
            </Text>
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: Colors.gold }]}
              onPress={async () => {
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

      {/* Modal de Dividir Conta (mantive funcionalidade anterior) */}
      <Modal
        visible={modalDividirConta}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalDividirConta(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.confirmModalContent,
              { width: "92%", maxHeight: "90%" },
            ]}
          >
            <Text
              style={{ fontSize: 18, fontWeight: "bold", marginBottom: 12 }}
            >
              Dividir Conta
            </Text>

            <View
              style={{ flexDirection: "row", marginBottom: 12, width: "100%" }}
            >
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  modoDivisao === "consumo" && styles.optionButtonActive,
                ]}
                onPress={() => setModoDivisao("consumo")}
              >
                <Text
                  style={{
                    color: modoDivisao === "consumo" ? Colors.black : "#555",
                    fontWeight: modoDivisao === "consumo" ? "bold" : "normal",
                  }}
                >
                  Por consumo
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.optionButton,
                  modoDivisao === "pessoa" && styles.optionButtonActive,
                ]}
                onPress={() => setModoDivisao("pessoa")}
              >
                <Text
                  style={{
                    color: modoDivisao === "pessoa" ? Colors.black : "#555",
                    fontWeight: modoDivisao === "pessoa" ? "bold" : "normal",
                  }}
                >
                  Por pessoa
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ width: "100%", marginBottom: 8 }}>
              {pedidoEnviado.length === 0 ? (
                <Text>Nenhum item na mesa.</Text>
              ) : (
                pedidoEnviado.map((item, idx) => {
                  const itemTotal = (item.quantity || 0) * (item.price || 0);
                  return (
                    <View
                      key={idx}
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 8,
                        paddingVertical: 6,
                        borderBottomWidth: 0.5,
                        borderColor: "#ddd",
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontWeight: "600" }}>
                          {item.quantity}x {item.name}
                        </Text>
                        <Text>R$ {itemTotal.toFixed(2)}</Text>
                      </View>

                      {modoDivisao === "consumo" ? (
                        <View style={{ alignItems: "center" }}>
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                            }}
                          >
                            <TouchableOpacity
                              style={styles.smallBtn}
                              onPress={() => cycleOwnerForItem(idx, -1)}
                            >
                              <Text style={{ fontWeight: "700" }}>‹</Text>
                            </TouchableOpacity>
                            <View style={{ paddingHorizontal: 8 }}>
                              <Text>Pessoa {(itemOwners[idx] ?? 0) + 1}</Text>
                            </View>
                            <TouchableOpacity
                              style={styles.smallBtn}
                              onPress={() => cycleOwnerForItem(idx, 1)}
                            >
                              <Text style={{ fontWeight: "700" }}>›</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      ) : null}
                    </View>
                  );
                })
              )}
            </ScrollView>

            <View style={{ width: "100%", alignItems: "center" }}>
              {modoDivisao === "pessoa" ? (
                <View style={{ alignItems: "center", width: "100%" }}>
                  <Text style={{ marginBottom: 8 }}>Número de pessoas:</Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <TouchableOpacity
                      style={styles.smallBtn}
                      onPress={decrementarPessoas}
                    >
                      <Text style={{ fontWeight: "700" }}>-</Text>
                    </TouchableOpacity>
                    <Text style={{ marginHorizontal: 12, fontWeight: "600" }}>
                      {numPessoas}
                    </Text>
                    <TouchableOpacity
                      style={styles.smallBtn}
                      onPress={incrementarPessoas}
                    >
                      <Text style={{ fontWeight: "700" }}>+</Text>
                    </TouchableOpacity>
                  </View>

                  <Text>
                    Cada pessoa paga:{" "}
                    <Text style={{ fontWeight: "700" }}>
                      R$ {(calcularTotaisPorPessoa()[0] || 0).toFixed(2)}
                    </Text>
                  </Text>
                </View>
              ) : (
                <View style={{ width: "100%", alignItems: "center" }}>
                  <Text style={{ marginBottom: 8 }}>
                    Totais por pessoa (consumo):
                  </Text>
                  {calcularTotaisPorConsumo().map((v, i) => (
                    <Text key={i}>
                      Pessoa {i + 1}: R$ {v.toFixed(2)}
                    </Text>
                  ))}
                </View>
              )}
            </View>

            <View style={{ marginTop: 14, width: "100%" }}>
              <TouchableOpacity
                style={[styles.closeButton, { backgroundColor: Colors.gold }]}
                onPress={confirmarDivisao}
              >
                <Text style={[styles.closeButtonText, { color: Colors.black }]}>
                  Confirmar divisão
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.closeButton, { marginTop: 10 }]}
                onPress={() => setModalDividirConta(false)}
              >
                <Text style={styles.closeButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Impressao / QR — reaproveitado para pessoa ou mesa */}
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
              Recibo / Pagamento
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
              <Text style={[styles.closeButtonText, { color: Colors.black }]}>
                Imprimir
              </Text>
            </TouchableOpacity>

            {/* Se houver pessoa selecionada para pagamento, botão para confirmar pagamento */}
            {selectedPersonId && (
              <TouchableOpacity
                style={[
                  styles.closeButton,
                  { backgroundColor: Colors.acafrao, marginTop: 10 },
                ]}
                onPress={() => confirmarPagamentoPessoa(selectedPersonId)}
              >
                <Text style={styles.closeButtonText}>
                  Confirmar Pagamento (marcar pago)
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.closeButton,
                { backgroundColor: Colors.gold, marginTop: 10 },
              ]}
              onPress={() => {
                setModalImpressaoVisivel(false);
                setSelectedPersonId(null);
              }}
            >
              <Text style={[styles.closeButtonText, { color: Colors.black }]}>
                Fechar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal Impressora */}
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
  smallBtn: {
    backgroundColor: Colors.acafrao,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  itemPrice: { color: Colors.black, fontWeight: "600" },
});
