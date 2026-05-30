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
  let md = "";

  const entries = Object.entries(tree).sort(([a], [b]) => {
    const isDirA = tree[a] !== null && typeof tree[a] === "object";
    const isDirB = tree[b] !== null && typeof tree[b] === "object";

    if (isDirA !== isDirB) return isDirA ? -1 : 1;
    return a.localeCompare(b);
  });

  entries.forEach(([key, value], idx) => {
    const isLast = idx === entries.length - 1;
    const prefix = isRoot ? "" : indent + (isLast ? "└── " : "├── ");

    md += `${prefix}${key}\n`;

    if (value !== null && typeof value === "object") {
      const deeperIndent = isRoot ? "" : indent + (isLast ? "    " : "│   ");
      md += renderTreeMarkdown(value, deeperIndent, false);
    }
  });

  return md;
}

export function generateFolderTreeMarkdown(files) {
  const sorted = [...files].sort((a, b) => {
    const aParts = a.path.split("/");
    const bParts = b.path.split("/");
    return aParts.length === bParts.length
      ? a.path.localeCompare(b.path)
      : aParts.length - bParts.length;
  });

  const { tree, rootFolderName } = buildFileTree(sorted);
  const markdown = renderTreeMarkdown(tree);

  return { markdown, rootFolderName };
}
