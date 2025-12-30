"use client";

import React, { useState } from "react";
import Image from "next/image";

export default function Sidebar({ svgList = [], onAddSvg }) {
  const [openCategory, setOpenCategory] = useState(null);

  const toggleCategory = (index) => {
    setOpenCategory(openCategory === index ? null : index);
  };

  return (
    <div className="w-full h-full p-4 bg-white flex flex-col items-center overflow-y-auto">
      <h3 className="text-lg font-semibold mb-4">Elements</h3>

      <div className="w-full">
        {svgList.map((category, idx) => (
          <div key={idx} className="mb-2 w-full">
            {/* عنوان الفئة */}
            <div
              className="cursor-pointer p-2 bg-gray-200 rounded hover:bg-gray-300 flex justify-between items-center"
              onClick={() => toggleCategory(idx)}
            >
              <span className="font-medium">{category.name}</span>
              <span>{openCategory === idx ? "▲" : "▼"}</span>
            </div>

            {/* قائمة الـ SVGs */}
            {openCategory === idx && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                {category.svgs.map((item, index) => (
                  <div
                    key={index}
                    className="cursor-pointer flex justify-center items-center p-2 hover:bg-gray-100 rounded"
                    onClick={() => onAddSvg(item.path)}
                  >
                    <Image
                      src={item.path}
                      alt={item.name}
                      width={48}
                      height={48}
                      priority
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
