Churrasquim_Maraponga
npx expo start --dev-client

1. Ativar suporte nativo (bare workflow)

Se ainda não estiver no bare workflow:

npx expo prebuild

2. Atualizar android/build.gradle

Abra android/build.gradle e adicione:

allprojects {
  repositories {
    maven { url 'https://www.jitpack.io' }
    // outros...
  }
}


Verifique também se o kotlinVersion, compileSdkVersion, etc., estão definidos corretamente no bloco ext {}.

Exemplo:

buildscript {
  ext {
    buildToolsVersion = "33.0.0"
    minSdkVersion = 21
    compileSdkVersion = 33
    targetSdkVersion = 33
    kotlinVersion = "1.8.0"
  }
  ...
}

🔌 Instalar Pacote da Impressora
yarn add react-native-bluetooth-escpos-printer
# ou
npm install react-native-bluetooth-escpos-printer


Importante: Esse pacote não funciona com Expo Go. Você precisa de um Dev Client.

🧪 Instalar dependências nativas (autolink)
npx expo run:android


Ou, para abrir no seu cliente customizado:

npx expo start --dev-client

🔄 Caso tenha problemas com BluetoothManager null

Certifique-se de que o módulo foi corretamente autolinkado e que o projeto foi reconstruído com:

cd android
./gradlew clean
cd ..
npx expo run:android

📱 Rodar no Android

Conecte seu celular com modo desenvolvedor ativado

Execute:

npx expo run:android


Ou:

npx expo start --dev-client


E abra o app no seu celular via Expo Dev Client.

🔐 Permissões Android

Verifique se seu AndroidManifest.xml possui as permissões necessárias:

<uses-permission android:name="android.permission.BLUETOOTH"/>
<uses-permission android:name="android.permission.BLUETOOTH_ADMIN"/>
<uses-permission android:name="android.permission.BLUETOOTH_CONNECT"/>
<uses-permission android:name="android.permission.BLUETOOTH_SCAN"/>
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION"/>


Para Android 12+, BLUETOOTH_CONNECT e BLUETOOTH_SCAN são obrigatórios.

🖨️ Impressão Bluetooth

A função imprimirReciboBluetooth() já está integrada no componente da mesa.

Ela imprime:

Nome da empresa

CNPJ e endereço

Data e hora

Itens do pedido

Total

Forma de pagamento

⚠️ Certifique-se que o dispositivo está pareado com a impressora e que o Bluetooth está ligado.

🧩 Outras Dependências do Projeto
# Se não estiverem instaladas:
yarn add @supabase/supabase-js
yarn add expo-router
yarn add react-native-svg
yarn add react-native-gesture-handler react-native-reanimated

🧽 Limpar o projeto (se der erro)
cd android
./gradlew clean
cd ..
npx expo run:android
