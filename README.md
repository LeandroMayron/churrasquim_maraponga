# Churrasquim Maraponga - App de Gestão

Este é o aplicativo de gestão de mesas e pedidos para o Churrasquim Maraponga. Ele permite que os garçons façam pedidos, enviem para a cozinha (via Supabase Realtime), fechem a conta e imprimam o recibo em uma impressora térmica Bluetooth.

## 🚀 Começando

Siga os passos abaixo para configurar o ambiente de desenvolvimento e rodar o projeto.

### Pré-requisitos

- **Node.js**: Versão 18.x ou superior.
- **Git**: Para clonar o repositório.
- **Conta na Expo**: Para utilizar os serviços de build da EAS.
- **EAS CLI**: A command-line da Expo. Instale com `npm install -g eas-cli`.
- **Celular Android**: Com modo de desenvolvedor e depuração USB ativados para testes locais.

### ⚙️ Configuração do Projeto

Este guia serve para instalar o projeto em um novo computador.

1.  **Clone o Repositório:**

    ```bash
    git clone <url-do-seu-repositorio>
    cd churrasquim_maraponga
    ```

2.  **Configure as Variáveis de Ambiente:**
    O projeto utiliza o Supabase para backend e autenticação. Crie um arquivo chamado `.env` na raiz do projeto e adicione as suas chaves.

    ```bash
    # .env
    EXPO_PUBLIC_SUPABASE_URL=SUA_URL_DO_SUPABASE
    EXPO_PUBLIC_SUPABASE_ANON_KEY=SUA_CHAVE_ANON_DO_SUPABASE
    ```

    > **Nota:** É crucial que as variáveis comecem com `EXPO_PUBLIC_` para que o Expo as torne acessíveis no aplicativo.

3.  **Limpeza (Opcional, mas recomendado):**
    Se encontrar problemas de dependência, comece com uma limpeza completa.

    ```bash
    # Remove dependências e arquivos de lock antigos
    rm -rf node_modules package-lock.json

    # Limpa o cache do NPM
    npm cache clean --force
    ```

4.  **Instale as Dependências:**
    Este comando instalará todos os pacotes listados no `package.json`.
    ```bash
    npm install
    ```

## 🛠️ Build e Desenvolvimento

Como o projeto usa bibliotecas nativas (ex: impressão Bluetooth), é necessário gerar um "Development Client".

### 1. Gerando o Development Client (APK)

Você tem duas opções:

**Opção A: Build Local (Recomendado para desenvolvimento rápido)**

Conecte seu celular Android ao computador com a depuração USB ativada e execute:

```bash
npx expo run:android
```

Este comando irá compilar o app e instalá-lo diretamente no seu dispositivo.

**Opção B: Build na Nuvem (EAS)**

Use os servidores da Expo para gerar o APK. É útil para compartilhar o app com outros testadores.

```bash
eas build -p android --profile development
```

Após a conclusão, a Expo fornecerá um link para baixar e instalar o APK.

### 2. Rodando o Servidor de Desenvolvimento

Com o Development Client instalado no celular, inicie o servidor Metro:

```bash
npx expo start --dev-client
```

Abra o aplicativo no celular. Ele se conectará automaticamente ao servidor, permitindo que você veja as alterações no código em tempo real.

## 📦 Gerando Builds para Produção

Para gerar uma versão final do aplicativo (APK para instalação direta), use o perfil `production` do EAS.

Depois, limpe o cache e rode o app novamente:

npx expo start -c

```bash
eas build -p android --profile production
```

Este comando irá gerar um APK assinado, pronto para ser distribuído. O `autoIncrement` no `eas.json` garante que o `versionCode` do Android seja incrementado a cada build.

---

## 📂 Estrutura do Projeto

Uma visão geral das pastas e arquivos mais importantes:

- **/app**: Contém todas as telas e a lógica de navegação, seguindo o padrão de roteamento baseado em arquivos do Expo Router.
  - `/(auth)`: Telas de autenticação (login, cadastro).
  - `/(painel)`: Telas acessíveis após o login.
  - `_layout.jsx`: Define o layout principal e provedores de contexto.
  - `index.jsx`: Tela inicial de login.
- **/assets**: Imagens, fontes e outros arquivos estáticos.
- **/constants**: Arquivos de configuração, como a paleta de cores (`Colors.js`).
- **/lib**: Configuração de serviços externos, como a inicialização do cliente Supabase (`supabase.js`).
- **app.json**: Arquivo de configuração principal do Expo, onde plugins e permissões são declarados.
- **eas.json**: Configuração dos perfis de build para o serviço EAS (Expo Application Services).

## 🔐 Permissões Nativas (Android)

O aplicativo solicita permissões de Bluetooth para se comunicar com a impressora térmica. A lógica de solicitação está no arquivo `src/app/(auth)/mesa/[id].jsx` e lida com as diferentes versões do Android:

- **Android 12+ (API 31+):**

  - `BLUETOOTH_SCAN`: Para descobrir impressoras próximas.
  - `BLUETOOTH_CONNECT`: Para conectar e imprimir.

- **Android 10 e 11 (API 29, 30):**

  - `ACCESS_FINE_LOCATION`: O acesso à localização era necessário para escanear dispositivos Bluetooth nessas versões.

- **Android 9 e inferior:**
  - `BLUETOOTH` e `BLUETOOTH_ADMIN`: Permissões mais antigas, já declaradas no `AndroidManifest.xml`.

As permissões são adicionadas ao `AndroidManifest.xml` durante o processo de build através do plugin customizado `./plugins/withBluetoothPermissions.js`, que está configurado no `app.json`.

## 🖨️ Funcionalidade de Impressão

A impressão é gerenciada pela biblioteca `@xyzsola/react-native-thermal-printer`.

### Fluxo de Impressão

1.  **Configurar Impressora**: No modal de impressão, o usuário pode tocar em "Configurar Impressora". O app busca dispositivos Bluetooth pareados e exibe uma lista.
2.  **Salvar Impressora**: Ao selecionar uma impressora, seu endereço MAC é salvo no `AsyncStorage` do dispositivo.
3.  **Imprimir Recibo**: Ao tocar em "Impressão", o app:
    - Lê o endereço MAC salvo.
    - Conecta-se à impressora.
    - Envia o texto formatado (com acentos e caracteres especiais removidos para evitar erros).
    - Fecha a conexão.

> **⚠️ Importante:** A impressora térmica deve estar pareada com o dispositivo Android nas configurações de Bluetooth do sistema antes de ser usada no aplicativo.

## 🔧 Solução de Problemas

### Limpando o Cache Nativo

Se encontrar erros inesperados durante o build local (`npx expo run:android`), o primeiro passo é limpar o cache do Gradle:

```bash
cd android
./gradlew clean
cd ..
npx expo run:android
```

para resolver problemas de build 
    npx expo prebuild --clean


