import { toPng } from "html-to-image";
import YAML from "js-yaml";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import GooeyNav from "../components/GooeyNav/GooeyNav";
import ExcludeControls from "../components/Home/ExcludeControls";
import HiddenFileInput from "../components/Home/HiddenFileInput";
import HomeHeader from "../components/Home/HomeHeader";
import OutputPanel from "../components/Home/OutputPanel";
import ScreenshotWrapper from "../components/Home/ScreenshotWrapper";
import PixelCard from "../components/PixelCard/PixelCard";

import "../styles/Home.css";

import { getJsonBaseName, getYamlBaseName } from "../utils/fileNameUtils";
import { renderObjectTreeMarkdown } from "../utils/objectTreeMarkdownUtils";
import { generateFolderTreeMarkdown } from "../utils/treeMarkdownUtils";

function Home() {
  // i18n
  const { t, i18n } = useTranslation();

  // UI 狀態
  const [uploadMode, setUploadMode] = useState("folder"); // folder / json / yaml
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

  // Refs（copy 與 file input）
  const textRef = useRef(null);
  const fileInputRef = useRef(null);

  // 語言切換選單資料
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

  // GooeyNav 初始
  const activeLangIndex = languageItems.findIndex(
    (item) => item.language === i18n.language
  );

  // mode 切換時：清空結果
  useEffect(() => {
    setMarkdown("");
    setFiles([]);
    setUploadFileName(null);
  }, [uploadMode]);

  // folder 模式：當 files / excludes / showFileSize 變動 -> 重算 markdown
  useEffect(() => {
    if (files.length === 0) return;
    if (uploadMode !== "folder") return;

    const uniqueNames = new Set();
    files.forEach((file) => {
      file.path.split("/").forEach((p) => uniqueNames.add(p));
    });
    setAllNames(Array.from(uniqueNames));

    const activeExcludes = [
      ...Object.keys(excludedItems).filter((key) => excludedItems[key]),
      ...customExcludesExact,
    ];

    const filteredFiles = files.filter((file) => {
      const parts = file.path.split("/");
      return !parts.some((part) => activeExcludes.includes(part));
    });

    const { markdown: md, rootFolderName: rootName } =
      generateFolderTreeMarkdown(filteredFiles, {
        showFileSize,
      });

    setRootFolderName(rootName);
    setMarkdown(md);
  }, [excludedItems, customExcludesExact, files, uploadMode, showFileSize]);

  // folder：遞迴遍歷拖曳的資料夾結構
  const traverseFileTree = async (item, path, result) => {
    return new Promise((resolve) => {
      if (item.isFile) {
        item.file((file) => {
          result.push({
            path: path + file.name,
            size: file.size,
          });
          resolve();
        });
        return;
      }

      if (item.isDirectory) {
        const dirReader = item.createReader();
        dirReader.readEntries(async (entries) => {
          for (const entry of entries) {
            await traverseFileTree(entry, path + item.name + "/", result);
          }
          resolve();
        });
      }
    });
  };

  // 拖曳上傳：依 uploadMode 分流處理（folder / json / yaml）
  const handleDrop = async (e) => {
    e.preventDefault();

    if (uploadMode === "json" || uploadMode === "yaml") {
      const file = e.dataTransfer.files[0];

      if (!file || e.dataTransfer.files.length > 1) {
        setMarkdown(t("onlySingleFile"));
        return;
      }
      if (uploadMode === "json" && !file.name.toLowerCase().endsWith(".json")) {
        setMarkdown(t("requireJsonFile"));
        return;
      }
      if (uploadMode === "yaml" && !/\.(yaml|yml)$/i.test(file.name)) {
        setMarkdown(t("requireYamlFile"));
        return;
      }

      setUploadFileName(
        uploadMode === "json"
          ? getJsonBaseName(file.name)
          : getYamlBaseName(file.name)
      );

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed =
            uploadMode === "json"
              ? JSON.parse(event.target.result)
              : YAML.load(event.target.result);

          const rootName =
            uploadMode === "json"
              ? getJsonBaseName(file.name)
              : getYamlBaseName(file.name);

          const md = renderObjectTreeMarkdown(parsed, {
            rootName,
            mode: uploadMode,
          });

          setMarkdown(md);
        } catch (err) {
          console.error(
            uploadMode === "json" ? "JSON 解析錯誤：" : "YAML 解析錯誤：",
            err
          );
          setMarkdown(
            t(uploadMode === "json" ? "invalidJsonFormat" : "invalidYamlFormat")
          );
        }
      };
      reader.readAsText(file);
      return;
    }

    // folder：讀取 webkit entry 並遞迴展開
    const items = e.dataTransfer.items;
    if (!items) return;

    const filesArray = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i].webkitGetAsEntry();
      if (item) {
        await traverseFileTree(item, "", filesArray);
      }
    }
    setFiles(filesArray);
  };

  // 點擊 drop-zone：觸發隱藏 input
  const handleClickZone = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // input 選檔：folder / json / yaml
  const handleFolderSelect = async (e) => {
    const fileList = Array.from(e.target.files);
    const filesArray = fileList.map((file) => ({
      path: file.webkitRelativePath,
      size: file.size,
    }));
    setFiles(filesArray);
  };

  const handleJsonSelect = (e) => {
    const file = e.target.files[0];
    if (
      !file ||
      e.target.files.length > 1 ||
      !file.name.toLowerCase().endsWith(".json")
    ) {
      setMarkdown(t("requireJsonFile"));
      return;
    }
    setUploadFileName(getJsonBaseName(file.name));
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        const md = renderObjectTreeMarkdown(parsed, {
          rootName: getJsonBaseName(file.name),
          mode: "json",
        });
        setMarkdown(md);
      } catch (err) {
        console.error("JSON 解析錯誤：", err);
        setMarkdown(t("invalidJsonFormat"));
      }
    };
    reader.readAsText(file);
  };

  const handleYamlSelect = (e) => {
    const file = e.target.files[0];
    if (
      !file ||
      e.target.files.length > 1 ||
      !/\.(yaml|yml)$/i.test(file.name)
    ) {
      setMarkdown(t("requireYamlFile"));
      return;
    }
    setUploadFileName(getYamlBaseName(file.name));
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = YAML.load(event.target.result);
        const md = renderObjectTreeMarkdown(parsed, {
          rootName: getYamlBaseName(file.name),
          mode: "yaml",
        });
        setMarkdown(md);
      } catch (err) {
        console.error("YAML 解析錯誤：", err);
        setMarkdown(t("invalidYamlFormat"));
      }
    };
    reader.readAsText(file);
  };

  // 排除控制：切換內建排除項目
  const handleToggleExcludedItem = (itemKey) => {
    setExcludedItems((prev) => ({
      ...prev,
      [itemKey]: !prev[itemKey],
    }));
  };

  // 自訂排除：suggestion
  const filteredSuggestions = allNames
    .filter(
      (name) =>
        name.toLowerCase().includes(inputValue.toLowerCase()) &&
        !customExcludesExact.includes(name)
    )
    .slice(0, 10);

  const handleInputKeyDown = (e) => {
    // 下鍵：往下選
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((prev) =>
        prev < filteredSuggestions.length - 1 ? prev + 1 : 0
      );
      return;
    }

    // 上鍵：往上選
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((prev) =>
        prev > 0 ? prev - 1 : filteredSuggestions.length - 1
      );
      return;
    }

    // Enter：加入目前 highlight 的項目
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

  // 複製 / 下載 markdown
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
      uploadMode === "json" || uploadMode === "yaml"
        ? `${
            uploadFileName ||
            (uploadMode === "json" ? "json_tree" : "yaml_tree")
          }.md`
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

  // 下載圖片（用 screenshot-wrapper 產圖）
  const downloadImage = () => {
    if (!markdown.trim()) {
      alert(t("alert.noContent"));
      return;
    }

    const node = document.getElementById("screenshot-wrapper");
    if (!node) return;

    // 顯示截圖 DOM -> 轉 PNG -> 再隱藏
    node.style.display = "block";

    toPng(node, {
      cacheBust: true,
      pixelRatio: 3,
    })
      .then((dataUrl) => {
        node.style.display = "none";

        const link = document.createElement("a");
        const filename =
          uploadMode === "json" || uploadMode === "yaml"
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

  const lines = markdown
    .split("\n")
    .filter(
      (line, idx, arr) => !(idx === arr.length - 1 && line.trim() === "")
    );

  return (
    <div className="container">
      <HomeHeader
        uploadMode={uploadMode}
        onUploadModeChange={setUploadMode}
        showFileSize={showFileSize}
        onToggleFileSize={() => setShowFileSize((prev) => !prev)}
        t={t}
      />

      <ExcludeControls
        uploadMode={uploadMode}
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
        fileInputRef={fileInputRef}
        uploadMode={uploadMode}
        onFolderSelect={handleFolderSelect}
        onJsonSelect={handleJsonSelect}
        onYamlSelect={handleYamlSelect}
      />

      <div
        className="drop-zone"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={handleClickZone}
      >
        <PixelCard variant="blue" />
        <div className="drop-text">
          {uploadMode === "folder"
            ? t("dropZoneTextFolder")
            : uploadMode === "json"
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
          onItemClick={(item) => {
            i18n.changeLanguage(item.language);
          }}
        />
      </div>

      <ScreenshotWrapper lines={lines} />
    </div>
  );
}

export default Home;
