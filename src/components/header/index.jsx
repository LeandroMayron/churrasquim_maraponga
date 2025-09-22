import Colors from "@/constants/Colors";
import { Link } from "expo-router";
import { StyleSheet, View } from "react-native";

const Header = () => {
  return (
    <View style={styles.container}>
      <View style={styles.botao}>
        <Link href="/(painel)/profile/page" style={styles.link}>
          Salão
        </Link>
      </View>

      <View style={styles.botao}>
        <Link href="/(auth)/cardapio/page" style={styles.link}>
          Cardápio
        </Link>
      </View>

      <View style={styles.botao}>
        <Link href="/(auth)/logout/page" style={styles.link}>
          Configuração
        </Link>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: Colors.acafrao,
  },

  botao: {
    padding: 10,
    marginHorizontal: 5,
  },
  link: {
    color: Colors.gold,
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default Header;
