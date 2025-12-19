// 移除 JSON 檔名副檔名（.json）
export function getJsonBaseName(filename) {
  return filename.replace(/\.json$/i, "");
}

// 移除 YAML 檔名副檔名（.yaml / .yml）
export function getYamlBaseName(filename) {
  return filename.replace(/\.(yaml|yml)$/i, "");
}
