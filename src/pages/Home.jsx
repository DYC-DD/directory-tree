import { toPng } from "html-to-image";
import YAML from "js-yaml";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import "../styles/Home.css";

import ExcludeControls from "../components/Home/ExcludeControls";
import HiddenFileInput from "../components/Home/HiddenFileInput";
import OutputPanel from "../components/Home/OutputPanel";
import ScreenshotWrapper from "../components/Home/ScreenshotWrapper";
import PixelCard from "../components/PixelCard/PixelCard";
import RotatingText from "../components/RotatingText/RotatingText";
import ScrambledText from "../components/ScrambledText/ScrambledText";

import { getJsonBaseName, getYamlBaseName } from "../utils/fileNameUtils";
import { renderObjectTreeMarkdown } from "../utils/objectTreeMarkdownUtils";
import { generateFolderTreeMarkdown } from "../utils/treeMarkdownUtils";
import {
  buildExcludeOptions,
  createExcludeTargetFromOption,
  filterFilesByExcludes,
  getExcludeOptionMatches,
  getVisibleFolderPaths,
} from "../utils/excludeUtils";

function Home() {
  // i18n
  const { t } = useTranslation();

  // 模式偵測與模式控制
  const [detectedMode, setDetectedMode] = useState(null);
  const effectiveMode = detectedMode ?? "auto";

  // 主要輸出與資料來源
  const [markdown, setMarkdown] = useState("");
  const [files, setFiles] = useState([]);
  const [folderTreeLines, setFolderTreeLines] = useState([]);

  // 預設排除項目
  const [excludedItems, setExcludedItems] = useState({
    ".git": false,
    ".DS_Store": false,
    ".venv": false,
    node_modules: false,
  });
  const [customExcludeTargets, setCustomExcludeTargets] = useState([]);

  // 自訂排除輸入輔助
  const [inputValue, setInputValue] = useState("");
  const [excludeOptions, setExcludeOptions] = useState([]);
  const [highlightIndex, setHighlightIndex] = useState(-1);

  // 檔名/根節點顯示用
  const [rootFolderName, setRootFolderName] = useState("directory_tree");
  const [uploadFileName, setUploadFileName] = useState(null);

  // Refs
  const textRef = useRef(null);
  const folderInputRef = useRef(null);
  const fileInputRef = useRef(null);

  // folder 模式
  useEffect(() => {
    if (files.length === 0 || effectiveMode !== "folder") {
      setExcludeOptions([]);
      setFolderTreeLines([]);
      return;
    }

    setExcludeOptions(buildExcludeOptions(files));

    // 組合目前啟用的排除清單
    const activeNameExcludes = Object.keys(excludedItems).filter(
      (key) => excludedItems[key]
    );

    const filteredFiles = filterFilesByExcludes(
      files,
      activeNameExcludes,
      customExcludeTargets
    );
    const visibleFolderPaths = getVisibleFolderPaths(
      files,
      activeNameExcludes,
      customExcludeTargets
    );

    // 生成 markdown
    const { markdown: md, rootFolderName: rootName, lines } =
      generateFolderTreeMarkdown(filteredFiles, {
        folderPaths: visibleFolderPaths,
      });

    setRootFolderName(rootName);
    setMarkdown(md);
    setFolderTreeLines(lines);
  }, [excludedItems, customExcludeTargets, files, effectiveMode]);

  // 判斷單一檔案是 json / yaml / unknown
  const detectModeFromSingleFile = (file) => {
    const name = file?.name?.toLowerCase?.() ?? "";
    if (name.endsWith(".json")) return "json";
    if (name.endsWith(".yaml") || name.endsWith(".yml")) return "yaml";
    return null;
  };

  // folder：遞迴遍歷拖曳資料夾
  const readAllDirectoryEntries = (dirReader) => {
    return new Promise((resolve, reject) => {
      const entries = [];

      const readNextBatch = () => {
        dirReader.readEntries((batch) => {
          if (batch.length === 0) {
            resolve(entries);
            return;
          }

          entries.push(...batch);
          readNextBatch();
        }, reject);
      };

      readNextBatch();
    });
  };

  const traverseFileTree = async (entry, path, result) => {
    return new Promise((resolve, reject) => {
      if (entry.isFile) {
        entry.file((file) => {
          result.push({
            path: path + file.name,
          });
          resolve();
        }, reject);
        return;
      }

      // 資料夾：讀取子節點並遞迴
      if (entry.isDirectory) {
        const dirReader = entry.createReader();
        readAllDirectoryEntries(dirReader)
          .then(async (entries) => {
            for (const child of entries) {
              await traverseFileTree(child, path + entry.name + "/", result);
            }
            resolve();
          })
          .catch(reject);
        return;
      }

      resolve();
    });
  };

  // 解析 JSON/YAML（共用）
  const parseAndRenderObjectTree = (file, mode) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const raw = event.target.result;

        // 依 mode 解析
        const parsed = mode === "json" ? JSON.parse(raw) : YAML.load(raw);

        // 根名稱（用檔名去副檔名）
        const rootName =
          mode === "json"
            ? getJsonBaseName(file.name)
            : getYamlBaseName(file.name);

        // 生成 markdown
        const md = renderObjectTreeMarkdown(parsed, {
          rootName,
          mode,
        });

        setUploadFileName(rootName);
        setMarkdown(md);
        setFolderTreeLines([]);
      } catch (err) {
        console.error("Object tree 解析失敗：", err);
        setMarkdown("");
        setFolderTreeLines([]);
      }
    };

    reader.readAsText(file);
  };

  // 拖曳上傳：自動偵測（folder / json / yaml）
  const handleDrop = async (e) => {
    e.preventDefault();

    const dt = e.dataTransfer;
    const fileList = Array.from(dt.files || []);

    // 判斷是否含資料夾
    const items = dt.items ? Array.from(dt.items) : [];
    const hasDirectory = items.some(
      (it) => it.webkitGetAsEntry?.()?.isDirectory
    );

    // 決定 dropMode
    let dropMode = null;

    if (hasDirectory) {
      dropMode = "folder";
    } else if (fileList.length === 1) {
      // 單檔：json/yaml 直接判斷，否則當成 folder（單檔樹）
      dropMode = detectModeFromSingleFile(fileList[0]) ?? "folder";
    } else if (fileList.length > 1) {
      // 多檔：當成 folder（平面檔案樹）
      dropMode = "folder";
    }

    if (!dropMode) {
      setMarkdown(t("unsupportedInput"));
      return;
    }

    // 更新偵測結果
    setDetectedMode(dropMode);

    // 依模式處理
    if (dropMode === "folder") {
      setUploadFileName(null);

      if (hasDirectory && items.length > 0) {
        const filesArray = [];
        try {
          for (const it of items) {
            const entry = it.webkitGetAsEntry?.();
            if (entry) {
              await traverseFileTree(entry, "", filesArray);
            }
          }
        } catch (err) {
          console.error("資料夾讀取失敗：", err);
          setMarkdown(t("unsupportedInput"));
          return;
        }
        setFiles(filesArray);
        return;
      }

      // 無資料夾結構：用檔名當 path
      const filesArray = fileList.map((f) => ({
        path: f.name,
      }));
      setFiles(filesArray);
      return;
    }

    // json / yaml：只處理單檔
    const file = fileList[0];
    if (!file) {
      setMarkdown(t("unsupportedInput"));
      return;
    }

    // 清空 folder 狀態避免混淆
    setFiles([]);

    parseAndRenderObjectTree(file, dropMode);
  };

  // DropZone 左鍵：固定開啟「資料夾選擇器」
  const handleLeftClickOpenFolder = () => {
    folderInputRef.current?.click();
  };

  // DropZone 右鍵：固定開啟「檔案選擇器（json/yaml）」
  const handleRightClickOpenFile = (e) => {
    e.preventDefault();
    fileInputRef.current?.click();
  };

  // 點擊選資料夾
  const handleFolderSelect = (e) => {
    const fileList = Array.from(e.target.files || []);

    const filesArray = fileList.map((file) => ({
      path: file.webkitRelativePath,
    }));

    setDetectedMode("folder");
    setUploadFileName(null);
    setFiles(filesArray);
  };

  // 點擊選檔案（json/yaml 自動判斷）
  const handleAutoFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const mode = detectModeFromSingleFile(file);
    if (!mode) {
      setMarkdown(t("unsupportedFile"));
      return;
    }

    setDetectedMode(mode);

    setFiles([]);

    parseAndRenderObjectTree(file, mode);
  };

  // 內建排除項：切換狀態
  const handleToggleExcludedItem = (itemKey) => {
    setExcludedItems((prev) => ({
      ...prev,
      [itemKey]: !prev[itemKey],
    }));
  };

  // Suggestion 清單：最多 10 筆，依完整路徑排序並排除已加入的 tag
  const filteredSuggestions = getExcludeOptionMatches(
    excludeOptions,
    inputValue,
    customExcludeTargets
  ).slice(0, 10);

  const addCustomExcludeTarget = (target) => {
    if (!target) return;

    setCustomExcludeTargets((prev) => {
      if (prev.some((item) => item.id === target.id)) return prev;
      return [...prev, target];
    });
    setInputValue("");
    setHighlightIndex(-1);
  };

  // 自訂排除輸入框鍵盤操作
  const handleInputKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (filteredSuggestions.length === 0) return;
      setHighlightIndex((prev) =>
        prev < filteredSuggestions.length - 1 ? prev + 1 : 0
      );
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (filteredSuggestions.length === 0) return;
      setHighlightIndex((prev) =>
        prev > 0 ? prev - 1 : filteredSuggestions.length - 1
      );
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();

      const selected =
        highlightIndex >= 0
          ? filteredSuggestions[highlightIndex]
          : filteredSuggestions[0];

      addCustomExcludeTarget(createExcludeTargetFromOption(selected));
    }
  };

  // suggestion 點擊加入 tag
  const handleSuggestionClick = (option) => {
    addCustomExcludeTarget(createExcludeTargetFromOption(option));
  };

  // 直接點擊輸出中的 folder tree 項目來加入排除
  const handleTreeItemClick = (target) => {
    if (effectiveMode !== "folder") return;
    addCustomExcludeTarget(target);
  };

  // tag 移除
  const handleRemoveExcludeTag = (targetId) => {
    setCustomExcludeTargets((prev) =>
      prev.filter((target) => target.id !== targetId)
    );
  };

  // 輸出操作：Copy / Download Markdown / Download Image
  // 複製到剪貼簿
  const copyToClipboard = () => {
    if (textRef.current) {
      navigator.clipboard.writeText(markdown);
    }
  };

  // 複製到剪貼簿
  const downloadMarkdown = () => {
    if (!markdown.trim()) {
      alert(t("alert.noContent"));
      return;
    }
    // 檔名：json/yaml 用 uploadFileName，folder 用 rootFolderName
    const filename =
      effectiveMode === "json" || effectiveMode === "yaml"
        ? `${uploadFileName || "tree"}.md`
        : `${rootFolderName}.md`;
    const downloadContent = `\`\`\`bash\n${markdown.trimEnd()}\n\`\`\`\n`;
    const blob = new Blob([downloadContent], {
      type: "text/markdown;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 下載圖片（把指定節點轉成 PNG）
  const downloadImage = () => {
    if (!markdown.trim()) {
      alert(t("alert.noContent"));
      return;
    }

    const node = document.getElementById("screenshot-wrapper");
    if (!node) return;

    node.style.display = "flex";

    toPng(node, { cacheBust: true, pixelRatio: 3 })
      .then((dataUrl) => {
        node.style.display = "none";

        const link = document.createElement("a");
        const filename =
          effectiveMode === "json" || effectiveMode === "yaml"
            ? `${uploadFileName || "tree"}.png`
            : `${rootFolderName}.png`;

        link.download = filename;
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        node.style.display = "none";
        console.error("圖片轉換失敗", err);
      });
  };

  // Clear：清除目前產出的樹狀圖 + 重置相關狀態
  const handleClear = () => {
    setMarkdown("");
    setFiles([]);
    setUploadFileName(null);
    setRootFolderName("directory_tree");
    setDetectedMode(null);
    setExcludeOptions([]);
    setFolderTreeLines([]);
    setInputValue("");
    setHighlightIndex(-1);
    if (folderInputRef.current) folderInputRef.current.value = "";
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const lines = markdown
    .split("\n")
    .filter(
      (line, idx, arr) => !(idx === arr.length - 1 && line.trim() === "")
    );

  return (
    <div className="home">
      {/* 主標題 */}
      <h1 className="home-title">
        <span className="home-title-copy">{t("home.title.prefix")}</span>
        <RotatingText
          texts={["Folder", "JSON", "YAML"]}
          mainClassName="rotating-chip"
          staggerFrom="last"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "-120%" }}
          staggerDuration={0.025}
          splitLevelClassName="rotating-chip-split"
          transition={{ type: "spring", damping: 30, stiffness: 400 }}
          rotationInterval={2000}
        />
        <span className="home-title-copy">{t("home.title.suffix")}</span>
      </h1>

      {/* folder 模式才顯示：排除控制 */}
      {effectiveMode === "folder" && (
        <ExcludeControls
          uploadMode={effectiveMode}
          excludedItems={excludedItems}
          onToggleExcludedItem={handleToggleExcludedItem}
          inputValue={inputValue}
          onInputValueChange={(v) => {
            setInputValue(v);
            setHighlightIndex(-1);
          }}
          onInputKeyDown={handleInputKeyDown}
          filteredSuggestions={filteredSuggestions}
          highlightIndex={highlightIndex}
          onSuggestionClick={handleSuggestionClick}
          customExcludeTargets={customExcludeTargets}
          onRemoveExcludeTag={handleRemoveExcludeTag}
          t={t}
        />
      )}

      {/* 隱藏 input：資料夾選擇器 */}
      <HiddenFileInput
        fileInputRef={folderInputRef}
        uploadMode="folder"
        onFolderSelect={handleFolderSelect}
        onJsonSelect={() => {}}
        onYamlSelect={() => {}}
      />

      {/* 隱藏 input：檔案選擇器（json/yaml 共用） */}
      <HiddenFileInput
        fileInputRef={fileInputRef}
        uploadMode="auto"
        onFolderSelect={() => {}}
        onJsonSelect={handleAutoFileSelect}
        onYamlSelect={handleAutoFileSelect}
      />

      {/* DropZone */}
      <div
        className="drop-zone"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={handleLeftClickOpenFolder}
        onContextMenu={handleRightClickOpenFile}
      >
        <PixelCard variant="blue" />
        <div className="drop-text">{t("dropZoneTextAuto")}</div>
      </div>

      {/* 輸出面板 */}
      <OutputPanel
        markdown={markdown}
        treeLines={effectiveMode === "folder" ? folderTreeLines : []}
        textRef={textRef}
        onTreeItemClick={handleTreeItemClick}
        onCopy={copyToClipboard}
        onDownloadMarkdown={downloadMarkdown}
        onDownloadImage={downloadImage}
        onClear={handleClear}
        t={t}
      />

      {/* 註記 */}
      <ScrambledText
        className="note"
        radius={30}
        duration={1.2}
        speed={0.5}
        scrambleChars=".:"
      >
        {[t("note1"), t("note2"), t("note3")].join("\n")}
      </ScrambledText>

      {/* 圖片輸出用容器 */}
      <ScreenshotWrapper lines={lines} />
    </div>
  );
}

export default Home;
