function normalizePathValue(value) {
  return String(value ?? "")
    .trim()
    .replace(/\\/g, "/")
    .replace(/\/+/g, "/")
    .replace(/^\/+|\/+$/g, "");
}

function splitPath(path) {
  const normalized = normalizePathValue(path);
  return normalized ? normalized.split("/") : [];
}

function getPathDepth(path) {
  return splitPath(path).length;
}

function createExcludeTarget(option) {
  return {
    id: `${option.type}:${option.path}`,
    type: option.type,
    path: option.path,
    name: option.name,
    parentPath: option.parentPath,
    displayPath: option.displayPath,
  };
}

export function buildExcludeOptions(files) {
  const optionMap = new Map();

  files.forEach((file) => {
    const parts = splitPath(file.path);

    parts.forEach((part, index) => {
      const type = index === parts.length - 1 ? "file" : "folder";
      const path = parts.slice(0, index + 1).join("/");
      const parentPath = parts.slice(0, index).join("/");
      const id = `${type}:${path}`;

      if (optionMap.has(id)) return;

      const displayPath = type === "folder" ? `${path}/` : path;

      optionMap.set(id, {
        id,
        type,
        path,
        name: part,
        parentPath,
        displayPath,
        normalizedName: part.toLowerCase(),
        normalizedPath: path.toLowerCase(),
        normalizedDisplayPath: displayPath.toLowerCase(),
      });
    });
  });

  return Array.from(optionMap.values()).sort((a, b) => {
    const depthDiff = getPathDepth(a.path) - getPathDepth(b.path);
    if (depthDiff !== 0) return depthDiff;

    if (a.type !== b.type) return a.type === "folder" ? -1 : 1;

    return a.path.localeCompare(b.path);
  });
}

export function getExcludeOptionMatches(
  options,
  inputValue,
  selectedTargets,
  nameExcludes = []
) {
  const query = normalizePathValue(inputValue).toLowerCase();
  if (!query) return [];

  const nameExcludeSet = new Set(nameExcludes);

  return options
    .filter((option) => !optionIsHidden(option, selectedTargets, nameExcludeSet))
    .filter((option) => {
      return (
        option.normalizedName.includes(query) ||
        option.normalizedPath.includes(query) ||
        option.normalizedDisplayPath.includes(query)
      );
    })
    .sort((a, b) => {
      const scoreA = getExcludeOptionScore(a, query);
      const scoreB = getExcludeOptionScore(b, query);

      if (scoreA !== scoreB) return scoreA - scoreB;

      const depthDiff = getPathDepth(a.path) - getPathDepth(b.path);
      if (depthDiff !== 0) return depthDiff;

      return a.path.localeCompare(b.path);
    });
}

function optionIsHidden(option, selectedTargets, nameExcludeSet) {
  const parts = splitPath(option.path);
  if (parts.some((part) => nameExcludeSet.has(part))) return true;

  return selectedTargets.some((target) => optionMatchesTarget(option, target));
}

function optionMatchesTarget(option, target) {
  const targetPath = normalizePathValue(target.path);
  const optionPath = normalizePathValue(option.path);
  if (!targetPath || !optionPath) return false;

  if (target.type === "file") {
    return option.type === "file" && optionPath === targetPath;
  }

  return optionPath === targetPath || optionPath.startsWith(`${targetPath}/`);
}

function getExcludeOptionScore(option, query) {
  if (option.normalizedPath === query) return 0;
  if (option.normalizedDisplayPath === query) return 0;
  if (option.normalizedName === query) return 1;
  if (option.normalizedPath.startsWith(query)) return 2;
  if (option.normalizedName.startsWith(query)) return 3;
  if (option.normalizedPath.includes(`/${query}`)) return 4;
  return 5;
}

export function createExcludeTargetFromOption(option) {
  if (!option) return null;
  return createExcludeTarget(option);
}

export function filterFilesByExcludes(files, nameExcludes, customTargets) {
  const nameExcludeSet = new Set(nameExcludes);

  return files.filter((file) => {
    const path = normalizePathValue(file.path);
    const parts = splitPath(path);

    if (parts.some((part) => nameExcludeSet.has(part))) return false;

    return !customTargets.some((target) => fileMatchesTarget(path, target));
  });
}

export function getVisibleFolderPaths(files, nameExcludes, customTargets) {
  const nameExcludeSet = new Set(nameExcludes);
  const folderPathSet = new Set();

  files.forEach((file) => {
    const parts = splitPath(file.path);

    parts.slice(0, -1).forEach((_, index) => {
      const folderParts = parts.slice(0, index + 1);
      const folderPath = folderParts.join("/");

      if (folderParts.some((part) => nameExcludeSet.has(part))) return;

      const isHiddenFolder = customTargets.some((target) =>
        folderMatchesTarget(folderPath, target)
      );

      if (!isHiddenFolder) folderPathSet.add(folderPath);
    });
  });

  return Array.from(folderPathSet);
}

function fileMatchesTarget(path, target) {
  const targetPath = normalizePathValue(target.path);
  if (!targetPath) return false;

  if (target.type === "file") return path === targetPath;

  return path === targetPath || path.startsWith(`${targetPath}/`);
}

function folderMatchesTarget(path, target) {
  const targetPath = normalizePathValue(target.path);
  if (!targetPath || target.type !== "folder") return false;

  return path === targetPath || path.startsWith(`${targetPath}/`);
}

export function getExcludeTargetLabel(target) {
  return target.displayPath ?? target.path;
}
