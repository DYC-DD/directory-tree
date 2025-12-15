import { toPng } from "html-to-image";
import YAML from "js-yaml";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import "../styles/Home.css";

import GooeyNav from "../components/GooeyNav/GooeyNav";
import ExcludeControls from "../components/Home/ExcludeControls";
import HiddenFileInput from "../components/Home/HiddenFileInput";
import OutputPanel from "../components/Home/OutputPanel";
import ScreenshotWrapper from "../components/Home/ScreenshotWrapper";
import PixelCard from "../components/PixelCard/PixelCard";
import RotatingText from "../components/RotatingText/RotatingText";

import { getJsonBaseName, getYamlBaseName } from "../utils/fileNameUtils";
import { renderObjectTreeMarkdown } from "../utils/objectTreeMarkdownUtils";
import { generateFolderTreeMarkdown } from "../utils/treeMarkdownUtils";

function Home() {
  // i18n
  const { t, i18n } = useTranslation();

  const [detectedMode, setDetectedMode] = useState(null);
  const effectiveMode = detectedMode ?? "auto";

  // UI 狀態
  const [markdown, setMarkdown] = useState("");
  const [files, setFiles] = useState([]);

  const [excludedItems, setExcludedItems] = useState({
    ".git": false,
    ".DS_Store": false,
    node_modules: false,
  });
  const [customExcludesExact, setCustomExcludesExact] = useState([]);

  const [inputValue, setInputValue] = useState("");
  const [allNames, setAllNames] = useState([]);
  const [highlightIndex, setHighlightIndex] = useState(-1);

  const [rootFolderName, setRootFolderName] = useState("directory_tree");
  const [uploadFileName, setUploadFileName] = useState(null);

  const [showFileSize, setShowFileSize] = useState(false);

  // Refs：兩個 input（資料夾 / 檔案）
  // - folderInputRef：永遠用 webkitdirectory 選資料夾
  // - fileInputRef：永遠用 accept 選 json/yaml
  const textRef = useRef(null);
  const folderInputRef = useRef(null);
  const fileInputRef = useRef(null);

  // 語言切換
  const languageItems = [
    { label: "繁體中文", language: "zhhant", href: "#" },
    { label: "简体中文", language: "zhhans", href: "#" },
    { label: "English", language: "en", href: "#" },
    { label: "日本語", language: "ja", href: "#" },
    { label: "한국어", language: "ko", href: "#" },
    { label: "Español", language: "es", href: "#" },
    { label: "Français", language: "fr", href: "#" },
    { label: "Deutsch", language: "de", href: "#" },
    { label: "हिंदी", language: "hi", href: "#" },
  ];

  const activeLangIndex = languageItems.findIndex(
    (item) => item.language === i18n.language
  );

  // folder 模式：當 files / excludes / showFileSize 變動 -> 重算 markdown
  useEffect(() => {
    if (files.length === 0) return;
    if (effectiveMode !== "folder") return;

    // 1) 收集所有名稱做 suggestion
    const uniqueNames = new Set();
    files.forEach((file) => {
      file.path.split("/").forEach((p) => uniqueNames.add(p));
    });
    setAllNames(Array.from(uniqueNames));

    // 2) 組合目前啟用的排除清單
    const activeExcludes = [
      ...Object.keys(excludedItems).filter((key) => excludedItems[key]),
      ...customExcludesExact,
    ];

    // 3) 依 path 的每一段做精準排除
    const filteredFiles = files.filter((file) => {
      const parts = file.path.split("/");
      return !parts.some((part) => activeExcludes.includes(part));
    });

    // 4) 生成 markdown
    const { markdown: md, rootFolderName: rootName } =
      generateFolderTreeMarkdown(filteredFiles, { showFileSize });

    setRootFolderName(rootName);
    setMarkdown(md);
  }, [excludedItems, customExcludesExact, files, effectiveMode, showFileSize]);

  // 判斷單一檔案是 json / yaml / unknown
  const detectModeFromSingleFile = (file) => {
    const name = file?.name?.toLowerCase?.() ?? "";
    if (name.endsWith(".json")) return "json";
    if (name.endsWith(".yaml") || name.endsWith(".yml")) return "yaml";
    return null;
  };

  // folder：遞迴遍歷拖曳資料夾
  const traverseFileTree = async (entry, path, result) => {
    return new Promise((resolve) => {
      if (entry.isFile) {
        entry.file((file) => {
          result.push({
            path: path + file.name,
            size: file.size,
          });
          resolve();
        });
        return;
      }

      if (entry.isDirectory) {
        const dirReader = entry.createReader();
        dirReader.readEntries(async (entries) => {
          for (const child of entries) {
            await traverseFileTree(child, path + entry.name + "/", result);
          }
          resolve();
        });
      }
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
      } catch (err) {
        console.error(
          mode === "json" ? "JSON 解析錯誤：" : "YAML 解析錯誤：",
          err
        );
        setMarkdown(
          t(mode === "json" ? "invalidJsonFormat" : "invalidYamlFormat")
        );
      }
    };

    reader.readAsText(file);
  };

  // 拖曳上傳：自動偵測（folder / json / yaml）
  const handleDrop = async (e) => {
    e.preventDefault();

    const dt = e.dataTransfer;
    const fileList = Array.from(dt.files || []);

    // 1) 判斷是否含資料夾 entry
    const items = dt.items ? Array.from(dt.items) : [];
    const hasDirectory = items.some(
      (it) => it.webkitGetAsEntry?.()?.isDirectory
    );

    // 2) 決定 dropMode
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

    // 3) 更新偵測結果
    setDetectedMode(dropMode);

    // 4) 依 dropMode 處理
    if (dropMode === "folder") {
      setUploadFileName(null);

      if (hasDirectory && items.length > 0) {
        const filesArray = [];
        for (const it of items) {
          const entry = it.webkitGetAsEntry?.();
          if (entry) {
            await traverseFileTree(entry, "", filesArray);
          }
        }
        setFiles(filesArray);
        return;
      }

      // 無資料夾結構：用檔名當 path
      const filesArray = fileList.map((f) => ({
        path: f.name,
        size: f.size,
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

  /**
   * DropZone 左鍵行為：開「資料夾選擇器」
   * 固定左鍵開 folderInputRef（webkitdirectory）
   */
  const handleLeftClickOpenFolder = () => {
    folderInputRef.current?.click();
  };

  /**
   * DropZone 右鍵行為：開「JSON/YAML 檔案選擇器」
   * 右鍵預設會跳瀏覽器選單，所以要 preventDefault()
   * 固定右鍵開 fileInputRef（accept .json/.yaml/.yml）
   */
  const handleRightClickOpenFile = (e) => {
    e.preventDefault();
    fileInputRef.current?.click();
  };

  // 點擊選資料夾
  const handleFolderSelect = (e) => {
    const fileList = Array.from(e.target.files || []);

    const filesArray = fileList.map((file) => ({
      path: file.webkitRelativePath,
      size: file.size,
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

  const handleToggleExcludedItem = (itemKey) => {
    setExcludedItems((prev) => ({
      ...prev,
      [itemKey]: !prev[itemKey],
    }));
  };

  const filteredSuggestions = allNames
    .filter(
      (name) =>
        name.toLowerCase().includes(inputValue.toLowerCase()) &&
        !customExcludesExact.includes(name)
    )
    .slice(0, 10);

  const handleInputKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((prev) =>
        prev < filteredSuggestions.length - 1 ? prev + 1 : 0
      );
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((prev) =>
        prev > 0 ? prev - 1 : filteredSuggestions.length - 1
      );
      return;
    }

    if (e.key === "Enter" && highlightIndex >= 0) {
      const selected = filteredSuggestions[highlightIndex];
      if (selected) {
        setCustomExcludesExact((prev) => [...prev, selected]);
        setInputValue("");
        setHighlightIndex(-1);
      }
    }
  };

  const handleSuggestionClick = (name) => {
    setCustomExcludesExact((prev) => [...prev, name]);
    setInputValue("");
    setHighlightIndex(-1);
  };

  const handleRemoveExcludeTag = (name) => {
    setCustomExcludesExact((prev) => prev.filter((n) => n !== name));
  };

  // Copy / Download Markdown / Download Image
  const copyToClipboard = () => {
    if (textRef.current) {
      navigator.clipboard.writeText(markdown);
    }
  };

  const downloadMarkdown = () => {
    if (!markdown.trim()) {
      alert(t("alert.noContent"));
      return;
    }
    const filename =
      effectiveMode === "json" || effectiveMode === "yaml"
        ? `${uploadFileName || "tree"}.md`
        : `${rootFolderName}.md`;
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadImage = () => {
    if (!markdown.trim()) {
      alert(t("alert.noContent"));
      return;
    }

    const node = document.getElementById("screenshot-wrapper");
    if (!node) return;

    node.style.display = "block";

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
    setAllNames([]);
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
    <div className="container">
      <h1 className="home-title">
        Automatically convert &quot;
        <RotatingText
          texts={["Folder", "JSON", "YAML"]}
          mainClassName="rotating-chip px-2 sm:px-2 md:px-3 bg-cyan-300 text-black overflow-hidden py-0.5 sm:py-1 md:py-2 justify-center rounded-lg"
          staggerFrom={"last"}
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "-120%" }}
          staggerDuration={0.025}
          splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
          transition={{ type: "spring", damping: 30, stiffness: 400 }}
          rotationInterval={2000}
        />
        &quot; to Markdown directory trees
      </h1>

      {effectiveMode === "folder" && (
        <div className="file-size">
          <div>{t("toggleSizeHint")}</div>
          <button
            onClick={() => setShowFileSize((prev) => !prev)}
            className={`file-size-button ${showFileSize ? "active" : ""}`}
          >
            {t(showFileSize ? "toggleSizeOn" : "toggleSizeOff")}
          </button>
        </div>
      )}

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
        customExcludesExact={customExcludesExact}
        onRemoveExcludeTag={handleRemoveExcludeTag}
        t={t}
      />

      <HiddenFileInput
        fileInputRef={folderInputRef}
        uploadMode="folder"
        onFolderSelect={handleFolderSelect}
        onJsonSelect={() => {}}
        onYamlSelect={() => {}}
      />

      <HiddenFileInput
        fileInputRef={fileInputRef}
        uploadMode="auto" // 只接受 json/yaml/yml
        onFolderSelect={() => {}}
        onJsonSelect={handleAutoFileSelect}
        onYamlSelect={handleAutoFileSelect}
      />

      <div
        className="drop-zone"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={handleLeftClickOpenFolder} // 左鍵：資料夾
        onContextMenu={handleRightClickOpenFile} // 右鍵：JSON/YAML
      >
        <PixelCard variant="blue" />
        <div className="drop-text">
          {effectiveMode === "auto"
            ? t("dropZoneTextAuto")
            : effectiveMode === "folder"
            ? t("dropZoneTextFolder")
            : effectiveMode === "json"
            ? t("dropZoneTextJson")
            : t("dropZoneTextYaml")}
        </div>
      </div>

      <OutputPanel
        markdown={markdown}
        textRef={textRef}
        onCopy={copyToClipboard}
        onDownloadMarkdown={downloadMarkdown}
        onDownloadImage={downloadImage}
        onClear={handleClear}
        t={t}
      />

      <p className="note">
        {t("note")
          .split("\n")
          .map((line, index) => (
            <span key={index}>
              {line}
              <br />
            </span>
          ))}
      </p>

      <div className="languageItems">
        <GooeyNav
          items={languageItems}
          animationTime={600}
          pCount={15}
          minDistance={20}
          maxDistance={42}
          maxRotate={75}
          colors={[1, 2, 3, 1, 2, 3, 1, 4]}
          timeVariance={300}
          initialActiveIndex={activeLangIndex}
          onItemClick={(item) => i18n.changeLanguage(item.language)}
        />
      </div>

      <ScreenshotWrapper lines={lines} />
    </div>
  );
}

export default Home;
