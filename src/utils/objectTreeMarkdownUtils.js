// ===== 將 primitive 轉成可讀字串 =====
function formatPrimitive(value) {
  if (typeof value === "string") return `"${value}"`;
  if (value === null) return "null";
  return String(value);
}

// ===== 以 JSON/YAML 解析後的物件生成 tree markdown =====
export function renderObjectTreeMarkdown(
  data,
  { indent = "", isRoot = true, rootName = "root", mode = "json" } = {}
) {
  let md = "";

  if (isRoot) {
    md += `${rootName}.${mode}\n`;
  }

  if (Array.isArray(data)) {
    data.forEach((item, index) => {
      const isLast = index === data.length - 1;
      const prefix = indent + (isLast ? "└── " : "├── ");

      if (typeof item === "object" && item !== null) {
        md += `${prefix}[${index}]\n`;
        const deeperIndent = indent + (isLast ? "    " : "│   ");
        md += renderObjectTreeMarkdown(item, {
          indent: deeperIndent,
          isRoot: false,
          rootName,
          mode,
        });
      } else {
        md += `${prefix}[${index}]: ${formatPrimitive(item)}\n`;
      }
    });

    return md;
  }

  if (typeof data === "object" && data !== null) {
    const entries = Object.entries(data);

    entries.forEach(([key, value], index) => {
      const isLast = index === entries.length - 1;
      const prefix = indent + (isLast ? "└── " : "├── ");

      if (typeof value === "object" && value !== null) {
        md += `${prefix}${key}\n`;
        const deeperIndent = indent + (isLast ? "    " : "│   ");
        md += renderObjectTreeMarkdown(value, {
          indent: deeperIndent,
          isRoot: false,
          rootName,
          mode,
        });
      } else {
        md += `${prefix}${key}: ${formatPrimitive(value)}\n`;
      }
    });

    return md;
  }

  md += indent + formatPrimitive(data) + "\n";
  return md;
}
