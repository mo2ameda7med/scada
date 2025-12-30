"use client";

import React, { useEffect, useState } from "react";

export default function EditorPanel({ selectedObject, canvas }) {
  const [fill, setFill] = useState("#000000");
  const [stroke, setStroke] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState(1);
  const [pos, setPos] = useState({ left: 0, top: 0 });
  const [size, setSize] = useState({ width: 100, height: 100 });
  const [rotation, setRotation] = useState(0);
  const [additionalProps, setAdditionalProps] = useState({});

  const getInputType = (key, value) => {
    if (typeof value === "boolean") return "checkbox";
    if (typeof value === "number") return "number";
    return "text";
  };

  useEffect(() => {
    if (!selectedObject) return;

    const obj =
      selectedObject.type === "group"
        ? selectedObject._objects[0]
        : selectedObject;

    const updatePanel = () => {
      setFill(obj.fill || "#000000");
      setStroke(obj.stroke || "#000000");
      setStrokeWidth(obj.strokeWidth || 1);

      setPos({ left: selectedObject.left, top: selectedObject.top });
      setSize({
        width: selectedObject.width * selectedObject.scaleX,
        height: selectedObject.height * selectedObject.scaleY,
      });
      setRotation(selectedObject.angle || 0);

      const props = {};

      // If the object has originalSVGAttributes stored, use only those
      if (selectedObject.originalSVGAttributes) {
        const excludeKeys = [
          "fill",
          "stroke",
          "strokeWidth",
          "width",
          "height",
        ];

        for (let key in selectedObject.originalSVGAttributes) {
          const value = selectedObject.originalSVGAttributes[key];
          if (
            (typeof value === "string" ||
              typeof value === "number" ||
              typeof value === "boolean") &&
            !excludeKeys.includes(key)
          ) {
            props[key] = value;
          }
        }
      } else {
        // Fallback to the old method if originalSVGAttributes is not available
        const excludeKeys = [
          "left",
          "top",
          "angle",
          "type",
          "version",
          "objects",
          "_objects",
          "canvas",
          "scaleX",
          "scaleY",
          "skewX",
          "skewY",
          "flipX",
          "flipY",
          "opacity",
          "visible",
          "shadow",
          "clipPath",
          "globalCompositeOperation",
          "backgroundColor",
          "minScaleLimit",
          "maxScaleLimit",
          "lockMovementX",
          "lockMovementY",
          "lockScalingX",
          "lockScalingY",
          "lockRotation",
          "hasControls",
          "hasBorders",
          "hasRotatingPoint",
          "centeredRotation",
          "centeredScaling",
          "selectable",
          "evented",
          "perPixelTargetFind",
          "targetFindTolerance",
          "originX",
          "originY",
          "transformMatrix",
          "strokeUniform",
          "paintFirst",
          "fillRule",
          "strokeDashOffset",
          "strokeLineCap",
          "strokeLineJoin",
          "strokeMiterLimit",
          "crossOrigin",
          "filters",
          "resizeFilters",
          "fill",
          "stroke",
          "strokeWidth",
          "width",
          "height",
        ];

        // Only include properties that are explicitly set on the object (own properties)
        for (let key in selectedObject) {
          if (
            selectedObject.hasOwnProperty(key) &&
            (typeof selectedObject[key] === "string" ||
              typeof selectedObject[key] === "number" ||
              typeof selectedObject[key] === "boolean") &&
            !excludeKeys.includes(key) &&
            selectedObject[key] !== null &&
            selectedObject[key] !== undefined
          ) {
            props[key] = selectedObject[key];
          }
        }
      }

      setAdditionalProps(props);
    };

    updatePanel();

    const events = ["modified", "scaling", "moving", "rotating"];
    events.forEach((ev) => selectedObject.on(ev, updatePanel));
    return () => events.forEach((ev) => selectedObject.off(ev, updatePanel));
  }, [selectedObject, canvas]);

  const updateObjectProperty = (key, value) => {
    if (!selectedObject || !canvas) return;
    if (key === "width")
      selectedObject.set("scaleX", value / selectedObject.width);
    else if (key === "height")
      selectedObject.set("scaleY", value / selectedObject.height);
    else selectedObject.set(key, value);
    canvas.requestRenderAll();
  };

  const handleChange = (key, value) => {
    let newValue =
      typeof additionalProps[key] === "number" ? parseFloat(value) || 0 : value;
    setAdditionalProps((prev) => ({ ...prev, [key]: newValue }));
    updateObjectProperty(key, newValue);

    // sync standard inputs
    if (key === "fill") setFill(newValue);
    if (key === "stroke") setStroke(newValue);
    if (key === "strokeWidth") setStrokeWidth(newValue);
    if (key === "width") setSize((prev) => ({ ...prev, width: newValue }));
    if (key === "height") setSize((prev) => ({ ...prev, height: newValue }));
    if (key === "left" || key === "top")
      setPos((prev) => ({ ...prev, [key]: newValue }));
    if (key === "angle") setRotation(newValue);
  };

  if (!selectedObject)
    return <div className="p-4 text-gray-500 text-sm">No object selected</div>;

  return (
    <div className="space-y-4 p-2">
      <h3 className="font-semibold text-lg mb-2">Editor Panel</h3>

      {/* Colors */}
      <details className="border rounded">
        <summary className="cursor-pointer px-3 py-2 bg-gray-100 font-medium">
          Colors
        </summary>
        <div className="p-3 space-y-3">
          <div>
            <label className="block text-sm mb-1">Fill</label>
            <input
              type="color"
              value={fill}
              onChange={(e) => handleChange("fill", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Stroke</label>
            <input
              type="color"
              value={stroke}
              onChange={(e) => handleChange("stroke", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Stroke Width</label>
            <input
              type="number"
              min="0"
              max="50"
              value={strokeWidth}
              onChange={(e) => handleChange("strokeWidth", e.target.value)}
              className="border rounded w-full p-1"
            />
          </div>
        </div>
      </details>

      {/* Position */}
      <details className="border rounded">
        <summary className="cursor-pointer px-3 py-2 bg-gray-100 font-medium">
          Position
        </summary>
        <div className="p-3 flex space-x-2">
          {["left", "top"].map((axis) => (
            <div key={axis} className="flex-1">
              <label className="block text-sm">{axis.toUpperCase()}</label>
              <input
                type="number"
                value={pos[axis]}
                onChange={(e) => handleChange(axis, e.target.value)}
                className="border rounded w-full p-1"
              />
            </div>
          ))}
        </div>
      </details>

      {/* Size */}
      <details className="border rounded">
        <summary className="cursor-pointer px-3 py-2 bg-gray-100 font-medium">
          Size
        </summary>
        <div className="p-3 flex space-x-2">
          {["width", "height"].map((axis) => (
            <div key={axis} className="flex-1">
              <label className="block text-sm">
                {axis.charAt(0).toUpperCase() + axis.slice(1)}
              </label>
              <input
                type="number"
                value={size[axis]}
                onChange={(e) => handleChange(axis, e.target.value)}
                className="border rounded w-full p-1"
              />
            </div>
          ))}
        </div>
      </details>

      {/* Rotation */}
      <details className="border rounded">
        <summary className="cursor-pointer px-3 py-2 bg-gray-100 font-medium">
          Rotation
        </summary>
        <div className="p-3">
          <label className="block text-sm mb-1">Angle</label>
          <input
            type="number"
            value={rotation}
            onChange={(e) => handleChange("angle", e.target.value)}
            className="border rounded w-full p-1"
          />
        </div>
      </details>

      {/* Additional Properties */}
      {Object.keys(additionalProps).length > 0 && (
        <details className="border rounded">
          <summary className="cursor-pointer px-3 py-2 bg-gray-100 font-medium">
            Additional Properties ({Object.keys(additionalProps).length})
          </summary>

          <div className="p-3 max-h-64 overflow-y-auto grid grid-cols-2 gap-3">
            {Object.entries(additionalProps).map(([key, value]) => {
              const inputType = getInputType(key, value);

              return (
                <div key={key} className="flex flex-col">
                  <label className="text-sm font-medium mb-1 text-gray-700">
                    {key}
                  </label>

                  {inputType === "checkbox" ? (
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => handleChange(key, e.target.checked)}
                    />
                  ) : (
                    <input
                      type={inputType}
                      value={value ?? ""}
                      step={inputType === "number" ? "0.1" : undefined}
                      onChange={(e) =>
                        handleChange(
                          key,
                          inputType === "number"
                            ? Number(e.target.value)
                            : e.target.value
                        )
                      }
                      className="border rounded p-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </details>
      )}
    </div>
  );
}
