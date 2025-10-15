import Colors from "@/constants/Colors";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Header from "../../../components/header/index";

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
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator color={Colors.gold} size="large" />
      </SafeAreaView>
    );
  }

  // Renderiza cada categoria e seus itens
  const renderCategoria = ({ item }) => (
    <View style={styles.categoriaContainer}>
      <Text style={styles.titulo}>{item.categoria}</Text>
      {item.itens.map((i, idx) => (
        <View style={styles.item} key={idx}>
          <Text style={styles.text}>{i.name}</Text>
          <Text style={styles.preco}>
            {typeof i.price === "number"
              ? `R$ ${i.price.toFixed(2).replace(".", ",")}`
              : "Preço indisponível"}
          </Text>
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.pageContainer}>
        <Header />
        <FlatList
          data={menu}
          keyExtractor={(item, idx) => idx.toString()}
          renderItem={renderCategoria}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  pageContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 60, // garante espaço extra no final da lista
  },
  categoriaContainer: {
    marginBottom: 15,
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
    marginBottom: 5,
  },
  text: {
    color: Colors.white,
    fontWeight: "bold",
    textTransform: "uppercase",
    paddingLeft: 5,
  },
  preco: {
    color: Colors.gold,
    fontWeight: "bold",
    textTransform: "uppercase",
    paddingRight: 5,
  },
});

export default Cardapio;
