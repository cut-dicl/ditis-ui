import { Content } from "../../renderer/components/ConfigForm/FormInput";
const {
  getDefaultConfig,
  getDefaultOptimizerConfig,
} = require("../service/configurations");

export async function convertJSON_Properties(obj: any):Promise<string> {
  let properties = "";
  Object.entries(obj).forEach((item: [string, Array<Content>]) => {
    item[1].forEach((confValue: Content) => {
      properties = properties.concat(
        confValue.key + "=" + confValue.defaultValue + "\n"
      );
    });
  });

  return properties;
}

export async function convertProperties_Json(
  propertiesString,
  configType,
  javaPath
): Promise<any> {
  const defaultConfig =
    configType === "Storage"
      ? await getDefaultConfig(javaPath)
      : await getDefaultOptimizerConfig(javaPath);
  const allProperties: string[] = propertiesString.toString().split(/\r?\n/);

  const filteredProperties = allProperties.filter(
    (item) => !item.includes("#") && item.length > 0
  );

  filteredProperties.forEach((propertySetting) => {
    const keyValue = propertySetting.split("=");
    Object.entries(defaultConfig.descriptors).forEach(
      (item: [string, Array<Content>]) => {
        item[1].forEach((config: Content) => {
          if (config.key === keyValue[0].trim()) {
            config.defaultValue = keyValue[1].trim();
          }
        });
      }
    );
  });

  return defaultConfig;
}

export async function convertJSON_Properties_Variance(obj: any):Promise<string> {
  console.log(Object.entries(obj));
  let properties = "";
  Object.entries(obj).forEach(
    (item: [string, Array<{ key: string; value: string }>]) => {
      item[1].forEach((confValue: { key: string; value: string }) => {
        properties = properties.concat(
          confValue.key + "=" + confValue.value + "\n"
        );
      });
    }
  );

  return properties;
}

export async function convertProperties_Json_Variance(
  protpertiesString
): Promise<any> {
  const allProperties: string[] = protpertiesString.toString().split("\n");
  const test = [];
  const regex = /[\!@#\$%\^\&*\)\(+=_-]/

  allProperties.forEach((propertySetting) => {
    const keyValue = propertySetting.split("=");
    if(!regex.test(keyValue[0])){
      if (keyValue[0] !== "" && keyValue[1] !== "")
        test.push({ key: keyValue[0].trim(), value: keyValue[1] });
    }
  });

  console.log(test)
  return test;
}