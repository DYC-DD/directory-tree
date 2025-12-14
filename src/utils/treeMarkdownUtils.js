// ===== 將 bytes 格式化成人類可讀大小 =====
export function formatBytes(bytes) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

// ===== 依照路徑陣列建 tree（資料夾用 key/，檔案用 key） =====
export function buildFileTree(files) {
  const root = {};

  // 推斷 root folder name（取第一個檔案路徑的第一段）
  let rootFolderName = "directory_tree";
  if (files.length > 0) {
    const firstPath = files[0].path;
    const parts = firstPath.split("/");
    if (parts.length > 1) rootFolderName = parts[0];
  }

  for (const file of files) {
    const parts = file.path.split("/");
    let current = root;

    parts.forEach((part, i) => {
      const isFolder = i !== parts.length - 1;

      // 資料夾用 "name/" 當 key，檔案用 "name"
      const key = isFolder ? `${part}/` : part;

      if (!current[key]) {
        // 檔案節點存 size；資料夾節點存物件
        current[key] = isFolder ? {} : { size: file.size };
      }

      current = current[key];
    });
  }

  return { tree: root, rootFolderName };
}

// ===== 遞迴計算資料夾總容量 =====
export function computeFolderSizes(node) {
  let sum = 0;

  Object.keys(node).forEach((childKey) => {
    const child = node[childKey];

    // 檔案節點：有 size
    if (child && typeof child === "object" && "size" in child) {
      sum += child.size;
      return;
    }

    // 資料夾節點：遞迴
    if (child && typeof child === "object") {
      const folderSize = computeFolderSizes(child);

      Object.defineProperty(child, "totalSize", {
        value: folderSize,
        enumerable: false,
        writable: true,
      });

      sum += folderSize;
    }
  });

  return sum;
}

// ===== 將 tree 轉成目錄樹 markdown =====
export function renderTreeMarkdown(tree, options, indent = "", isRoot = true) {
  const { showFileSize } = options;

  let md = "";

  // 排序：資料夾優先，之後字母序
  const entries = Object.entries(tree).sort(([a], [b]) => {
    const isDirA =
      tree[a] !== null && typeof tree[a] === "object" && !("size" in tree[a]);
    const isDirB =
      tree[b] !== null && typeof tree[b] === "object" && !("size" in tree[b]);

    if (isDirA !== isDirB) return isDirA ? -1 : 1;
    return a.localeCompare(b);
  });

  entries.forEach(([key, value], idx) => {
    const isLast = idx === entries.length - 1;

    const prefix = isRoot ? "" : indent + (isLast ? "└── " : "├── ");

    let sizeInfo = "";
    if (showFileSize && value && typeof value === "object" && "size" in value) {
      sizeInfo = ` (${formatBytes(value.size)})`;
    }
    if (
      showFileSize &&
      value &&
      typeof value === "object" &&
      !("size" in value) &&
      value.totalSize !== undefined
    ) {
      sizeInfo = ` (${formatBytes(value.totalSize)})`;
    }

    md += `${prefix}${key}${sizeInfo}\n`;

    if (value && typeof value === "object" && !("size" in value)) {
      const deeperIndent = isRoot ? "" : indent + (isLast ? "    " : "│   ");
      md += renderTreeMarkdown(value, options, deeperIndent, false);
    }
  });

  return md;
}

// ===== folder 模式：把 files -> markdown（包含排序、建 tree、算 folder size、render） =====
export function generateFolderTreeMarkdown(files, options) {
  const sorted = [...files].sort((a, b) => {
    const aParts = a.path.split("/");
    const bParts = b.path.split("/");
    return aParts.length === bParts.length
      ? a.path.localeCompare(b.path)
      : aParts.length - bParts.length;
  });

  const { tree, rootFolderName } = buildFileTree(sorted);

  // 計算資料夾 totalSize
  computeFolderSizes(tree);

  // render markdown
  const markdown = renderTreeMarkdown(tree, options);

  return { markdown, rootFolderName };
}
