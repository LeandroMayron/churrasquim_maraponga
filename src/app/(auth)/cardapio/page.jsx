import { View, Text, StyleSheet, Image } from "react-native";
import Banner from "../../../components/banner/index";
import Colors from "@/constants/Colors";

const Cardapio = () => {
  return (
    <View style={styles.container}>
      <Banner />
      <View style={styles.section}>
        <View style={styles.aside}>
          <View style={styles.box}>
            <Text style={styles.titulo}>Bolinhas</Text>
            <Text style={styles.text}>
              Bolinha de Frango <Text style={styles.preco}>R$ 16,99</Text>
            </Text>
            <Text style={styles.text}>
              Bolinha de Carne de sol <Text style={styles.preco}>R$ 16,99</Text>
            </Text>
            <Text style={styles.text}>
              Bolinha de peixe <Text style={styles.preco}>R$ 16,99</Text>
            </Text>
            <Text style={styles.text}>
              Bolinha de calabresa com queijo{" "}
              <Text style={styles.preco}>R$ 16,99</Text>
            </Text>
          </View>
          <View style={styles.box}>
            <Text style={styles.titulo}>Pastelzinho</Text>
            <Text style={styles.text}>
              Pastel de Queijo <Text style={styles.preco}>R$ 21,99</Text>
            </Text>
            <Text style={styles.text}>
              Pastel de carne de sol <Text style={styles.preco}>R$ 21,99</Text>
            </Text>
            <Text style={styles.text}>
              Pastel de frango <Text style={styles.preco}>R$ 21,99</Text>
            </Text>
            <Text style={styles.text}>
              Pastel de calabresa com queijo{" "}
              <Text style={styles.preco}>R$ 21,99</Text>
            </Text>
            <Text style={styles.text}>
              Pastel de arraiá <Text style={styles.preco}>R$ 21,99</Text>
            </Text>
            <Text style={styles.text}>
              Pastel de camarão <Text style={styles.preco}>R$ 21,99</Text>
            </Text>
          </View>
          <View style={styles.box}>
            <Text style={styles.titulo}>Entradas</Text>
            <Text style={styles.text}>
              Batata frita <Text style={styles.preco}>R$ 15,90</Text>
            </Text>
            <Text style={styles.text}>
              macaxeira <Text style={styles.preco}>R$ 15,90</Text>
            </Text>
            <Text style={styles.text}>
              baião <Text style={styles.preco}>R$ 15,90</Text>
            </Text>
            <Text style={styles.text}>
              torresmo <Text style={styles.preco}>R$ 15,90</Text>
            </Text>
            <Text style={styles.text}>
              empanado de camarão <Text style={styles.preco}>R$ 15,90</Text>
            </Text>
            <Text style={styles.text}>
              calabresa acebolada <Text style={styles.preco}>R$ 15,90</Text>
            </Text>
          </View>
        </View>

        <View style={styles.aside}>
          <View style={styles.box}>
            <Text style={styles.titulo}>Quinta do caranguejo</Text>
            <Text style={styles.text}>
              03 unidades <Text style={styles.preco}>R$ 26,99</Text>
            </Text>
          </View>
          <View style={styles.box}>
            <Text style={styles.titulo}>aos domingos</Text>
            <Text style={styles.text}>
              Panelada <Text style={styles.preco}>R$ 29,90</Text>
            </Text>
          </View>
          <View style={styles.box}>
            <Text style={styles.titulo}>Bebidas</Text>
            <Text style={styles.text}>
              cerveja buchudinha <Text style={styles.preco}>R$ 5,00</Text>
            </Text>
            <Text style={styles.text}>
              heineken 330ml long neck <Text style={styles.preco}>R$ 9,00</Text>
            </Text>
            <Text style={styles.text}>
              stella 330ml long neck <Text style={styles.preco}>R$ 9,00</Text>
            </Text>
            <Text style={styles.text}>
              skoll beats <Text style={styles.preco}>R$ 10,00</Text>
            </Text>
            <Text style={styles.text}>
              whisky black white dose <Text style={styles.preco}>R$ 8,00</Text>
            </Text>
            <Text style={styles.text}>
              ypióca dose <Text style={styles.preco}>R$ 3,50</Text>
            </Text>
            <Text style={styles.text}>
              ypióca meia meiota (copo){" "}
              <Text style={styles.preco}>R$ 7,00</Text>
            </Text>
            <Text style={styles.text}>
              ypióca meiota <Text style={styles.preco}>R$ 12,00</Text>
            </Text>
            <Text style={styles.text}>
              água de côco (jarra) <Text style={styles.preco}>R$ 12,00</Text>
            </Text>
            <Text style={styles.text}>
              sucos <Text style={styles.preco}>R$ 7,00</Text>
            </Text>
            <Text style={styles.text}>
              água com gás <Text style={styles.preco}>R$ 3,00</Text>
            </Text>
            <Text style={styles.text}>
              água sem gás <Text style={styles.preco}>R$ 2,00</Text>
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
    justifyContent: "center",
    alignItems: 'center'
  },

  section: {
    flexDirection: "row"
  },
  aside: {
    width: "45%",
    height: "100%",
    marginTop: 20,
    flexDirection: "column",
    marginRight: 10
  },

  titulo: {
    backgroundColor: Colors.gold,
    textTransform: "uppercase",
    color: Colors.black,
    fontWeight: "bold",
    marginBottom: 5,
  },

  text: {
    color: Colors.white,
    fontWeight: "bold",
    textTransform: "uppercase",
    marginBottom: 5,
    fontSize: 12,
  },
  preco: {
    color: Colors.gold,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
});

export default Cardapio;
