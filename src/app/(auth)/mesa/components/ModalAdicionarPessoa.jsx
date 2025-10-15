import React, { useState } from "react";
import { Modal, View, TextInput, Button, Text, StyleSheet } from "react-native";

export default function ModalAdicionarPessoa({ visible, onClose, onAdd }) {
  const [nome, setNome] = useState("");

  const handleAdd = () => {
    if (!nome) return;
    onAdd(nome);
    setNome("");
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Adicionar Pessoa</Text>
          <TextInput
            style={styles.input}
            placeholder="Nome"
            value={nome}
            onChangeText={setNome}
          />
          <Button title="Adicionar" onPress={handleAdd} />
          <Button title="Cancelar" color="red" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#000000aa",
  },
  modal: {
    margin: 20,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
  },
  title: { 
    fontWeight: "bold", 
    marginBottom: 10, 
    fontSize: 16 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    marginBottom: 10,
    borderRadius: 5,
  },
});
