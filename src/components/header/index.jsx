import { View, Text, StyleSheet} from "react-native" 
import { Link } from "expo-router"; 
import Colors from "@/constants/Colors";

const Header = () => {
    return (
      <View style={styles.container}>
        <View style={styles.botao}>
          <Text style={styles.link}>Salão</Text>
        </View>

        <View style={styles.botao}>
          <Link href="/(auth)/cardapio/page" style={styles.link}>
            Cardápio
          </Link>
        </View>

        <View style={styles.botao}>
          <Link href="/" style={styles.link}>
            Configuração
          </Link>
        </View>
      </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 100,
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: Colors.acafrao,
    },

    botao: {
        padding: 10,
        marginHorizontal: 5,
    },
    link: {
        color: Colors.gold,
        fontSize: 18,
        fontWeight: 'bold',
    },
})

export default Header;
