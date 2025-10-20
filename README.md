# Churrasquim Maraponga - App de Gestão

Este é o aplicativo de gestão de mesas e pedidos para o Churrasquim Maraponga. Ele permite que os garçons façam pedidos, enviem para a cozinha (via Supabase Realtime), fechem a conta, imprimam o recibo em uma impressora térmica Bluetooth e gerem QR Codes para pagamento via PIX.

## 🚀 Começando

Siga os passos abaixo para configurar o ambiente de desenvolvimento e rodar o projeto.

### Pré-requisitos

* **Node.js**: Versão 18.x ou superior.
* **Git**: Para clonar o repositório.
* **Conta na Expo**: Para utilizar os serviços de build da EAS.
* **EAS CLI**: Instale com `npm install -g eas-cli`.
* **Celular Android**: Com modo de desenvolvedor e depuração USB ativados para testes locais.

### ⚙️ Configuração do Projeto

1. **Clone o Repositório:**

```bash
git clone <url-do-seu-repositorio>
cd churrasquim_maraponga
```

2. **Configure as Variáveis de Ambiente:**

Crie `.env` na raiz do projeto:

```bash
EXPO_PUBLIC_SUPABASE_URL=SUA_URL_DO_SUPABASE
EXPO_PUBLIC_SUPABASE_ANON_KEY=SUA_CHAVE_ANON_DO_SUPABASE
EXPO_PUBLIC_PIX_KEY=SUA_CHAVE_PIX
```

> **Nota:** Todas as variáveis começam com `EXPO_PUBLIC_` para que o Expo as torne acessíveis no app.

3. **Limpeza (Opcional, mas recomendado):**

```bash
rm -rf node_modules package-lock.json
npm cache clean --force
```

4. **Instale as Dependências:**

```bash
npm install
```

## 🛠️ Build e Desenvolvimento

### Gerando o Development Client (APK)

**Opção A: Local**

```bash
npx expo run:android
```

**Opção B: Nuvem (EAS)**

```bash
eas build -p android --profile development
```

### Rodando o Servidor de Desenvolvimento

```bash
npx expo start --dev-client
```

O app se conecta automaticamente ao servidor Metro.

## 📦 Builds para Produção e Preview

Perfis no `eas.json`:

| Perfil          | Uso                       | Canal OTA | Build Type    |
| --------------- | ------------------------- | --------- | ------------- |
| **development** | Desenvolvimento interno   | N/A       | APK           |
| **preview**     | Testes internos (QR, PIX) | `preview` | APK           |
| **production**  | Versão final para lojas   | `prod`    | AAB / release |

**Comandos principais:**

```bash
# Preview
eas build -p android --profile preview
npx expo publish --release-channel preview

# Produção
eas build -p android --profile production
npx expo publish --release-channel prod
```

## 📂 Estrutura do Projeto

* **/app**: Telas e navegação com Expo Router.

  * `/(auth)`: Login e cadastro.
  * `/(painel)`: Telas internas.
  * `_layout.jsx`: Layout principal.
  * `index.jsx`: Tela inicial.
* **/assets**: Imagens, fontes e ícones.
* **/constants**: Configurações, cores (`Colors.js`).
* **/lib**: Serviços externos (`supabase.js`).
* **app.json**: Configuração do Expo e plugins.
* **eas.json**: Perfis de build EAS.

## 🔐 Permissões Nativas (Android)

* **Android 12+ (API 31+):** `BLUETOOTH_SCAN`, `BLUETOOTH_CONNECT`
* **Android 10-11 (API 29-30):** `ACCESS_FINE_LOCATION`
* **Android 9 ou inferior:** `BLUETOOTH`, `BLUETOOTH_ADMIN`

As permissões são adicionadas via plugin `./plugins/withBluetoothPermissions.js`.

## 🖨️ Impressão

Usa `@xyzsola/react-native-thermal-printer`:

1. Configurar impressora Bluetooth.
2. Salvar endereço MAC no AsyncStorage.
3. Imprimir recibo (remove acentos para evitar erros).

## 💳 PIX e QR Code

* Insira sua chave PIX em `.env`:

```bash
EXPO_PUBLIC_PIX_KEY=SUA_CHAVE_PIX
```

* O app gera automaticamente o QR Code abaixo do total da conta.
* Pode ser usado diretamente na tela ou impresso junto com o recibo.

## 🔧 Solução de Problemas

**Limpeza de cache e rebuild local:**

```bash
cd android
./gradlew clean
cd ..
npx expo prebuild --clean
npx expo run:android
```
App Leandro Mayron