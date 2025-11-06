import { supabase } from "@/lib/supabase";
import { Icon } from "@iconify/react";
import React, { useEffect, useState } from "react";

interface Category {
  id: number;
  name: string;
  parent_id: number | null;
  path: string;
  created_at: string;
}

interface CategoryNode {
  data: Category;
  children: CategoryNode[];
}

const buildCategoryHierarchy = (categories: Category[]): CategoryNode[] => {
  const categoryMap = new Map<number, CategoryNode>();
  const rootNodes: CategoryNode[] = [];

  categories.forEach((category) => {
    categoryMap.set(category.id, { data: category, children: [] });
  });

  categories.forEach((category) => {
    const node = categoryMap.get(category.id)!;
    if (category.parent_id === null) {
      rootNodes.push(node);
    } else {
      const parentNode = categoryMap.get(category.parent_id);
      if (parentNode) {
        parentNode.children.push(node);
      }
    }
  });

  return rootNodes;
};

interface CategoryItemProps {
  node: CategoryNode;
}

const CategoryItem: React.FC<CategoryItemProps> = ({ node }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  if (node.children.length === 0) {
    return (
      <a
        href={`/products?category=${node.data.id}`}
        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
      >
        {node.data.name}
      </a>
    );
  }

  return (
    <div
      className="relative group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex w-full justify-between items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
        <p>{node.data.name}</p>
        <Icon
          icon="ic:round-keyboard-arrow-right"
          className={`transition-transform transform ${
            isHovered ? "rotate-90" : ""
          }`}
        />
      </div>
      {isHovered && (
        <div className="absolute left-full top-0 mt-0 w-48 bg-white rounded-md shadow-lg py-1 z-50">
          {node.children.map((childNode) => (
            <CategoryItem key={childNode.data.id} node={childNode} />
          ))}
        </div>
      )}
    </div>
  );
};

const CategoriesDropdown: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async (): Promise<void> => {
      const { data, error } = await supabase
        .from("category")
        .select(`*`)
        .eq("valid", true);

      if (error) {
        setError(error.message);
      } else {
        setCategories(data as Category[]);
      }
    };

    fetchCategories();
  }, []);

  const categoryHierarchy = buildCategoryHierarchy(categories);

  return (
    <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
      {error && <div className="px-4 py-2 text-sm text-red-500">{error}</div>}
      {categoryHierarchy.map((node) => (
        <CategoryItem key={node.data.id} node={node} />
      ))}
    </div>
  );
};

export default CategoriesDropdown;
