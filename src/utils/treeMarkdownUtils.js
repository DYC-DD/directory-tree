export function buildFileTree(files, folderPaths = []) {
  const root = {};

  let rootFolderName = "directory_tree";
  if (files.length > 0) {
    const firstPath = files[0].path;
    const parts = firstPath.split("/");
    if (parts.length > 1) rootFolderName = parts[0];
  } else if (folderPaths.length > 0) {
    rootFolderName = folderPaths[0].split("/")[0] || rootFolderName;
  }

  for (const folderPath of folderPaths) {
    const parts = folderPath.split("/").filter(Boolean);
    let current = root;

    parts.forEach((part) => {
      const key = `${part}/`;
      current[key] ??= {};
      current = current[key];
    });
  }

  for (const file of files) {
    const parts = file.path.split("/");
    let current = root;

    parts.forEach((part, i) => {
      const isFolder = i !== parts.length - 1;
      const key = isFolder ? `${part}/` : part;

      if (isFolder) {
        current[key] ??= {};
        current = current[key];
        return;
      }

      current[key] = null;
    });
  }

  return { tree: root, rootFolderName };
}

export function renderTreeMarkdown(tree, indent = "", isRoot = true) {
  const lines = renderTreeMarkdownLines(tree, indent, isRoot);
  return lines.length > 0
    ? `${lines.map((line) => line.text).join("\n")}\n`
    : "";
}

export function renderTreeMarkdownLines(
  tree,
  indent = "",
  isRoot = true,
  parentPath = ""
) {
  const lines = [];
  const entries = Object.entries(tree).sort(([a], [b]) => {
    const isDirA = tree[a] !== null && typeof tree[a] === "object";
    const isDirB = tree[b] !== null && typeof tree[b] === "object";

    if (isDirA !== isDirB) return isDirA ? -1 : 1;
    return a.localeCompare(b);
  });

  entries.forEach(([key, value], idx) => {
    const isLast = idx === entries.length - 1;
    const prefix = isRoot ? "" : indent + (isLast ? "└── " : "├── ");
    const isFolder = value !== null && typeof value === "object";
    const name = isFolder ? key.replace(/\/$/, "") : key;
    const path = parentPath ? `${parentPath}/${name}` : name;

    lines.push({
      text: `${prefix}${key}`,
      target: {
        id: `${isFolder ? "folder" : "file"}:${path}`,
        type: isFolder ? "folder" : "file",
        path,
        name,
        parentPath,
        displayPath: isFolder ? `${path}/` : path,
      },
    });

    if (isFolder) {
      const deeperIndent = isRoot ? "" : indent + (isLast ? "    " : "│   ");
      lines.push(...renderTreeMarkdownLines(value, deeperIndent, false, path));
    }
  });

  return lines;
}

export function generateFolderTreeMarkdown(files, { folderPaths = [] } = {}) {
  const sorted = [...files].sort((a, b) => {
    const aParts = a.path.split("/");
    const bParts = b.path.split("/");
    return aParts.length === bParts.length
      ? a.path.localeCompare(b.path)
      : aParts.length - bParts.length;
  });
  const sortedFolderPaths = [...folderPaths].sort((a, b) => {
    const aParts = a.split("/");
    const bParts = b.split("/");
    return aParts.length === bParts.length
      ? a.localeCompare(b)
      : aParts.length - bParts.length;
  });

  const { tree, rootFolderName } = buildFileTree(sorted, sortedFolderPaths);
  const lines = renderTreeMarkdownLines(tree);
  const markdown =
    lines.length > 0 ? `${lines.map((line) => line.text).join("\n")}\n` : "";

  return { markdown, rootFolderName, lines };
}
