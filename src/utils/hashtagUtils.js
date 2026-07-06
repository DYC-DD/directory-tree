export const HASHTAG_MODES = {
  OFF: "off",
  ALL: "all",
  FILES: "files",
};

export function addHashtagsToTreeMarkdown(
  markdown,
  { mode = HASHTAG_MODES.ALL } = {}
) {
  const lines = markdown.split("\n");
  const treeLineInfos = lines
    .map((line, index) => getTreeLineInfo(line, index))
    .filter(Boolean);

  if (treeLineInfos.length === 0) return markdown;

  const targetLineIndexes =
    mode === HASHTAG_MODES.FILES
      ? getFileOnlyTargetLineIndexes(treeLineInfos)
      : treeLineInfos.map(({ index }) => index);

  if (targetLineIndexes.length === 0) return markdown;

  const maxLineLength = Math.max(
    ...treeLineInfos.map(({ index }) => lines[index].length)
  );
  const hashColumn = maxLineLength + 2;

  targetLineIndexes.forEach((index) => {
    lines[index] = `${lines[index].padEnd(hashColumn, " ")}#`;
  });

  return lines.join("\n");
}

function getTreeLineInfo(line, index) {
  const branchIndex = getBranchIndex(line);
  if (branchIndex === -1) return null;

  return {
    index,
    depth: Math.floor(branchIndex / 4),
  };
}

function getBranchIndex(line) {
  const middleBranchIndex = line.indexOf("├── ");
  const lastBranchIndex = line.indexOf("└── ");

  if (middleBranchIndex === -1) return lastBranchIndex;
  if (lastBranchIndex === -1) return middleBranchIndex;
  return Math.min(middleBranchIndex, lastBranchIndex);
}

function getFileOnlyTargetLineIndexes(treeLineInfos) {
  return treeLineInfos
    .filter((lineInfo, position) =>
      isLeafTreeLine(treeLineInfos, lineInfo, position)
    )
    .map(({ index }) => index);
}

function isLeafTreeLine(treeLineInfos, lineInfo, position) {
  const nextLineInfo = treeLineInfos[position + 1];
  return !nextLineInfo || nextLineInfo.depth <= lineInfo.depth;
}
