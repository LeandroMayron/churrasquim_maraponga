#!/bin/bash

# Ajustar Gradle Wrapper
echo "⚙️ Forçando Gradle 8.13..."
sed -i 's#https://services.gradle.org/distributions/gradle-.*-all.zip#https://services.gradle.org/distributions/gradle-8.13-all.zip#g' android/gradle/wrapper/gradle-wrapper.properties

# Forçar Java 17 e AndroidX no gradle.properties
echo "⚙️ Configurando Java 17 e AndroidX..."
grep -qxF 'ORG_GRADLE_JAVA_HOME=/usr/lib/jvm/java-17-openjdk' android/gradle.properties || echo 'ORG_GRADLE_JAVA_HOME=/usr/lib/jvm/java-17-openjdk' >> android/gradle.properties
grep -qxF 'android.useAndroidX=true' android/gradle.properties || echo 'android.useAndroidX=true' >> android/gradle.properties
grep -qxF 'android.enableJetifier=true' android/gradle.properties || echo 'android.enableJetifier=true' >> android/gradle.properties

# Atualizar Kotlin no build.gradle
echo "⚙️ Atualizando Kotlin para 2.0.21..."
sed -i 's/kotlinVersion = ".*"/kotlinVersion = "2.0.21"/g' android/build.gradle

# Ajustar SDK no app/build.gradle
echo "⚙️ Ajustando SDK versions para 35..."
sed -i 's/compileSdkVersion .*/compileSdkVersion 35/' android/app/build.gradle
sed -i 's/targetSdkVersion .*/targetSdkVersion 35/' android/app/build.gradle
sed -i '/buildToolsVersion/d' android/app/build.gradle

echo "✅ Correções de ambiente de build aplicadas!"
