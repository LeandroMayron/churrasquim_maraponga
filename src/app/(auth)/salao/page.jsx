import { View, StyleSheet} from "react-native";
import Colors from "@/constants/Colors";


const Salao = () => {
    return (
      <View style={style.container}>

        <View style={style.mesas}>
            
        </View>

        <View style={style.mesas}>
            
        </View>

        <View style={style.mesas}>
            
        </View>

        <View style={style.mesas}>
            
        </View>

        <View style={style.mesas}>
            
        </View>

        <View style={style.mesas}>
            
        </View>

        <View style={style.mesas}>
            
        </View>

        <View style={style.mesas}>
            
        </View>

        <View style={style.mesas}>
            
        </View>

        <View style={style.mesas}>
            
        </View>

      </View>
    );
}

const style = StyleSheet.create({
    container: {
        backgroundColor: Colors.black,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        gap: 10,
    },

    mesas: {
        width: 60,
        height: 60,
        marginTop: 10,
        backgroundColor: Colors.red,
      }
})

export default Salao;