import { supabase } from "../../../../lib/supabase";

export async function carregarPessoasMesa(
  mesaId,
  setPessoas,
  setIsLoadingPessoas
) {
  setIsLoadingPessoas(true);
  try {
    const { data, error } = await supabase
      .from("pessoas_mesa")
      .select("*")
      .eq("mesa_id", mesaId)
      .order("created_at", { ascending: true });

    if (!error) setPessoas(data || []);
    else console.error("Erro ao carregar pessoas:", error);
  } catch (err) {
    console.error("Erro inesperado ao carregar pessoas:", err);
  } finally {
    setIsLoadingPessoas(false);
  }
}
