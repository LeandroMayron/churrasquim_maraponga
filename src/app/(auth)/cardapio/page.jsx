import { SafeAreaView, View, Text, StyleSheet, ScrollView } from "react-native";
import Colors from "@/constants/Colors";

const Cardapio = () => {
  return (
    <SafeAreaView>
      <ScrollView>
        <View style={styles.container}>
          <Text style={styles.titulo}>Bolinhas</Text>
          <View style={styles.item}>
            <Text style={styles.text}>Bolinha de Frango</Text>
            <Text style={styles.preco}>R$ 16,99</Text>
          </View>
          <View style={styles.item}>
            <Text style={styles.text}>Bolinha de Carne de sol</Text>
            <Text style={styles.preco}>R$ 16,99</Text>
          </View>
          <View style={styles.item}>
            <Text style={styles.text}>Bolinha de peixe</Text>
            <Text style={styles.preco}>R$ 16,99</Text>
          </View>
          <View style={styles.item}>
            <Text style={styles.text}>Bolinha de calabresa com queijo</Text>
            <Text style={styles.preco}>R$ 16,99</Text>
          </View>

          <Text style={styles.titulo}>Pastelzinho</Text>
          <View style={styles.item}>
            <Text style={styles.text}>Pastel de Queijo</Text>
            <Text style={styles.preco}>R$ 21,99</Text>
          </View>
          <View style={styles.item}>
            <Text style={styles.text}>Pastel de carne de sol</Text>
            <Text style={styles.preco}>R$ 21,99</Text>
          </View>
          <View style={styles.item}>
            <Text style={styles.text}>Pastel de frango</Text>
            <Text style={styles.preco}>R$ 21,99</Text>
          </View>
          <View style={styles.item}>
            <Text style={styles.text}>Pastel de calabresa com queijo</Text>
            <Text style={styles.preco}>R$ 21,99</Text>
          </View>
          <View style={styles.item}>
            <Text style={styles.text}>Pastel de arraiá</Text>
            <Text style={styles.preco}>R$ 21,99</Text>
          </View>
          <View style={styles.item}>
            <Text style={styles.text}>Pastel de camarão</Text>
            <Text style={styles.preco}>R$ 21,99</Text>
          </View>

          <Text style={styles.titulo}>Entradas</Text>
          <View style={styles.item}>
            <Text style={styles.text}>Batata frita</Text>
            <Text style={styles.preco}>R$ 15,90</Text>
          </View>
          <View style={styles.item}>
            <Text style={styles.text}>macaxeira</Text>
            <Text style={styles.preco}>R$ 15,90</Text>
          </View>
          <View style={styles.item}>
            <Text style={styles.text}>baião</Text>
            <Text style={styles.preco}>R$ 15,90</Text>
          </View>
          <View style={styles.item}>
            <Text style={styles.text}>torresmo</Text>
            <Text style={styles.preco}>R$ 15,90</Text>
          </View>
          <View style={styles.item}>
            <Text style={styles.text}>empanado de camarão</Text>
            <Text style={styles.preco}>R$ 15,90</Text>
          </View>
          <View style={styles.item}>
            <Text style={styles.text}>calabresa acebolada</Text>
            <Text style={styles.preco}>R$ 15,90</Text>
          </View>

          <Text style={styles.titulo}>Quinta do caranguejo</Text>
          <View style={styles.item}>
            <Text style={styles.text}>03 unidades</Text>
            <Text style={styles.preco}>R$ 26,99</Text>
          </View>

          <Text style={styles.titulo}>aos domingos</Text>
          <View style={styles.item}>
            <Text style={styles.text}>Panelada</Text>
            <Text style={styles.preco}>R$ 29,90</Text>
          </View>

          <Text style={styles.titulo}>Bebidas</Text>
          <View style={styles.item}>
            <Text style={styles.text}>cerveja buchudinha</Text>
            <Text style={styles.preco}>R$ 5,00</Text>
          </View>
          <View style={styles.item}>
            <Text style={styles.text}>heineken 330ml long neck</Text>
            <Text style={styles.preco}>R$ 9,00</Text>
          </View>
          <View style={styles.item}>
            <Text style={styles.text}>stella 330ml long neck</Text>
            <Text style={styles.preco}>R$ 9,00</Text>
          </View>
          <View style={styles.item}>
            <Text style={styles.text}>skoll beats</Text>
            <Text style={styles.preco}>R$ 10,00</Text>
          </View>
          <View style={styles.item}>
            <Text style={styles.text}>whisky black white dose</Text>
            <Text style={styles.preco}>R$ 8,00</Text>
          </View>
          <View style={styles.item}>
            <Text style={styles.text}>ypióca dose</Text>
            <Text style={styles.preco}>R$ 3,50</Text>
          </View>
          <View style={styles.item}>
            <Text style={styles.text}>ypióca meia meiota (copo)</Text>
            <Text style={styles.preco}>R$ 7,00</Text>
          </View>
          <View style={styles.item}>
            <Text style={styles.text}>ypióca meiota</Text>
            <Text style={styles.preco}>R$ 12,00</Text>
          </View>
          <View style={styles.item}>
            <Text style={styles.text}>água de côco (jarra)</Text>
            <Text style={styles.preco}>R$ 12,00</Text>
          </View>
          <View style={styles.item}>
            <Text style={styles.text}>sucos</Text>
            <Text style={styles.preco}>R$ 7,00</Text>
          </View>
          <View style={styles.item}>
            <Text style={styles.text}>água com gás</Text>
            <Text style={styles.preco}>R$ 3,00</Text>
          </View>
          <View style={styles.item}>
            <Text style={styles.text}>água sem gás</Text>
            <Text style={styles.preco}>R$ 2,00</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
    paddingTop: 40,
    paddingBottom: 30,
  },

  titulo: {
    width: "100%",
    backgroundColor: Colors.gold,
    textTransform: "uppercase",
    color: Colors.black,
    fontWeight: "bold",
    paddingLeft: 5,
    marginBottom: 5,
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  text: {
    color: Colors.white,
    fontWeight: "bold",
    textTransform: "uppercase",
    paddingLeft: 5,
    marginBottom: 5,
  },

  preco: {
    color: Colors.gold,
    fontWeight: "bold",
    textTransform: "uppercase",
    paddingRight: 5,
  },
});

export default Cardapio;
