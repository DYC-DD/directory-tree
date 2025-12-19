const KIB = 1024n;
const MIB = KIB * 1024n;
const GIB = MIB * 1024n;

function toNonNegativeBigInt(bytes) {
  if (typeof bytes === "bigint") return bytes < 0n ? 0n : bytes;

  if (typeof bytes !== "number" || !Number.isFinite(bytes)) return 0n;

  const v = Math.floor(bytes);
  return v <= 0 ? 0n : BigInt(v);
}

function divRound1Decimal(bytes, unit) {
  const scaled = (bytes * 10n + unit / 2n) / unit;
  return {
    intPart: scaled / 10n,
    decPart: scaled % 10n,
  };
}

export function formatBytes(bytes) {
  const b = toNonNegativeBigInt(bytes);

  if (b === 0n) return "0 B";
  if (b < KIB) return `${b.toString()} B`;

  if (b < MIB) {
    const { intPart, decPart } = divRound1Decimal(b, KIB);
    return `${intPart.toString()}.${decPart.toString()} KB`;
  }

  if (b < GIB) {
    const { intPart, decPart } = divRound1Decimal(b, MIB);
    return `${intPart.toString()}.${decPart.toString()} MB`;
  }

  const { intPart, decPart } = divRound1Decimal(b, GIB);
  return `${intPart.toString()}.${decPart.toString()} GB`;
}

export function buildFileTree(files) {
  const root = {};

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

      const key = isFolder ? `${part}/` : part;

      if (!current[key]) {
        if (isFolder) {
          current[key] = {};
        } else {
          current[key] = { size: toNonNegativeBigInt(file.size) };
        }
      }

      current = current[key];
    });
  }

  return { tree: root, rootFolderName };
}

export function computeFolderSizes(node) {
  let sum = 0n;

  Object.keys(node).forEach((childKey) => {
    const child = node[childKey];

    if (child && typeof child === "object" && "size" in child) {
      sum += toNonNegativeBigInt(child.size);
      return;
    }

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

export function renderTreeMarkdown(tree, options, indent = "", isRoot = true) {
  const { showFileSize } = options;
  let md = "";

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

export function generateFolderTreeMarkdown(files, options) {
  const sorted = [...files].sort((a, b) => {
    const aParts = a.path.split("/");
    const bParts = b.path.split("/");
    return aParts.length === bParts.length
      ? a.path.localeCompare(b.path)
      : aParts.length - bParts.length;
  });

  const { tree, rootFolderName } = buildFileTree(sorted);

  computeFolderSizes(tree);

  const markdown = renderTreeMarkdown(tree, options);

  return { markdown, rootFolderName };
}
