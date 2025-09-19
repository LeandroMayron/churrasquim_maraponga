#!/bin/bash
echo "⚙️ Forçando Gradle 8.13..."
GRADLE_WRAPPER=android/gradle/wrapper/gradle-wrapper.properties
sed -i "s#https://services.gradle.org/distributions/gradle-.*-all.zip#https://services.gradle.org/distributions/gradle-8.13-all.zip#g" $GRADLE_WRAPPER

