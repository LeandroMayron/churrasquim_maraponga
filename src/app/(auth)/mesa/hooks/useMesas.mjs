import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export function useMesa(mesaId) {
  const [pessoas, setPessoas] = useState([]);

  useEffect(() => {
    async function fetchPessoas() {
      const { data } = await supabase
        .from("pessoas")
        .select("*")
        .eq("mesa_id", mesaId);
      setPessoas(data || []);
    }
    fetchPessoas();
  }, [mesaId]);

  const adicionarPessoa = async (nome) => {
    await supabase.from("pessoas").insert([{ nome, mesa_id: mesaId }]);
    setPessoas((prev) => [...prev, { id: Date.now(), nome }]);
  };

  return { pessoas, adicionarPessoa };
}
