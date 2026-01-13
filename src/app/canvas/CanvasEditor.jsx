"use client";
import React, { useEffect, useRef, useState } from "react";
import * as fabric from "fabric";

const CUSTOM_PROPS = ["svgName", "svgString", "svgUpdated"];

if (!fabric.Object.prototype._svgCustomPropsPatched) {
  const baseToObject = fabric.Object.prototype.toObject;
  fabric.Object.prototype.toObject = function (propertiesToInclude) {
    const props = Array.isArray(propertiesToInclude)
      ? propertiesToInclude.slice()
      : propertiesToInclude
      ? [propertiesToInclude]
      : [];

    CUSTOM_PROPS.forEach((prop) => {
      if (this[prop] !== undefined && !props.includes(prop)) {
        props.push(prop);
      }
    });

    return baseToObject.call(this, props);
  };

  const baseInitialize = fabric.Object.prototype.initialize;
  fabric.Object.prototype.initialize = function (...args) {
    const res = baseInitialize.apply(this, args);
    if (!this.stateProperties) this.stateProperties = [];
    CUSTOM_PROPS.forEach((prop) => {
      if (!this.stateProperties.includes(prop)) {
        this.stateProperties.push(prop);
      }
    });
    return res;
  };

  fabric.Object.prototype._svgCustomPropsPatched = true;
}

const CANVAS = "Canvas_SVG_List";
const CANVAS_EDIT_MODE = "Canvas_Edit_Mode";

const svgList = {
  Blowers: [
    "FiberglassFan.svg",
    "PressureBlower.svg",
    "RadialFumeExhauster.svg",
    "RegenerativeBlower.svg",
  ],
  "Flow Meters": [
    "MagneticFlowMeter.svg",
    "MagneticFlowMeter1.svg",
    "MassFlowMeter.svg",
    "TurbineMeter.svg",
    "TurbineMeter1.svg",
    "UltrasonicFlowTransducer.svg",
    "UltrasonicFlowTransducer1.svg",
    "VenturiFlowMeter.svg",
  ],
  General: [
    "line.svg",
    "oval.svg",
    "progress-v.svg",
    "up-straight-arrow.svg",
    "SignalLampOff.svg",
    "valve.svg",
  ],
  Pipes: [
    "Pipe4.svg",
    "verticalPipeline.svg",
    "horezintalPipeLine.svg",
    "Pipe3.svg",
    "Pipe30.svg",
    "pipe1.svg",
    "22.svg",
    "Pipe_vertical_grey.svg",
    "Pipe_tee_up_grey.svg",
    "Pipe_tee_right_grey.svg",
    "Pipe_tee_left_grey.svg",
    "Pipe_tee_down_grey.svg",
    "Pipe_horizontal_grey.svg",
    "Intersection_grey.svg",
    "Flange_without_bolts_vertical_grey.svg",
    "Flange_without_bolts_horizontal_grey.svg",

    "Flange_on_top_grey.svg",
    "Flange_on_right_grey.svg",
    "Flange_on_left_grey.svg",
    "Flange_on_bottom_grey.svg",
    "EmptyWireSpool.svg",
    "Double_flange_vertical_grey.svg",
    "Double_flange_horizontal_grey.svg",

    "90_degree_bend_4_grey.svg",
    "90_degree_bend_4_grey (1).svg",
    "90_degree_bend_3_grey.svg",
    "90_degree_bend_2_grey.svg",
    "90_degree_bend_2_grey (1).svg",

    "90_degree_bend_1_middledark.svg",
    "90_degree_bend_1_grey.svg",
  ],
  Pumps: ["Pump.svg"],
  Tanks: ["Reactor.svg", "Tank.svg", "tank1.svg", "WaterTank1.svg"],
  Vehicles: [
    "18-WheelerTruck.svg",
    "AirplaneRight.svg",
    "AirplaneUp.svg",
    "Bicycle.svg",
    "Bulldozer.svg",
    "Car.svg",
    "ForkLift.svg",
    "ForkLift1.svg",
    "Helicopter.svg",
    "Loader.svg",
    "RailroadBoxCar.svg",
    "RailroadContainerCar.svg",
    "RailroadTankerCar.svg",
    "Ship.svg",
    "Simple-18-WheelerTruck.svg",
  ],
  Sensors: ["sensor.svg"],
};

export default function CanvasEditor() {
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const loadInputRef = useRef(null);
  const clipboard = useRef(null);
  const [canvasEditor, setCanvasEditor] = useState(null);
  const [selectedObject, setSelectedObject] = useState(null);
  const [selectedObjects, setSelectedObjects] = useState([]);
  const [editMode, setEditMode] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(CANVAS_EDIT_MODE);
      return stored === "true";
    }
    return false;
  });
  const [isClient, setIsClient] = useState(false);
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [pendingSvgText, setPendingSvgText] = useState(null);
  const [pendingFileName, setPendingFileName] = useState(null);
  const [dialogName, setDialogName] = useState("");
  const [dialogError, setDialogError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  // && this function used to take the name and change color of svg while mode is view
  useEffect(() => {
    if (!editMode && canvasEditor) {
      startAutoColorCycle("tank1");
    } else if (editMode) {
      stopAutoColorCycle("tank1");
    }
  }, [editMode, canvasEditor]);

  useEffect(() => setIsClient(true), []);

  const saveCanvasToStorage = (canvas = canvasEditor) => {
    if (!canvas) return;
    try {
      const jsonData = canvas.toJSON(CUSTOM_PROPS);
      const json = JSON.stringify(jsonData);
      localStorage.setItem(CANVAS, json);
    } catch (err) {
      console.error("saveCanvasToStorage: failed to serialize canvas", err);
    }
  };

  const loadCanvasFromStorage = (canvas = canvasEditor) => {
    const storedState = localStorage.getItem(CANVAS);
    if (!storedState || !canvas) return false;

    try {
      const parsedData = JSON.parse(storedState);

      canvas.loadFromJSON(
        parsedData,
        () => {
          canvas.getObjects().forEach((obj) => {
            if (obj.svgName !== undefined) {
              if (!obj.stateProperties) obj.stateProperties = [];
              CUSTOM_PROPS.forEach((prop) => {
                if (!obj.stateProperties.includes(prop)) {
                  obj.stateProperties.push(prop);
                }
              });
              const originalToObject = obj.toObject.bind(obj);
              obj.toObject = function (propertiesToInclude) {
                const props = Array.isArray(propertiesToInclude)
                  ? propertiesToInclude.slice()
                  : propertiesToInclude
                  ? [propertiesToInclude]
                  : [];
                CUSTOM_PROPS.forEach((p) => {
                  if (!props.includes(p)) props.push(p);
                });
                return originalToObject(props);
              };
            }
          });
          canvas.requestRenderAll();
          setSelectedObjects([]);
        },
        (o, object) => {
          if (o.svgName !== undefined) object.svgName = o.svgName;
          if (o.svgString !== undefined) object.svgString = o.svgString;
          if (o.svgUpdated !== undefined) object.svgUpdated = o.svgUpdated;
        }
      );
      return true;
    } catch (error) {
      console.error("Error loading canvas from storage:", error);
      return false;
    }
  };

  useEffect(() => {
    if (!isClient || typeof window === "undefined") return;
    if (!canvasRef.current || canvasEditor) return;

    fabric.Object.prototype.transparentCorners = false;

    const canvas = new fabric.Canvas(canvasRef.current, {
      backgroundColor: "#fefefe",
      preserveObjectStacking: true,
      selection: true,
    });

    const setCanvasSize = () => {
      try {
        const el = canvasRef.current;
        if (!el) return;
        const parent = el.parentElement || document.body;
        const width = Math.max(1200, parent.clientWidth || 1200);
        const height = Math.max(1420, parent.clientHeight || 1420);
        canvas.setWidth(width);
        canvas.setHeight(height);
        canvas.renderAll();
      } catch (err) {
        console.warn("setCanvasSize failed", err);
      }
    };

    setCanvasSize();
    window.addEventListener("resize", setCanvasSize);
    setCanvasEditor(canvas);
    try {
      localStorage.removeItem(`${CANVAS}_SVG_STORE`);
    } catch (err) {}

    const updateSelection = () => {
      const selected = canvas.getActiveObjects();
      setSelectedObjects(selected);
      setSelectedObject(selected[0] || null);
    };

    canvas.on("selection:created", updateSelection);
    canvas.on("selection:updated", updateSelection);
    canvas.on("selection:cleared", () => {
      setSelectedObjects([]);
      setSelectedObject(null);
    });

    canvas.on("object:modified", () => {
      saveCanvasToStorage(canvas);
    });

    canvas.on("object:added", () => {
      saveCanvasToStorage(canvas);
    });

    canvas.on("object:removed", () => {
      saveCanvasToStorage(canvas);
    });

    loadCanvasFromStorage(canvas);

    return () => {
      canvas.dispose();
      window.removeEventListener("resize", setCanvasSize);
    };
  }, [isClient]);

  const selectAll = () => {
    if (!editMode) return;
    const canvas = canvasEditor;
    if (!canvas) return;
    canvas.discardActiveObject();
    const activeSelection = new fabric.ActiveSelection(canvas.getObjects(), {
      canvas,
    });
    canvas.setActiveObject(activeSelection);
    canvas.requestRenderAll();
  };

  const groupSelected = () => {
    if (!editMode) return;
    const canvas = canvasEditor;
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (!activeObject) return;
    if (
      activeObject.type !== "activeSelection" &&
      activeObject.type !== "activeselection"
    )
      return;
    try {
      if (typeof activeObject.toGroup === "function") {
        const group = activeObject.toGroup();
        canvas.requestRenderAll();
        canvas.setActiveObject(group);
        saveCanvasToStorage(canvas);
        return;
      }
    } catch (err) {
      console.warn("groupSelected: toGroup failed, falling back", err);
    }
    const activeSelection = activeObject;
    const objects = activeSelection.getObjects();
    const group = new fabric.Group(objects, {
      left: activeSelection.left,
      top: activeSelection.top,
      name: `group-${Date.now()}`,
    });
    canvas.remove(activeSelection);
    canvas.add(group);
    canvas.setActiveObject(group);
    canvas.requestRenderAll();
    saveCanvasToStorage(canvas);
  };

  const discardSelection = () => {
    if (!editMode) return;
    const canvas = canvasEditor;
    if (!canvas) return;
    canvas.discardActiveObject();
    canvas.requestRenderAll();
  };

  const addTextBox = () => {
    if (!editMode || !canvasEditor) return;

    const canvas = canvasEditor;
    const { width = 1000, height = 700 } = canvas;

    const text = new fabric.IText("Double-click to edit", {
      left: width / 2,
      top: height / 2,
      fontSize: 20,
      fill: "#111827",
      editable: true,
      name: `text-${Date.now()}`,
    });

    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.requestRenderAll();
    saveCanvasToStorage(canvas);
  };

  const handleCopy = async () => {
    if (!editMode || !canvasEditor) return;
    const activeObject = canvasEditor.getActiveObject();
    if (!activeObject) return;

    try {
      const cloned = await activeObject.clone(CUSTOM_PROPS);
      clipboard.current = cloned;
    } catch (err) {
      console.warn("Error copying object:", err);
    }
  };

  const handlePaste = async () => {
    if (!editMode || !canvasEditor || !clipboard.current) return;

    try {
      const clonedObj = await clipboard.current.clone(CUSTOM_PROPS);

      canvasEditor.discardActiveObject();

      clonedObj.set({
        left: (clonedObj.left || 0) + 20,
        top: (clonedObj.top || 0) + 20,
        evented: true,
      });

      if (
        clonedObj.type === "activeSelection" ||
        clonedObj.type === "activeselection"
      ) {
        clonedObj.canvas = canvasEditor;
        clonedObj.forEachObject((obj) => {
          if (obj.svgName) {
            obj.set(
              "svgName",
              `${obj.svgName}_copy_${Date.now()}_${Math.random()
                .toString(36)
                .substr(2, 5)}`
            );
          }
          canvasEditor.add(obj);
        });
        clonedObj.setCoords();
      } else {
        if (clonedObj.svgName) {
          clonedObj.set("svgName", `${clonedObj.svgName}_copy_${Date.now()}`);
        }
        canvasEditor.add(clonedObj);
      }

      canvasEditor.setActiveObject(clonedObj);
      canvasEditor.requestRenderAll();
      saveCanvasToStorage();
    } catch (err) {
      console.warn("Error pasting object:", err);
    }
  };

  const processPendingSvg = (name) => {
    if (!editMode) return;
    const svgString = pendingSvgText;
    if (!svgString || !canvasEditor) return;

    const svgStringTrimmed = svgString.replace(/^\uFEFF/, "");

    fabric
      .loadSVGFromString(svgStringTrimmed)
      .then((svgData) => {
        const canvas = canvasEditor;
        const filteredObjects = svgData.objects;

        if (filteredObjects.length === 0) {
          console.warn("No objects in SVG");
          setPendingSvgText(null);
          setPendingFileName(null);
          setDialogName("");
          setDialogError("");
          setShowNameDialog(false);
          if (fileInputRef.current) fileInputRef.current.value = "";
          return;
        }

        const group = fabric.util.groupSVGElements(
          filteredObjects,
          svgData.options
        );
        const svgName = name || pendingFileName || `svg-${Date.now()}`;

        const svgStringForStore = svgStringTrimmed;

        group.svgName = svgName;
        group.svgString = svgStringForStore;
        group.svgUpdated = Date.now();

        group.set({
          left: canvas.width / 2,
          top: canvas.height / 2,
          originX: "center",
          originY: "center",
          scaleX: 0.5,
          scaleY: 0.5,
        });

        const originalToObject = group.toObject.bind(group);
        group.toObject = function (propertiesToInclude) {
          const props = Array.isArray(propertiesToInclude)
            ? propertiesToInclude.slice()
            : propertiesToInclude
            ? [propertiesToInclude]
            : [];
          CUSTOM_PROPS.forEach((p) => {
            if (!props.includes(p)) props.push(p);
          });
          return originalToObject(props);
        };

        try {
          const label = new fabric.Text(svgName, {
            left: (group.width || 0) / 2 + 10,
            top: 0,
            originX: "left",
            originY: "center",
            fontSize: 14,
            fill: "#333",
            selectable: false,
            evented: false,
            name: `label-${Date.now()}`,
          });

          if (group instanceof fabric.Group) {
            if (typeof group.addWithUpdate === "function") {
              group.addWithUpdate(label);
            } else if (Array.isArray(group.getObjects && group.getObjects())) {
              group.getObjects().push(label);
            }
            group.dirty = true;
          }
        } catch (err) {
          console.warn(
            "processPendingSvg: failed to attach label into group",
            err
          );
        }

        canvas.add(group);
        canvas.renderAll();
        saveCanvasToStorage();

        if (fileInputRef.current) fileInputRef.current.value = "";

        setPendingSvgText(null);
        setPendingFileName(null);
        setDialogName("");
        setDialogError("");
        setShowNameDialog(false);
      })
      .catch((err) => {
        console.error("Error loading SVG:", err);
        setPendingSvgText(null);
        setPendingFileName(null);
        setDialogName("");
        setDialogError("");
        setShowNameDialog(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      });
  };

  const cancelPending = () => {
    setPendingSvgText(null);
    setPendingFileName(null);
    setDialogName("");
    setDialogError("");
    setShowNameDialog(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const confirmPending = (name) => {
    const canvas = canvasEditor;
    const trimmed = (name || "").trim();
    if (!trimmed) {
      setDialogError("Name is required");
      return;
    }
    try {
      const exists = canvas
        ? canvas.getObjects().some((obj) => {
            const other = (obj && obj.svgName) || "";
            return other.trim().toLowerCase() === trimmed.toLowerCase();
          })
        : false;
      if (exists) {
        setDialogError("This name is already used");
        return;
      }
    } catch (err) {
      console.warn("confirmPending: error checking existing names", err);
    }
    setDialogError("");
    processPendingSvg(trimmed);
  };

  const COLOR_PALETTE = [
    { name: "Blue", value: "#007BFF" },
    { name: "Green", value: "#28A745" },
    { name: "Yellow", value: "#FFC107" },
    { name: "Red", value: "#DC3545" },
    { name: "Orange", value: "#FD7E14" },
    { name: "Purple", value: "#6F42C1" },
    { name: "Black", value: "#222" },
    { name: "Gray", value: "#6C757D" },
    { name: "White", value: "#FFF", border: true },
  ];

  const applyColor = (color) => {
    if (!editMode) return;
    const canvas = canvasEditor;
    if (!canvas) return;
    const fillColor = color;
    const targets = selectedObjects.length > 0 ? selectedObjects : [];
    const applyToObject = (obj) => {
      try {
        if (obj instanceof fabric.Group) {
          obj.getObjects().forEach((child) => applyToObject(child));
          obj.dirty = true;
        } else {
          if (typeof obj.set === "function") {
            const supportsFill =
              "fill" in obj ||
              obj.type === "path" ||
              obj.type === "polygon" ||
              obj.type === "polyline" ||
              obj.type === "rect" ||
              obj.type === "circle" ||
              obj.type === "triangle";
            if (supportsFill) obj.set("fill", fillColor);
          }
        }
      } catch (err) {
        console.warn("applyColor: failed to apply color to object", err, obj);
      }
    };
    targets.forEach((obj) => applyToObject(obj));
    canvas.requestRenderAll();
    saveCanvasToStorage();
  };

  const autoColorRefs = useRef({});
  const AUTO_COLORS = ["#DC3545", "#28A745", "#FFC107"];

  const applyColorToSvgName = (svgName, color) => {
    if (!canvasEditor || !svgName) return;
    try {
      const applyToObject = (o) => {
        try {
          if (o instanceof fabric.Group && o.getObjects) {
            o.getObjects().forEach(applyToObject);
            o.dirty = true;
          } else {
            if (typeof o.set === "function" && o.type !== "text") {
              o.set("fill", color);
            }
          }
        } catch (e) {}
      };

      canvasEditor.getObjects().forEach((obj) => {
        if (obj.svgName === svgName) {
          applyToObject(obj);
        } else if (obj instanceof fabric.Group && obj.getObjects) {
          obj.getObjects().forEach((child) => {
            if (child.svgName === svgName) {
              applyToObject(child);
            }
          });
        }
      });
      canvasEditor.requestRenderAll();
      saveCanvasToStorage();
    } catch (err) {
      console.warn("applyColorToSvgName failed", err);
    }
  };

  const startAutoColorCycle = (svgName) => {
    if (!svgName || !canvasEditor || editMode) return;
    stopAutoColorCycle(svgName);
    const entry = autoColorRefs.current[svgName] || {
      index: 0,
      intervalId: null,
    };
    autoColorRefs.current[svgName] = entry;

    entry.index = (entry.index + 1) % AUTO_COLORS.length;
    applyColorToSvgName(svgName, AUTO_COLORS[entry.index]);

    entry.intervalId = setInterval(() => {
      try {
        entry.index = (entry.index + 1) % AUTO_COLORS.length;
        applyColorToSvgName(svgName, AUTO_COLORS[entry.index]);
      } catch (e) {
        console.warn("auto color tick failed", e);
      }
    }, 3000);
  };

  const stopAutoColorCycle = (svgName) => {
    const entry = autoColorRefs.current[svgName];
    if (entry && entry.intervalId) {
      clearInterval(entry.intervalId);
      entry.intervalId = null;
    }
    delete autoColorRefs.current[svgName];
  };

  const stopAllAutoColorCycles = () => {
    try {
      Object.keys(autoColorRefs.current).forEach((name) => {
        const e = autoColorRefs.current[name];
        if (e && e.intervalId) clearInterval(e.intervalId);
      });
    } catch (e) {}
    autoColorRefs.current = {};
  };

  useEffect(() => {
    if (editMode) stopAllAutoColorCycles();
    return () => {};
  }, [editMode]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.startSvgAutoColor = startAutoColorCycle;
      window.stopSvgAutoColor = stopAutoColorCycle;
      window.stopAllSvgAutoColor = stopAllAutoColorCycles;
    }
    return () => {
      if (typeof window !== "undefined") {
        try {
          delete window.startSvgAutoColor;
          delete window.stopSvgAutoColor;
          delete window.stopAllSvgAutoColor;
        } catch (e) {}
      }
    };
  }, [canvasEditor, editMode]);

  const saveCanvasState = () => {
    const canvas = canvasEditor;
    if (!canvas) return;
    const json = JSON.stringify(canvas.toJSON(CUSTOM_PROPS), null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `scada-canvas-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadCanvasState = (e) => {
    if (!editMode) return;
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const json = event.target?.result;
      if (!json) return;
      canvasEditor.loadFromJSON(
        JSON.parse(json),
        () => {
          canvasEditor.getObjects().forEach((obj) => {
            if (obj.svgName !== undefined) {
              if (!obj.stateProperties) {
                obj.stateProperties = [];
              }
              CUSTOM_PROPS.forEach((prop) => {
                if (!obj.stateProperties.includes(prop)) {
                  obj.stateProperties.push(prop);
                }
              });

              const baseToObject = obj.toObject.bind(obj);
              obj.toObject = function (props) {
                const list = Array.isArray(props)
                  ? props.slice()
                  : props
                  ? [props]
                  : [];
                CUSTOM_PROPS.forEach((p) => {
                  if (!list.includes(p)) list.push(p);
                });
                return baseToObject(list);
              };
            }
          });
          canvasEditor.requestRenderAll();
          setSelectedObjects([]);
          saveCanvasToStorage();
        },
        (o, object) => {
          if (o.svgName !== undefined) object.svgName = o.svgName;
          if (o.svgString !== undefined) object.svgString = o.svgString;
          if (o.svgUpdated !== undefined) object.svgUpdated = o.svgUpdated;
        }
      );
    };
    reader.readAsText(file);
    if (loadInputRef.current) loadInputRef.current.value = "";
    console.log("new file uploaded");
  };

  const clearCanvas = () => {
    if (!editMode) return;
    const canvas = canvasEditor;
    if (!canvas) return;
    canvas.clear();
    localStorage.removeItem(CANVAS);
    saveCanvasToStorage(canvas);
  };

  useEffect(() => {
    if (!canvasEditor) return;

    const handleKeyDown = (event) => {
      if (!editMode) return;

      if (event.key === "Delete" || event.key === "Backspace") {
        const canvas = canvasEditor;
        if (!canvas) return;

        const activeObjects = canvas.getActiveObjects();
        if (!activeObjects || activeObjects.length === 0) return;

        if (activeObjects.length === 1 && activeObjects[0].isEditing) {
          return;
        }

        activeObjects.forEach((obj) => {
          if (obj.type === "group") {
            canvas.remove(obj);
          } else if (
            obj.type === "activeSelection" ||
            obj.type === "activeselection"
          ) {
            obj.getObjects().forEach((child) => {
              canvas.remove(child);
            });
          } else {
            canvas.remove(obj);
          }
        });

        canvas.discardActiveObject();
        canvas.requestRenderAll();
        setSelectedObject(null);
        setSelectedObjects([]);
        saveCanvasToStorage(canvas);
      }

      if ((event.ctrlKey || event.metaKey) && event.key === "c") {
        event.preventDefault();
        handleCopy();
      }

      if ((event.ctrlKey || event.metaKey) && event.key === "v") {
        event.preventDefault();
        handlePaste();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [canvasEditor, editMode]);

  useEffect(() => {
    if (!canvasEditor) return;
    try {
      canvasEditor.selection = !!editMode;
      canvasEditor.forEachObject((obj) => {
        try {
          obj.selectable = !!editMode;
          obj.evented = !!editMode;
          if (obj.getObjects && typeof obj.getObjects === "function") {
            obj.getObjects().forEach((child) => {
              try {
                child.selectable = !!editMode;
                child.evented = !!editMode;
              } catch (e) {}
            });
          }
        } catch (e) {}
      });
      if (!editMode) {
        canvasEditor.discardActiveObject();
        setSelectedObjects([]);
        setSelectedObject(null);
      }
      canvasEditor.requestRenderAll();
    } catch (err) {
      console.warn("Failed to toggle canvas interactivity", err);
    }
  }, [canvasEditor, editMode]);

  if (!isClient)
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <div
          className="h-10 w-10 rounded-full border-4 border-gray-200 border-t-blue-500 animate-spin"
          aria-label="Loading"
          role="status"
        />
      </div>
    );

  const EditIcon = () => (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
      />
    </svg>
  );

  const ViewIcon = () => (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    </svg>
  );

  const ShapesIcon = () => (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  );

  const SelectIcon = () => (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );

  const GroupIcon = () => (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
      />
    </svg>
  );

  const ClearIcon = () => (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  );

  const UploadIcon = () => (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
      />
    </svg>
  );

  const DownloadIcon = () => (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );

  const CopyIcon = () => (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
      />
    </svg>
  );

  const PasteIcon = () => (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
      />
    </svg>
  );

  const bringUp = () => {
    if (!editMode || !canvasEditor) return;
    const canvas = canvasEditor;
    const activeObject = canvas.getActiveObject();
    if (!activeObject) return;
    canvas.bringObjectForward(activeObject);
    canvas.requestRenderAll();
    saveCanvasToStorage();
  };

  const bringDown = () => {
    if (!editMode || !canvasEditor) return;
    const canvas = canvasEditor;
    const activeObject = canvas.getActiveObject();
    if (!activeObject) return;
    canvas.sendObjectBackwards(activeObject);
    canvas.requestRenderAll();
    saveCanvasToStorage();
  };

  const handleSvgSelect = async (category, svgFile) => {
    if (!editMode || !canvasEditor) return;
    try {
      const res = await fetch(
        `/${encodeURIComponent(category)}/${encodeURIComponent(svgFile)}`
      );
      if (!res.ok) throw new Error("Failed to fetch SVG");
      const svgString = await res.text();
      setPendingSvgText(svgString);
      setPendingFileName(svgFile);
      setDialogName(svgFile.replace(/\.svg$/i, ""));
      setDialogError("");
      setShowNameDialog(true);
    } catch (err) {
      alert("Error loading SVG: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Sidebar Panel */}
      <div className="w-80 bg-card border-r border-border shadow-lg flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <h1 className="text-xl font-bold text-foreground mb-1">
            SCADA Editor
          </h1>
          <p className="text-sm text-muted-foreground">
            Design industrial systems
          </p>
        </div>

        {/* Mode Section */}
        <div className="p-6 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground mb-4">Mode</h3>
          <button
            onClick={() => {
              const newMode = !editMode;
              setEditMode(newMode);
              localStorage.setItem(CANVAS_EDIT_MODE, newMode.toString());
            }}
            className={`w-full px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-3 shadow-sm ${
              editMode
                ? "bg-accent text-accent-foreground hover:bg-accent/80"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            }`}
          >
            {editMode ? <EditIcon /> : <ViewIcon />}
            <span>{editMode ? "Edit Mode" : "View Mode"}</span>
          </button>
        </div>

        {/* Actions Section */}
        <div className="p-6 border-b border-border flex-1">
          <h3 className="text-sm font-semibold text-foreground mb-4">
            Actions
          </h3>
          <div className="space-y-2">
            <button
              onClick={() => {
                const canvas = canvasEditor;
                if (!canvas) return;
                const { width = 1000, height = 700 } = canvas;
                const red = new fabric.Rect({
                  top: Math.random() * (height - 50),
                  left: Math.random() * (width - 80),
                  width: 80,
                  height: 50,
                  fill: "red",
                  name: `rect-red-${Date.now()}`,
                });
                const blue = new fabric.Circle({
                  top: Math.random() * (height - 50),
                  left: Math.random() * (width - 50),
                  radius: 35,
                  fill: "blue",
                  name: `circle-blue-${Date.now()}`,
                });
                const green = new fabric.Triangle({
                  top: Math.random() * (height - 60),
                  left: Math.random() * (width - 60),
                  width: 60,
                  height: 60,
                  fill: "green",
                  name: `rect-green-${Date.now()}`,
                });
                canvas.add(red, blue, green);
                canvas.requestRenderAll();
                saveCanvasToStorage();
              }}
              className={`w-full px-4 py-3 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-start gap-3 shadow-sm hover:shadow-md ${
                !editMode
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-secondary/80"
              }`}
              disabled={!editMode}
            >
              <ShapesIcon />
              <span>Add Shapes</span>
            </button>

            <button
              onClick={selectAll}
              className={`w-full px-4 py-3 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-start gap-3 shadow-sm hover:shadow-md ${
                !editMode
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-secondary/80"
              }`}
              disabled={!editMode}
            >
              <SelectIcon />
              <span>Select All</span>
            </button>

            <button
              onClick={groupSelected}
              className={`w-full px-4 py-3 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-start gap-3 shadow-sm hover:shadow-md ${
                !editMode
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-secondary/80"
              }`}
              disabled={!editMode}
            >
              <GroupIcon />
              <span>Group</span>
            </button>

            <button
              onClick={discardSelection}
              className={`w-full px-4 py-3 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-start gap-3 shadow-sm hover:shadow-md ${
                !editMode
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-secondary/80"
              }`}
              disabled={!editMode}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              <span>Discard</span>
            </button>

            <button
              onClick={handleCopy}
              className={`w-full px-4 py-3 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-start gap-3 shadow-sm hover:shadow-md ${
                !editMode
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-secondary/80"
              }`}
              disabled={!editMode}
            >
              <CopyIcon />
              <span>Copy</span>
            </button>

            <button
              onClick={handlePaste}
              className={`w-full px-4 py-3 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-start gap-3 shadow-sm hover:shadow-md ${
                !editMode
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-secondary/80"
              }`}
              disabled={!editMode}
            >
              <PasteIcon />
              <span>Paste</span>
            </button>

            <button
              onClick={bringUp}
              className={`w-full px-4 py-3 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-start gap-3 shadow-sm hover:shadow-md ${
                !editMode
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-secondary/80"
              }`}
              disabled={!editMode}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                />
              </svg>
              <span>Bring Up</span>
            </button>

            <button
              onClick={bringDown}
              className={`w-full px-4 py-3 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-start gap-3 shadow-sm hover:shadow-md ${
                !editMode
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-secondary/80"
              }`}
              disabled={!editMode}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 8v12m0 0l4-4m-4 4l-4-4m6-8v12m0 0l-4-4m4 4l4-4"
                />
              </svg>
              <span>Bring Down</span>
            </button>

            <button
              onClick={addTextBox}
              className={`w-full px-4 py-3 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-start gap-3 shadow-sm hover:shadow-md ${
                !editMode
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-secondary/80"
              }`}
              disabled={!editMode}
            >
              <span className="inline-flex w-4 h-4 items-center justify-center border border-current text-[10px] leading-none">
                T
              </span>
              <span>Add Text</span>
            </button>

            <button
              onClick={clearCanvas}
              className={`w-full px-4 py-3 bg-destructive text-destructive-foreground rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-start gap-3 shadow-sm hover:shadow-md ${
                !editMode
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-destructive/80"
              }`}
              disabled={!editMode}
            >
              <ClearIcon />
              <span>Clear Canvas</span>
            </button>
          </div>
        </div>

        {/* File Operations */}
        <div className="p-6 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground mb-4">Files</h3>
          <div className="space-y-2">
            <label
              className={`w-full px-4 py-3 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-start gap-3 shadow-sm hover:shadow-md cursor-pointer  ${
                !editMode
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-secondary/80"
              }`}
            >
              <UploadIcon />
              <span>Load JSON</span>
              <input
                type="file"
                accept=".json"
                ref={loadInputRef}
                onChange={loadCanvasState}
                className="hidden"
                disabled={!editMode}
              />
            </label>
            <button
              onClick={saveCanvasState}
              className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-start gap-3 shadow-sm hover:shadow-md hover:bg-primary/90"
            >
              <DownloadIcon />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* SVG Library Section */}
        <div className="p-6 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground mb-4">
            SVG Library
          </h3>
          <div className="space-y-2">
            {Object.entries(svgList).map(([category, svgs]) => (
              <div key={category} className="mb-2">
                <button
                  type="button"
                  className="w-full flex justify-between items-center px-2 py-2 bg-secondary rounded hover:bg-secondary/80 text-left font-semibold text-sm"
                  onClick={() =>
                    setSelectedCategory(
                      selectedCategory === category ? "" : category
                    )
                  }
                  disabled={!editMode}
                >
                  <span>{category}</span>
                  <span>{selectedCategory === category ? "▲" : "▼"}</span>
                </button>
                {selectedCategory === category && (
                  <div className="pl-4 pt-2">
                    {svgs.length ? (
                      <div className="grid grid-cols-2 gap-2">
                        {svgs.map((svg) => (
                          <button
                            key={svg}
                            className="flex flex-col items-center border rounded p-2 bg-muted hover:bg-accent"
                            style={{ minWidth: 0 }}
                            disabled={!editMode}
                            onClick={() => handleSvgSelect(category, svg)}
                          >
                            <img
                              src={`/${encodeURIComponent(
                                category
                              )}/${encodeURIComponent(svg)}`}
                              alt={svg}
                              className="w-12 h-12 object-contain mb-1"
                            />
                            <span className="text-xs truncate w-full">
                              {svg.replace(/\.svg$/i, "")}
                            </span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        No SVGs found.
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Quick Color Buttons */}
        <div className="p-6 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground mb-4">
            Quick Colors
          </h3>
          <div className="flex gap-2 justify-between">
            <button
              onClick={() => applyColor("#007BFF")}
              disabled={!editMode}
              className="w-8 h-8 rounded-full bg-blue-500 hover:bg-blue-600 border-2 border-blue-700 transition-all duration-200 shadow-sm flex items-center justify-center"
              title="Apply Blue"
            />
            <button
              onClick={() => applyColor("#28A745")}
              disabled={!editMode}
              className="w-8 h-8 rounded-full bg-green-500 hover:bg-green-600 border-2 border-green-700 transition-all duration-200 shadow-sm flex items-center justify-center"
              title="Apply Green"
            />
            <button
              onClick={() => applyColor("#FFC107")}
              disabled={!editMode}
              className="w-8 h-8 rounded-full bg-yellow-400 hover:bg-yellow-500 border-2 border-yellow-600 transition-all duration-200 shadow-sm flex items-center justify-center"
              title="Apply Yellow"
            />
            <button
              onClick={() => applyColor("#DC3545")}
              disabled={!editMode}
              className="w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 border-2 border-red-700 transition-all duration-200 shadow-sm flex items-center justify-center"
              title="Apply Red"
            />
          </div>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 relative">
        <canvas ref={canvasRef} className="w-full h-full " />
      </div>

      {/* Name Dialog for SVG */}
      {showNameDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-80">
            <h2 className="text-lg font-semibold mb-2">Enter SVG Name</h2>
            <input
              className="w-full border rounded px-2 py-1 mb-2"
              value={dialogName}
              onChange={(e) => setDialogName(e.target.value)}
              placeholder="Unique name"
              autoFocus
              disabled={!editMode}
              onKeyDown={(e) => {
                if (e.key === "Enter") confirmPending(dialogName);
              }}
            />
            {dialogError && (
              <div className="text-red-500 text-xs mb-2">{dialogError}</div>
            )}
            <div className="flex justify-end gap-2">
              <button
                className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-sm"
                onClick={cancelPending}
                type="button"
              >
                Cancel
              </button>
              <button
                className="px-3 py-1 rounded bg-primary text-primary-foreground hover:bg-primary/90 text-sm"
                onClick={() => confirmPending(dialogName)}
                type="button"
                disabled={!editMode}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
