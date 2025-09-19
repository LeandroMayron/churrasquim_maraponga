// plugins/withBluetoothPermissions.js
const { withAndroidManifest } = require("@expo/config-plugins");

module.exports = function withBluetoothPermissions(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;

    if (!manifest["uses-permission"]) {
      manifest["uses-permission"] = [];
    }

    const addPermission = (name, extra = {}) => {
      if (
        !manifest["uses-permission"].some((p) => p.$["android:name"] === name)
      ) {
        manifest["uses-permission"].push({
          $: { "android:name": name, ...extra },
        });
      }
    };

    // Permissões de Bluetooth modernas
    addPermission("android.permission.BLUETOOTH_CONNECT", {
      "android:usesPermissionFlags": "neverForLocation",
    });
    addPermission("android.permission.BLUETOOTH_SCAN", {
      "android:usesPermissionFlags": "neverForLocation",
    });

    // Compatibilidade com versões antigas
    addPermission("android.permission.BLUETOOTH");
    addPermission("android.permission.BLUETOOTH_ADMIN");

    // Localização (necessária em algumas versões para scan)
    addPermission("android.permission.ACCESS_FINE_LOCATION", {
      "android:maxSdkVersion": "30",
    });

    return config;
  });
};
