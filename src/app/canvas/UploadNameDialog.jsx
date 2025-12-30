"use client";
import React from "react";

export default function UploadNameDialog({
  visible,
  pendingFileName,
  dialogName,
  setDialogName,
  onConfirm,
  onCancel,
  error,
}) {
  if (!visible) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black opacity-50"
        onClick={onCancel}
      />
      <div className="bg-white rounded-lg shadow-xl p-6 z-10 w-11/12 max-w-md">
        <h3 className="text-lg font-semibold mb-3">Name uploaded SVG</h3>
        <p className="text-sm text-gray-600 mb-3">File: {pendingFileName}</p>
        <input
          value={dialogName}
          onChange={(ev) => setDialogName(ev.target.value)}
          className="w-full border rounded px-3 py-2 mb-4"
          placeholder="Enter a name"
        />
        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="px-3 py-2 bg-gray-200 rounded">
            Cancel
          </button>
          <button
            onClick={() => onConfirm(dialogName)}
            className="px-3 py-2 bg-blue-600 text-white rounded"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
