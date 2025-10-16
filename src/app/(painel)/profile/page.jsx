import {Text, StyleSheet, SafeAreaView} from "react-native";
import Colors from "../../../../constants/Colors";
import Header from "../../../components/header/index";
import Salao from "../../(auth)/salao/page";

export default function Profile() {
    return (
        <SafeAreaView style={styles.container}>
            <Header/>
            <Salao />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.black
    },

    text: {
        color: Colors.gold,
        fontSize: 20,
        fontWeight: 'bold',
    },
});