import React from "react";
import {
  FlatList,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

export default function ListaPedidos({
  pedidos,
  onDetalhes,
  ListHeaderComponent,
}) {
  return (
    <FlatList
      data={pedidos}
      keyExtractor={(item) => item.id.toString()}
      ListHeaderComponent={ListHeaderComponent}
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => onDetalhes(item)}>
          <View style={styles.item}>
            <Text style={styles.nome}>{item.nome}</Text>
            <Text style={styles.info}>Qtd: {item.quantidade}</Text>
            <Text style={styles.info}>R$ {item.preco.toFixed(2)}</Text>
          </View>
        </TouchableOpacity>
      )}
    />
  );
}


const styles = StyleSheet.create({
  item: { 
    padding: 12, 
    borderBottomWidth: 1, 
    borderColor: "#ccc" 
  },
  nome: { 
    fontWeight: "bold", 
    fontSize: 16 
  },
  info: { 
    fontSize: 14 
  },
});
