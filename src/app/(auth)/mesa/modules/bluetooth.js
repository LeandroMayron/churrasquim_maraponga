import { PermissionsAndroid, Platform, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BLEPrinter } from "@xyzsola/react-native-thermal-printer";

export async function solicitarPermissoesBluetooth() {
  if (Platform.OS === "android") {
    const permissoes = [];

    if (Platform.Version >= 31) {
      permissoes.push(
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN
      );
    } else {
      permissoes.push(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
    }

    const granted = await PermissionsAndroid.requestMultiple(permissoes);
    const todasOk = Object.values(granted).every(
      (status) => status === PermissionsAndroid.RESULTS.GRANTED
    );

    if (!todasOk) {
      Alert.alert("Permissões de Bluetooth negadas.");
      return false;
    }
  }

  return true;
}

export async function buscarImpressoras(
  setPrinters,
  setPrinterModalVisible,
  setIsSearchingPrinters
) {
  setIsSearchingPrinters(true);
  try {
    await solicitarPermissoesBluetooth();
    await BLEPrinter.init();
    const devices = await BLEPrinter.getDeviceList();

    if (!devices.length) {
      Alert.alert("Nenhuma impressora encontrada!");
      return;
    }

    setPrinters(devices);
    setPrinterModalVisible(true);
  } catch (err) {
    console.error("Erro ao buscar impressoras:", err);
    Alert.alert("Erro ao buscar impressoras: " + err.message);
  } finally {
    setIsSearchingPrinters(false);
  }
}

export async function selecionarImpressora(impressora, setPrinterModalVisible) {
  try {
    await AsyncStorage.setItem("printer_mac", impressora.innerMacAddress);
    Alert.alert(`✅ Impressora ${impressora.deviceName} salva!`);
    setPrinterModalVisible(false);
  } catch (err) {
    console.error("Erro ao salvar impressora:", err);
    Alert.alert("Erro ao salvar impressora: " + err.message);
  }
}
