import { Alert, Platform } from "react-native";
import { BLEPrinter } from "@xyzsola/react-native-thermal-printer";

export const solicitarPermissaoBluetooth = async () => {
  if (Platform.OS === "android") {
    try {
      await BLEPrinter.requestBluetoothPermissions();
    } catch (err) {
      Alert.alert("Erro", "Permissão de Bluetooth negada");
    }
  }
};

export const listarImpressoras = async () => {
  const printers = await BLEPrinter.getDeviceList();
  return printers || [];
};

export const conectarImpressora = async (printer) => {
  try {
    await BLEPrinter.connectPrinter(printer.address);
    Alert.alert("Sucesso", `Conectado à impressora ${printer.name}`);
  } catch (err) {
    Alert.alert("Erro", "Falha ao conectar à impressora");
  }
};

export const imprimirRecibo = async (pedidoEnviado, total) => {
  let texto = "=== Recibo ===\n";
  pedidoEnviado.forEach((item) => {
    texto += `${item.quantity}x ${item.name} - R$ ${item.price}\n`;
  });
  texto += `\nTotal: R$ ${total}\n`;
  await BLEPrinter.printText(texto);
};
