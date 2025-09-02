import { Image, StyleSheet } from "react-native";

const Banner = () => {
  return (
    <Image
      style={styles.logo}
      source={require("../../../assets/images/logo.png")}
      resizeMode="contain"
    />
  );
};

const styles = StyleSheet.create({
  logo: {
    width: 250,
    height: 150,
    marginBottom: 20,
  },
});
export default Banner;
