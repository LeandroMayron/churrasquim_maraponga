import Colors from "@/constants/Colors";
import { useEffect, useState } from "react";
import Header from "../../../components/header/index";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const MENU_URL =
  "https://6644-fontend.github.io/menu-churrasquinho-maraponga/menu.json";

const Cardapio = () => {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(MENU_URL)
      .then((response) => response.json())
      .then((data) => {
        // Transforma o objeto em array [{categoria, itens}]
        const menuArray = Object.entries(data).map(([categoria, itens]) => ({
          categoria,
          itens,
        }));
        setMenu(menuArray);
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        Alert.alert("Erro ao carregar cardápio", err.message);
      });
  }, []);

  if (loading) {
    return <ActivityIndicator color={Colors.gold} style={{ flex: 1 }} />;
  }

  return (
    <SafeAreaView>
      <Header />
      <ScrollView>
        <View style={styles.container}>
          {menu.map((categoria, idx) => (
            <View key={idx}>
              <Text style={styles.titulo}>{categoria.categoria}</Text>
              {categoria.itens.map((item, i) => (
                <View style={styles.item} key={i}>
                  <Text style={styles.text}>{item.name}</Text>
                  <Text style={styles.preco}>
                    R$ {item.price.toFixed(2).replace(".", ",")}
                  </Text>
                </View>
              ))}
            </View>
          ))}
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
