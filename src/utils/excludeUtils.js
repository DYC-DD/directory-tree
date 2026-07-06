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
    let parentPath = "";

    parts.forEach((part, index) => {
      const type = index === parts.length - 1 ? "file" : "folder";
      const path = parentPath ? `${parentPath}/${part}` : part;
      const id = `${type}:${path}`;

      if (!optionMap.has(id)) {
        const displayPath = type === "folder" ? `${path}/` : path;

        optionMap.set(id, {
          id,
          type,
          path,
          name: part,
          parentPath,
          displayPath,
          depth: index + 1,
          normalizedName: part.toLowerCase(),
          normalizedPath: path.toLowerCase(),
          normalizedDisplayPath: displayPath.toLowerCase(),
        });
      }

      parentPath = path;
    });
  });

  return Array.from(optionMap.values()).sort((a, b) => {
    const depthDiff = a.depth - b.depth;
    if (depthDiff !== 0) return depthDiff;

    if (a.type !== b.type) return a.type === "folder" ? -1 : 1;

    return a.path.localeCompare(b.path);
  });
}

export function getExcludeOptionMatches(
  options,
  inputValue,
  selectedTargets,
  nameExcludes = [],
  limit = Infinity
) {
  const query = normalizePathValue(inputValue).toLowerCase();
  if (!query) return [];

  const nameExcludeSet = new Set(nameExcludes);
  const normalizedTargets = normalizeExcludeTargets(selectedTargets);
  const limitedMatches = Number.isFinite(limit) && limit > 0;
  const matches = [];

  options.forEach((option) => {
    if (optionIsHidden(option, normalizedTargets, nameExcludeSet)) return;

    const isMatch =
      option.normalizedName.includes(query) ||
      option.normalizedPath.includes(query) ||
      option.normalizedDisplayPath.includes(query);

    if (!isMatch) return;

    const match = {
      option,
      score: getExcludeOptionScore(option, query),
      depth: option.depth ?? getPathDepth(option.path),
    };

    if (!limitedMatches) {
      matches.push(match);
      return;
    }

    insertLimitedMatch(matches, match, limit);
  });

  if (!limitedMatches) matches.sort(compareOptionMatches);

  return matches.map((match) => match.option);
}

function optionIsHidden(option, selectedTargets, nameExcludeSet) {
  const parts = splitPath(option.path);
  if (parts.some((part) => nameExcludeSet.has(part))) return true;

  return selectedTargets.some((target) => optionMatchesTarget(option, target));
}

function optionMatchesTarget(option, target) {
  const targetPath = target.path;
  const optionPath = normalizePathValue(option.path);
  if (!targetPath || !optionPath) return false;

  if (target.type === "file") {
    return option.type === "file" && optionPath === targetPath;
  }

  return optionPath === targetPath || optionPath.startsWith(`${targetPath}/`);
}

function normalizeExcludeTargets(targets = []) {
  return targets
    .map((target) => ({
      ...target,
      path: normalizePathValue(target.path),
    }))
    .filter((target) => target.path);
}

function insertLimitedMatch(matches, match, limit) {
  const insertIndex = matches.findIndex(
    (current) => compareOptionMatches(match, current) < 0
  );

  if (insertIndex === -1) {
    if (matches.length < limit) matches.push(match);
    return;
  }

  matches.splice(insertIndex, 0, match);
  if (matches.length > limit) matches.pop();
}

function compareOptionMatches(a, b) {
  if (a.score !== b.score) return a.score - b.score;

  const depthDiff = a.depth - b.depth;
  if (depthDiff !== 0) return depthDiff;

  return a.option.path.localeCompare(b.option.path);
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
  const normalizedTargets = normalizeExcludeTargets(customTargets);

  return files.filter((file) => {
    const path = normalizePathValue(file.path);
    const parts = path ? path.split("/") : [];

    if (parts.some((part) => nameExcludeSet.has(part))) return false;

    return !normalizedTargets.some((target) => fileMatchesTarget(path, target));
  });
}

export function getVisibleFolderPaths(files, nameExcludes, customTargets) {
  const nameExcludeSet = new Set(nameExcludes);
  const normalizedTargets = normalizeExcludeTargets(customTargets);
  const folderPathSet = new Set();

  files.forEach((file) => {
    const parts = splitPath(file.path);
    let folderPath = "";

    for (let index = 0; index < parts.length - 1; index += 1) {
      const part = parts[index];
      folderPath = folderPath ? `${folderPath}/${part}` : part;

      if (nameExcludeSet.has(part)) break;

      const isHiddenFolder = normalizedTargets.some((target) =>
        folderMatchesTarget(folderPath, target)
      );

      if (!isHiddenFolder) folderPathSet.add(folderPath);
    }
  });

  return Array.from(folderPathSet);
}

function fileMatchesTarget(path, target) {
  const targetPath = target.path;
  if (!targetPath) return false;

  if (target.type === "file") return path === targetPath;

  return path === targetPath || path.startsWith(`${targetPath}/`);
}

function folderMatchesTarget(path, target) {
  const targetPath = target.path;
  if (!targetPath || target.type !== "folder") return false;

  return path === targetPath || path.startsWith(`${targetPath}/`);
}

export function getExcludeTargetLabel(target) {
  return target.displayPath ?? target.path;
}
