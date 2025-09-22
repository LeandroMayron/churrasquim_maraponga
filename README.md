Churrasquim_Maraponga
npx expo start --dev-client

### ⚙️ Configurando o Projeto do Zero

Este guia serve para instalar o projeto em um novo computador, garantindo que as dependências e configurações de build funcionem corretamente.

1.  **Clone o Repositório:**
    ```bash
    git clone <url-do-seu-repositorio>
    cd churrasquim_maraponga
    ```

2.  **Limpeza (Opcional, mas recomendado):**
    Se você encontrar problemas de dependência, comece com uma limpeza completa.
    ```bash
    # Remove dependências e arquivos de lock antigos
    rm -rf node_modules package-lock.json

    # Limpa o cache do npm
    npm cache clean --force
    ```

3.  **Instale as Dependências:**
    Este comando irá instalar todos os pacotes listados no `package.json`.
    ```bash
    npm install
    ```

4.  **Gere uma Build de Desenvolvimento (APK):**
    Para testar em um celular Android, você precisa gerar um "Dev Client" que contenha as bibliotecas nativas (como a de impressão Bluetooth).
    ```bash
    # Conecte seu celular com a depuração USB ativada e rode:
    npx expo run:android
    ```
    Se preferir usar os serviços da Expo para gerar o APK na nuvem:
    ```bash
    eas build -p android --profile development
    ```
    Após o build, instale o APK gerado no seu celular.

5.  **Inicie o Servidor de Desenvolvimento:**
    Com o Dev Client instalado no celular, use este comando para rodar o projeto e ver as alterações em tempo real.
    ```bash
    npx expo start --dev-client
    ```

📱 Rodar no Android

Conecte seu celular com modo desenvolvedor ativado

Execute:

npx expo run:android


Ou:

npx expo start --dev-client


E abra o app no seu celular via Expo Dev Client.

### 🔐 Permissões Android (Já configurado)

O código já solicita as permissões de Bluetooth necessárias para Android 10, 11, 12 e superiores.

🖨️ Impressão Bluetooth

A função `printCupom()` está integrada no componente da mesa e usa a biblioteca `@xyzsola/react-native-thermal-printer`.

O fluxo é:
1.  **Configurar Impressora**: Busca por impressoras Bluetooth e salva o endereço MAC da primeira encontrada.
2.  **Impressão**: Usa o MAC salvo para conectar, imprimir o cupom e desconectar, liberando a impressora para outros aparelhos.

⚠️ Certifique-se que o dispositivo está pareado com a impressora e que o Bluetooth está ligado.

🧽 Limpar o projeto (se der erro)
cd android
./gradlew clean
cd ..
npx expo run:android

criar novo apk internal distribution
  eas build -p android --profile preview
