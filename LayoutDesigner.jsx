import React, { useState, useEffect } from "react";
import { Rnd } from "react-rnd";
import { Button } from "./src/components/ui/button.jsx";
import { Input } from "./src/components/ui/input.jsx";
import { SketchPicker } from "react-color";

export default function LayoutDesigner() {
  const [elements, setElements] = useState([]);
  const [selectedColor, setSelectedColor] = useState("#8f5cf4");
  const [useGradient, setUseGradient] = useState(false);
  const [opacity, setOpacity] = useState(1);
  const [borderRadius, setBorderRadius] = useState(10);
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [newElementName, setNewElementName] = useState("");
  const [editingElementId, setEditingElementId] = useState(null);
  const [cssPreview, setCssPreview] = useState("");
  const [selectedElementId, setSelectedElementId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showBorder, setShowBorder] = useState(false);
  const [showOpacity, setShowOpacity] = useState(false);
  const [showRadius, setShowRadius] = useState(false);
  const [borderColor, setBorderColor] = useState("#ffffff");
  const [borderWidth, setBorderWidth] = useState(2);
  const [defaultBodyBg, setDefaultBodyBg] = useState("#1e1e2f");
  const [defaultFont, setDefaultFont] = useState("Segoe UI, sans-serif");
  const [enableBodyStyle, setEnableBodyStyle] = useState(false);
  const [showBodyPrompt, setShowBodyPrompt] = useState(false);
  const [defaultFontColor, setDefaultFontColor] = useState("#ffffff");
  const [defaultFontSize, setDefaultFontSize] = useState("16px");

  const DEFAULT_WIDTH = 150;
  const DEFAULT_HEIGHT = 80;
  const [customWidth, setCustomWidth] = useState(DEFAULT_WIDTH);
  const [customHeight, setCustomHeight] = useState(DEFAULT_HEIGHT);

  const saveElements = (updated) => {
    setElements(updated);
    localStorage.setItem("layout_elements", JSON.stringify(updated));
  };

  const handleAddElement = () => {
    setShowNamePrompt(true);
    setEditingElementId(null);
    setCustomWidth(DEFAULT_WIDTH);
    setCustomHeight(DEFAULT_HEIGHT);
  };

  const confirmAddElement = (e) => {
    if (e) e.preventDefault();

    const trimmedName = newElementName.trim();
    const validNameRegex = /^[a-zA-Z0-9_-]+$/;

    if (!trimmedName) {
  alert("⚠️ Please enter a name for the shape.");
  return;
}
if (!validNameRegex.test(trimmedName)) {
  alert("⚠️ The shape name must contain only letters, numbers, underscores (_) or dashes (-), with no spaces.");
  return;
}

    const id = editingElementId || Date.now();
    const existing = elements.find((el) => el.id === id);
    const x = existing ? existing.x : Math.floor(Math.random() * (window.innerWidth - customWidth - 300));
    const y = existing ? existing.y : Math.floor(Math.random() * (window.innerHeight - customHeight));

    const newElement = {
      id,
      name: trimmedName,
      x,
      y,
      width: customWidth,
      height: customHeight,
      color: selectedColor,
      useGradient,
      showBorder,
      borderColor,
      borderWidth,
      showOpacity,
      opacity: showOpacity ? opacity : 1,
      showRadius,
      borderRadius: showRadius ? borderRadius : 0,
    };

    const updated = editingElementId
      ? elements.map((el) => (el.id === id ? newElement : el))
      : [...elements, newElement];

    saveElements(updated);
    setNewElementName("");
    setShowNamePrompt(false);
    setEditingElementId(null);
  };

  const handleEditElement = (el) => {
    setEditingElementId(el.id);
    setNewElementName(el.name);
    setSelectedColor(el.color);
    setOpacity(el.opacity);
    setUseGradient(el.useGradient);
    setBorderRadius(el.borderRadius);
    setCustomWidth(el.width);
    setCustomHeight(el.height);
    setShowNamePrompt(true);
    setSelectedElementId(el.id);
    setShowOpacity(el.showOpacity || false);
    setShowRadius(el.showRadius || false);
    setShowBorder(el.showBorder || false);
    setBorderColor(el.borderColor || "#ffffff");
    setBorderWidth(el.borderWidth || 2);
    setCssPreview(bodyCss + elementsCss);
  };

  const handleDeleteElement = () => {
    const updated = elements.filter((el) => el.id !== editingElementId);
    saveElements(updated);
    setShowNamePrompt(false);
    setEditingElementId(null);
  };

  const handleRestart = () => {
    if (confirm("Are you sure you want to delete all elements?")) {
      setElements([]);
      localStorage.removeItem("layout_elements");
      setCssPreview("");
      setSelectedElementId(null);
    }
  };

  const exportToCSS = () => {
    const bodyCss = enableBodyStyle
      ? `body {\n` +
      `  background-color: ${defaultBodyBg};\n` +
      `  color: ${defaultFontColor};\n` +
      `  font-size: ${defaultFontSize};\n` +
      `  font-family: ${defaultFont};\n` +
      `}\n\n`
      : "";

    const elementsCss = elements
      .map((el) => {
        return `.${el.name} {\n` +
          `  width: ${el.width}px;\n` +
          `  height: ${el.height}px;\n` +
          `  background: ${el.useGradient ? `linear-gradient(45deg, ${el.color}, #ffffff33)` : el.color};\n` +
          (el.showOpacity ? `  opacity: ${el.opacity};\n` : "") +
          (el.showRadius ? `  border-radius: ${el.borderRadius}px;\n` : "") +
          (el.showBorder ? `  border: ${el.borderWidth}px solid ${el.borderColor};\n` : "") +
          `  position: absolute;\n` +
          `  left: ${el.x}px;\n` +
          `  top: ${el.y}px;\n` +
          `}\n`;
      }).join("\n");

    setCssPreview(bodyCss + elementsCss);
  };

  useEffect(() => {
    const saved = localStorage.getItem("layout_elements");
    if (saved) setElements(JSON.parse(saved));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedElementId) return;
      const delta = 5;
      const updated = elements.map((el) => {
        if (el.id !== selectedElementId) return el;
        let x = el.x;
        let y = el.y;
        if (e.key === "ArrowUp") y -= delta;
        else if (e.key === "ArrowDown") y += delta;
        else if (e.key === "ArrowLeft") x -= delta;
        else if (e.key === "ArrowRight") x += delta;
        return { ...el, x, y };
      });
      saveElements(updated);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedElementId, elements]);

  return (
    <div className="flex w-full h-screen">
      <div className="flex flex-row-reverse w-full h-screen">
        {isSidebarOpen && (
          <div className="sidebar w-[260px] p-4 h-full bg-[#2b2b3d] transition-all duration-300 ease-in-out" style={{ overflowY: "auto" }}>
            <h2 style={{ marginBottom: "2px", lineHeight: "1.2" }}>
              <i className="bi bi-tools me-2"></i> Tools
              <div style={{ textAlign: "center" }}>
                <span style={{
                  display: "inline-block",
                  fontSize: "8px",
                  color: "#bbb",
                  backgroundColor: "#2b2b3d",
                  borderRadius: "4px",
                  padding: "2px 6px",
                  marginTop: "2px"
                }}>
                  a part of RED SHADOWS | RS
                </span>
              </div>

            </h2>

            <Button className="bg-purple" onClick={handleAddElement}>
              <i className="bi bi-plus-circle me-1"></i> Add New Element
            </Button>

            <Button className="outline mt-2" onClick={() => setShowBodyPrompt(true)}>
              <i className="bi bi-palette me-1"></i> Default Body
            </Button>

            <Button className="outline mt-4" onClick={exportToCSS}>
              <i className="bi bi-filetype-css me-1"></i> Export to CSS
            </Button>

            <Button className="outline mt-2 bg-red-700 text-white" onClick={handleRestart}>
              <i className="bi bi-arrow-clockwise me-1"></i> Restart
            </Button>

            {cssPreview && (
              <div className="mt-2">
                <h4 className="text-sm font-bold">
                  <i className="bi bi-code-square me-1"></i> CSS Preview Code
                </h4>
                <textarea
                  readOnly
                  rows={10}
                  className="w-full p-2 text-sm"
                  style={{
                    background: "#1e1e2f",
                    color: "#8f5cf4",
                    border: "1px solid #8f5cf4",
                    borderRadius: "8px",
                  }}
                  value={cssPreview}
                />
              </div>
            )}

            {selectedElementId && (
              <Button className="mt-2 bg-purple" onClick={() => {
                const selected = elements.find((el) => el.id === selectedElementId);
                if (selected) {
                  const newElement = {
                    ...selected,
                    id: Date.now(),
                    x: selected.x + 20,
                    y: selected.y + 20,
                    name: `${selected.name}-copy`,
                  };
                  const updated = [...elements, newElement];
                  saveElements(updated);
                }
              }}>
                <i className="bi bi-files me-1"></i> Duplicate Element
              </Button>

            )}

            <div>
              <h2>
                <i className="bi bi-ui-checks-grid me-1"></i> Elements
              </h2>

              {elements.map((el, index) => (
                <button
                  key={el.id}
                  onClick={() => handleEditElement(el)}
                  className={`outline w-full px-2 py-1 text-sm ${selectedElementId === el.id ? "bg-purple text-white" : ""} ${index !== elements.length - 1 ? "mb-2" : ""}`}
                >
                  {el.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={`fixed top-4 transition-all duration-300 z-[9999] bg-purple text-white px-3 py-2 shadow-md hover:scale-105 ${isSidebarOpen ? "right-[270px]" : "right-4"}`}
          style={{ borderRadius: "0px" }}
          title="Toggle Sidebar"
        >
          {isSidebarOpen ? "⏵" : "⏴"}
        </button>

        {selectedElementId && (
          <div
            style={{
              position: "absolute",
              top: "16px",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 9999,
              pointerEvents: "none",
            }}
          ><div
            style={{
              backgroundColor: "#8f5cf4",
              color: "#fff",
              padding: "6px 14px",
              borderRadius: "9999px",
              fontSize: "0.875rem",
              fontWeight: "bold",
              boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
              whiteSpace: "nowrap",
              border: "2px solid white",
            }}
          >
              🎯 {elements.find((el) => el.id === selectedElementId)?.name || 'nothing'}
            </div>
          </div>
        )}

        <div className="canvas-area flex-1 relative overflow-visible">
          {elements.map((el) => (
            <Rnd
              key={el.id}
              size={{ width: el.width, height: el.height }}
              position={{ x: el.x, y: el.y }}
              enableResizing
              onClick={() => setSelectedElementId(el.id)}
              onDragStop={(e, d) => {
                const updated = elements.map((item) =>
                  item.id === el.id ? { ...item, x: d.x, y: d.y } : item
                );
                saveElements(updated);
              }}
              onResizeStop={(e, direction, ref, delta, position) => {
                const updated = elements.map((item) =>
                  item.id === el.id
                    ? {
                      ...item,
                      width: ref.offsetWidth,
                      height: ref.offsetHeight,
                      x: position.x,
                      y: position.y,
                    }
                    : item
                );
                saveElements(updated);
              }}
              style={{ position: "absolute", zIndex: 10 }}
            >
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  background: el.useGradient ? `linear-gradient(45deg, ${el.color}, #ffffff33)` : el.color,
                  opacity: el.opacity,
                  borderRadius: el.showRadius ? `${el.borderRadius}px` : undefined,
                  border: el.showBorder ? `${el.borderWidth}px solid ${el.borderColor}` : "none",
                }}
              />

            </Rnd>
          ))}

          {showNamePrompt && (
            <div className="modal-overlay">
              <div className="modal-box overflow-y-auto max-h-[85vh] w-full max-w-[500px] mx-auto rounded-md shadow-lg bg-[#2b2b3d] text-white p-4">
                <h3 className="text-lg font-bold mb-3">
                  <i className="bi bi-pencil-square me-2"></i>
                  {editingElementId ? "Edit Element" : "Name the Element"}
                </h3>

                <form onSubmit={confirmAddElement}>
                  <Input
                    placeholder="e.g. topnav"
                    value={newElementName}
                    onChange={(e) => setNewElementName(e.target.value)}
                  />

                  <SketchPicker
                    color={selectedColor}
                    onChange={(c) => setSelectedColor(c.hex)}
                  />

                  <div className="control-group mt-4">
                    <label>
                      <i className="bi bi-circle-half">&nbsp;</i>
                      | Opacity
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowOpacity(!showOpacity)}
                      className={`outline mt-1 w-full py-1 rounded ${showOpacity ? "bg-purple text-white" : "bg-gray-700 text-gray-300"}`}
                    >
                      {showOpacity ? "✔️ Opacity Enabled" : "➕ Enable Opacity"}
                    </button>

                    {showOpacity && (
                      <>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={opacity}
                          onChange={(e) => setOpacity(parseFloat(e.target.value))}
                        />
                        <span>{Math.round(opacity * 100)}%</span>
                      </>
                    )}
                  </div>

                  <div className="control-group mt-4">
                    <label>
                      <i className="bi bi-capsule">&nbsp;</i>
                      | Border Radius
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowRadius(!showRadius)}
                      className={`outline mt-1 w-full py-1 rounded ${showRadius ? "bg-purple text-white" : "bg-gray-700 text-gray-300"}`}
                    >
                      {showRadius ? "✔️ Border Radius Enabled" : "➕ Enable Border Radius"}
                    </button>

                    {showRadius && (
                      <>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="1"
                          value={borderRadius}
                          onChange={(e) => setBorderRadius(parseInt(e.target.value))}
                        />
                        <span>{borderRadius}px</span>
                      </>
                    )}
                  </div>

                  <div className="control-group mt-4">
                    <label>
                      <i className="bi bi-square">&nbsp;</i>
                      | Border
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowBorder(!showBorder)}
                      className={`outline mt-1 w-full py-1 rounded ${showBorder ? "bg-purple text-white" : "bg-gray-700 text-gray-300"}`}
                    >
                      {showBorder ? "✔️ Border Enabled" : "➕ Enable Border"}
                    </button>

                    {showBorder && (
                      <>
                        <label className="mt-3 block">
                          <i className="bi bi-palette2">&nbsp;</i>
                          | Border Color
                        </label>
                        <SketchPicker
                          color={borderColor}
                          onChange={(c) => setBorderColor(c.hex)}
                        />

                        <label className="mt-3 block">
                          <i className="bi bi-arrows-expand">&nbsp;</i>
                          | Border Width
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="20"
                          value={borderWidth}
                          onChange={(e) => setBorderWidth(parseInt(e.target.value))}
                        />
                        <span>{borderWidth}px</span>
                      </>
                    )}
                  </div>

                  <div className="modal-actions mt-4 flex justify-between gap-2">
                    {editingElementId && (
                      <button
                        type="button"
                        className="outline bg-red-600 text-white px-3 py-1 rounded"
                        onClick={handleDeleteElement}
                      >
                        Delete
                      </button>
                    )}
                    <button
                      type="button"
                      className="outline px-3 py-1 rounded"
                      onClick={() => setShowNamePrompt(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="bg-purple text-white px-3 py-1 rounded">
                      {editingElementId ? "Update" : "Confirm"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          {showBodyPrompt && (
            <div className="modal-overlay">
              <div className="modal-box overflow-y-auto max-h-[85vh] w-full max-w-[500px] mx-auto rounded-md shadow-lg bg-[#2b2b3d] text-white p-4">
                <h3 className="text-lg font-bold mb-3">
                  <i className="bi bi-brush">&nbsp;</i> Default Body Styling
                </h3>

                <div className="control-group mb-4">
                  <label className="block mb-1">
                    <i className="bi bi-palette-fill">&nbsp;</i>
                    | Background Color
                  </label>

                  <SketchPicker
                    color={defaultBodyBg}
                    onChange={(c) => setDefaultBodyBg(c.hex)}
                  />
                </div>

                <div className="control-group mb-4">
                  <label className="block mb-1">
                    <i className="bi bi-fonts">&nbsp;</i>
                    | Font Color
                  </label>
                  <SketchPicker
                    color={defaultFontColor}
                    onChange={(c) => setDefaultFontColor(c.hex)}
                  />
                </div>

                <div className="control-group mb-4">
                  <label className="block mb-1">
                    <i className="bi bi-type">&nbsp;</i>
                    | Font Size
                  </label>
                  <Input
                    placeholder="e.g. 16px"
                    value={defaultFontSize}
                    onChange={(e) => setDefaultFontSize(e.target.value)}
                  />
                </div>

                <div className="control-group mb-4">
                  <label className="block mb-1">
                    <i className="bi bi-type">&nbsp;</i>
                    | Font Family
                  </label>
                  <Input
                    placeholder="e.g. Segoe UI, sans-serif"
                    value={defaultFont}
                    onChange={(e) => setDefaultFont(e.target.value)}
                  />
                </div>

                <div className="modal-actions mt-4 flex justify-between gap-2">
                  <button
                    className="outline bg-gray-600 text-white px-3 py-1 rounded"
                    onClick={() => setShowBodyPrompt(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className={`bg-purple text-white px-3 py-1 rounded`}
                    onClick={() => {
                      setEnableBodyStyle(true);
                      setShowBodyPrompt(false);
                    }}
                  >
                    ✅ Apply to Export
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}