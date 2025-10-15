import { BLEPrinter } from "@xyzsola/react-native-thermal-printer";
import { supabase } from "@/lib/supabase";

export async function printRecibo(mesaId) {
  try {
    const { data: pedidos } = await supabase
      .from("pedidos")
      .select("*")
      .eq("mesa_id", mesaId);

    await BLEPrinter.printText(`Recibo da Mesa ${mesaId}\n\n`);
    pedidos.forEach((item) => {
      BLEPrinter.printText(
        `${item.nome} x${item.quantidade} - R$ ${item.preco.toFixed(2)}\n`
      );
    });

    const total = pedidos.reduce(
      (sum, item) => sum + item.preco * item.quantidade,
      0
    );
    await BLEPrinter.printText(`\nTotal: R$ ${total.toFixed(2)}\n`);
  } catch (error) {
    console.log("Erro ao imprimir recibo:", error);
  }
}
