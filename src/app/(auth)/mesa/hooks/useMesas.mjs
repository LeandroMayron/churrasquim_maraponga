import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export function useMesa(mesaId) {
  const [pessoas, setPessoas] = useState([]);

  useEffect(() => {
    fetchPessoas();
  }, [mesaId]);

  async function fetchPessoas() {
    const { data } = await supabase
      .from("pessoas_mesa")
      .select("*")
      .eq("mesa_id", mesaId);
    setPessoas(data || []);
  }

  async function adicionarPessoa(nome) {
    await supabase.from("pessoas_mesa").insert([{ nome, mesa_id: mesaId }]);
    fetchPessoas();
  }

  return { pessoas, adicionarPessoa };
}
