import { View, Text, StyleSheet } from "react-native";
import Colors from "@/constants/Colors";

const Cardapio = () => {
    return (
      <View style={styles.container}>
        <View style={styles.aside}>
          <View>
            <Text style={styles.titulo}>Bolinhas:</Text>
            <Text style={styles.text}>Bolinha de Frango</Text>
            <Text style={styles.preco}>R$ 16,99</Text>
          </View>
          <View>
            <Text style={styles.titulo}>Pastelzinho:</Text>
            <Text style={styles.text}>pastel de queijo</Text>
            <Text style={styles.preco}>R$ 21,99</Text>
          </View>
          <View>
            <Text style={styles.titulo}>Entradas:</Text>
            <Text style={styles.text}>batata frita</Text>
            <Text style={styles.preco}>R$ 15,90</Text>
          </View>
        </View>

        <View style={styles.aside}>
          <View>
            <Text style={styles.titulo}>Prato Principal:</Text>
            <Text style={styles.text}>Frango com batata</Text>
            <Text style={styles.preco}>R$ 29,99</Text>
          </View>
          <View>
            <Text style={styles.titulo}>Sobremesa:</Text>
            <Text style={styles.text}>Pudim de leite</Text>
            <Text style={styles.preco}>R$ 12,50</Text>
          </View>
          <View>
            <Text style={styles.titulo}>Bebidas:</Text>
            <Text style={styles.text}>Refrigerante</Text>
            <Text style={styles.preco}>R$ 5,00</Text>
          </View>
        </View>
      </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  aside: {
    width: "40%",
    flexDirection: "column",
    justifyContent: "space-between",
    marginVertical: 40,
    gap: 10,
  },

  titulo: {
    backgroundColor: Colors.gold,
    textTransform: "uppercase",
    color: Colors.black,
  },

  text: {
    color: Colors.white,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  preco: {
    color: Colors.gold,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
});

export default Cardapio;