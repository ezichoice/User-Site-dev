"use client";
import { Icon } from "@iconify/react";
import React from "react";

interface Category {
  id: number;
  name: string;
  parent_id: number | null;
  path: string;
  created_at: string;
  valid: boolean;
  img?: string;
  icon: string;
}

interface CategoryNode extends Category {
  children: CategoryNode[];
}

interface FilterOptionProps {
  categoryTree: CategoryNode[];
  checkedCategories: number[];
  setCheckedCategories: (ids: number[]) => void;
  minPrice: number | undefined;
  maxPrice: number | undefined;
  setMinPrice: (price: number | undefined) => void;
  setMaxPrice: (price: number | undefined) => void;
}

const FilterOption: React.FC<FilterOptionProps> = ({
  categoryTree,
  checkedCategories,
  setCheckedCategories,
  minPrice,
  maxPrice,
  setMinPrice,
  setMaxPrice,
}) => {
  const handleCategoryToggle = (
    categoryId: number,
    allDescendantIds: number[]
  ) => {
    const currentlySelected = allDescendantIds.every((id) =>
      checkedCategories.includes(id)
    );

    if (currentlySelected) {
      const updatedCategories = checkedCategories.filter(
        (id) => !allDescendantIds.includes(id)
      );
      setCheckedCategories(updatedCategories);
    } else {
      const newChecked = new Set(checkedCategories);
      allDescendantIds.forEach((id) => newChecked.add(id));
      setCheckedCategories(Array.from(newChecked));
    }
  };

  // Get all descendant IDs of a category node (including the category itself)
  const getAllDescendantIds = (node: CategoryNode): number[] => {
    // Get the last level nodes of the category tree
    // from the given node.
    // Check how many of the last level nodes are selected
    // and return the IDs accordingly.
    
    return getLastLevelNodes(node).map((child) => child.id);
  };

  const getLastLevelNodes = (node: CategoryNode) => {
    // Get the last level nodes of the category tree
    // from the given node

    // The node can be a leaf node or a parent node.
    // If it is a leaf node, return the node itself.
    if (node.children.length === 0) {
      return [node];
    }

    // If it is a parent node, recursively get the last level nodes from its children
    let lastLevelNodes: CategoryNode[] = [];
    node.children.forEach((child: CategoryNode) => {
      lastLevelNodes = lastLevelNodes.concat(getLastLevelNodes(child));
    });

    return lastLevelNodes;
  }

  // Check if a node is fully selected, partially selected, or not selected
  const getNodeSelectionState = (
    node: CategoryNode
  ): "checked" | "partial" | "unchecked" => {
    const allIds = getAllDescendantIds(node);
    const selectedCount = allIds.filter((id) =>
      checkedCategories.includes(id)
    ).length;
    if (selectedCount === 0) return "unchecked";
    if (selectedCount === allIds.length) return "checked";
    return "partial";
  };

  // Recursive component to render category tree
  const CategoryTree: React.FC<{ nodes: CategoryNode[]; level?: number }> = ({
    nodes,
    level = 0,
  }) => {
    return (
      <ul className={`space-y-2 mt-2`}>
        {nodes.map((node) => {
          const state = getNodeSelectionState(node);
          const allDescendantIds = getAllDescendantIds(node);
          const isChecked = state === "checked";
          const isPartial = state === "partial";
          return (
            <li key={node.id}>
              <div className="flex items-center">
                {/* Parent checkbox */}
                <input
                  type="checkbox"
                  onChange={() =>
                    handleCategoryToggle(node.id, allDescendantIds)
                  }
                  checked={isChecked}
                  ref={(el) => {
                    if (el) {
                      // Set indeterminate state
                      el.indeterminate = isPartial;
                    }
                  }}
                  className="w-3 h-3 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                {/* Category Icon */}
                {node.icon && (
                  <Icon
                    icon={node.icon}
                    className="w-4 h-4 text-gray-600 ml-2"
                    aria-hidden="true"
                  />
                )}
                <label className="ml-2 text-xs font-medium text-gray-900">
                  {node.name}
                </label>
              </div>
              {/* Render children */}
              {node.children.length > 0 && (
                <div
                  className="ml-4 mt-1 border-l border-gray-200 pl-2"
                  style={{ paddingLeft: `${level * 8}px` }}
                >
                  <CategoryTree nodes={node.children} level={level + 1} />
                </div>
              )}
            </li>
          );
        })}
      </ul>
    );
  };

  // Handler for price range changes
  const handlePriceChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "min" | "max"
  ) => {
    const value = e.target.value;
    const numericValue = Number(value);

    if (type === "min") {
      setMinPrice(
        value === "" ? undefined : numericValue >= 0 ? numericValue : 0
      );
    } else {
      setMaxPrice(
        value === "" ? undefined : numericValue >= 0 ? numericValue : 0
      );
    }
  };

  return (
    <div>
      {/* Filter Option Header */}
      <h2 className="mb-3 text-sm font-semibold flex items-center">
        <Icon icon="mdi:filter" className="w-4 h-4 mr-1" />
        Filter Options
      </h2>
      {/* Divider */}
      <hr className="my-4 border-gray-300" />

      {/* Categories Section */}
      <h2 className="mb-3 text-sm font-semibold flex items-center">
        <Icon icon="mdi:filter" className="w-4 h-4 mr-1" />
        Categories
      </h2>
      <CategoryTree nodes={categoryTree} />

      {/* Horizontal Rule */}
      <hr className="my-4 border-gray-300" />

      {/* Price Range Section */}
      {/* <div>
        <h2 className="text-sm font-semibold flex items-center mb-2">
          <Icon icon="mdi:currency-inr" className="w-4 h-4 mr-1" />
          Price Range (LKR)
        </h2>
        <div className="flex-row items-center">
          <div className="flex flex-col">
            <label htmlFor="minPrice" className="text-xxs text-gray-700">
              Min
            </label>
            <div className="relative">
              <span className="absolute left-1 top-1/2 transform -translate-y-1/2 text-gray-500">
                ₨
              </span>
              <input
                type="number"
                id="minPrice"
                value={minPrice !== undefined ? minPrice : ""}
                onChange={(e) => handlePriceChange(e, "min")}
                placeholder="0"
                className="pl-6 pr-2 py-1 border border-gray-300 rounded text-xs w-full"
                min="0"
              />
            </div>
          </div>
          <div className="flex flex-col">
            <label htmlFor="maxPrice" className="text-xxs text-gray-700">
              Max
            </label>
            <div className="relative">
              <span className="absolute left-1 top-1/2 transform -translate-y-1/2 text-gray-500">
                ₨
              </span>
              <input
                type="number"
                id="maxPrice"
                value={maxPrice !== undefined ? maxPrice : ""}
                onChange={(e) => handlePriceChange(e, "max")}
                placeholder="1000"
                className="pl-6 pr-2 py-1 border border-gray-300 rounded text-xs w-full"
                min="0"
              />
            </div>
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default React.memo(FilterOption);
