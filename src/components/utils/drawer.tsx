import { useAuth } from "@/context/authContext";
import { supabase } from "@/lib/supabase";
import { Icon } from "@iconify/react";
import React, { useEffect, useState } from "react";

// Category Interfaces
interface Category {
  id: number;
  name: string;
  parent_id: number | null;
  path: string;
  created_at: string;
  img: string | null;
  icon: string | null;
}

interface CategoryNode {
  data: Category;
  children: CategoryNode[];
  img: string | null;
}

// Build Category Hierarchy
const buildCategoryHierarchy = (categories: Category[]): CategoryNode[] => {
  const categoryMap = new Map<number, CategoryNode>();
  const rootNodes: CategoryNode[] = [];

  categories.forEach((category) => {
    categoryMap.set(category.id, {
      data: category,
      children: [],
      img: category.img ?? null,
    });
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

// Section Component
interface SectionProps {
  title: string;
  children: React.ReactNode;
  titleBgColor?: string;
}

const Section: React.FC<SectionProps> = ({ title, children, titleBgColor }) => {
  return (
    <div className=" ">
      <h3
        className={`text-xs font-semibold flex items-center p-2 px-3 `}
        style={{ backgroundColor: titleBgColor }}
      >
        {title}
      </h3>
      <div>{children}</div>
    </div>
  );
};

// Option Component
interface OptionProps {
  href: string;
  icon: string;
  text: string;
}

const Option: React.FC<OptionProps> = ({ href, icon, text }) => (
  <>
    <a
      href={href}
      className="hover:text-white hover:font-semibold hover:bg-green-700 rounded text-gray-500    justify-between py-3  cursor-pointer flex items-center text-sm px-3 mx-3"
    >
      <div className="flex items-center">
        <Icon icon={icon} className="w-5 h-5 mr-2" />
        <span>{text}</span>
      </div>
    </a>
  </>
);

// Category Item Component
interface CategoryItemProps {
  node: CategoryNode;
}

const CategoryItem: React.FC<CategoryItemProps> = ({ node }) => {
  const [isOpen, setIsOpen] = useState(false);

  const hasChildren = node.children.length > 0;

  // When the category is clicked, it should display all the offers under the assocatiated subcategories.
  // Update the URL to include the subcategory IDs
  let subCategoryIds = "";
  if (hasChildren) {
    subCategoryIds = `?category=${node.children.map((child) => child.data.id).join("%2C")}`;
  } else {
    subCategoryIds = `?category=${node.data.id}`;
  }
  
  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <div
        className={`hover:text-white hover:font-semibold hover:bg-green-700 rounded  flex items-center justify-between py-3 px-3 mx-3 cursor-pointer text-gray-500  ${
          isOpen ? "bg-green-200" : ""
        }`}
        onClick={toggleOpen}
      >
        {/* Folder Icon */}
        <div className="flex items-center">
          {node?.data?.icon ? (
            <Icon icon={node.data.icon} className="w-5 h-5 mr-2" />
          ) : (
            <Icon icon="mdi:folder-outline" className="w-5 h-5 mr-2" />
          )}

          <a href={`/products${subCategoryIds}`} className="text-sm">
            {node.data.name}
          </a>
        </div>

        {/* Expand/Collapse Chevron Icon */}
        {hasChildren && (
          <Icon
            icon={isOpen ? "mdi:chevron-down" : "mdi:chevron-right"}
            className="w-4 h-4"
          />
        )}
      </div>
      {hasChildren && isOpen && (
        <div className="ml-4 bg-gray-50">
          {node.children.map((childNode) => (
            <CategoryItem key={childNode.data.id} node={childNode} />
          ))}
        </div>
      )}
    </>
  );
};

// Drawer Component
const Drawer: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { isLoggedIn } = useAuth();

  useEffect(() => {
    const fetchCategories = async (): Promise<void> => {
      const { data, error } = await supabase
        .from("category")
        .select("*")
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
    <div>
      {/* Account Section */}
      <Section title="Account">
        {!isLoggedIn && (
          <>
            <Option href="/auth/login" icon="mdi:login" text="Login" />

            <Option
              href="/auth/register"
              icon="mdi:account-plus-outline"
              text="Join with us"
            />
          </>
        )}
        {isLoggedIn && (
          <>
            <Option
              href="/profile"
              icon="mdi:account-circle-outline"
              text="Profile"
            />
            <Option
              href="/my-orders"
              icon="mdi:clipboard-list-outline"
              text="My Orders"
            />
          </>
        )}
      </Section>

      {/* Vendors Section */}
      <Section title="Search By">
        <Option href="/vendors" icon="mdi:storefront-outline" text="Vendors" />
      </Section>

      {/* Categories Section */}
      <Section title="Categories">
        {error && <div className="text-red-500">{error}</div>}
        {categoryHierarchy.map((node) => (
          <>
            <CategoryItem key={node.data.id} node={node} />
            {/* <hr className="mx-0" /> */}
          </>
        ))}
      </Section>
    </div>
  );
};

export default Drawer;
