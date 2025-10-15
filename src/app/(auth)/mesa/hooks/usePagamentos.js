import { useState } from "react";
import { Alert } from "react-native";
import { supabase } from "../../../lib/supabase";
import { printRecibo } from "./useBluetoothPrinter";

export function usePagamento(mesaId) {
  const [loading, setLoading] = useState(false);

  async function fecharMesa() {
    try {
      setLoading(true);
      await supabase
        .from("mesas")
        .update({ status: "fechada" })
        .eq("id", mesaId);
      await printRecibo(mesaId);
      Alert.alert("Sucesso", "Mesa fechada e recibo impresso!");
    } catch (error) {
      Alert.alert("Erro", "Não foi possível fechar a mesa.");
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  return { fecharMesa, loading };
}
