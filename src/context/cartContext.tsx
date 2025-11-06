"use client";
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

interface CartItem {
  productId: string;
  name: string;
  price: number;
  offerPrice: number;
  quantity: number;
  image: string;
  vendorId: string;
}

interface CartContextProps {
  cart: { [vendorId: string]: CartItem[] };
  addToCart: (item: CartItem, quantity: number) => void; // Now includes quantity
  removeFromCart: (
    vendorId: string,
    productId: string,
    quantity: number
  ) => void; // Now includes quantity
  clearCart: (vendorId: string) => void;
  clearAllCarts: () => void;
  getTotalItems: (vendorId: string) => number;
  getTotalPrice: (vendorId: string) => number;
}

const CartContext = createContext<CartContextProps | undefined>(undefined);

const CART_STORAGE_KEY = "userCart";

export const CartProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [cart, setCart] = useState<{ [vendorId: string]: CartItem[] }>({});
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    }
  }, [cart, isHydrated]);

  const addToCart = (item: CartItem, quantity: number) => {
    setCart((prevCart) => {
      const vendorCart = prevCart[item.vendorId] || [];
      const existingItemIndex = vendorCart.findIndex(
        (cartItem) => cartItem.productId === item.productId
      );

      if (existingItemIndex !== -1) {
        // Update quantity if item exists in the vendor's cart
        const updatedVendorCart = [...vendorCart];

        // Create a deep copy of the existing item
        const existingItem = { ...updatedVendorCart[existingItemIndex] };

        // Increment the quantity
        existingItem.quantity += quantity;

        // Replace the item in the cart with the updated item
        updatedVendorCart[existingItemIndex] = existingItem;

        return { ...prevCart, [item.vendorId]: updatedVendorCart };
      } else {
        // Add new item to the vendor's cart
        return {
          ...prevCart,
          [item.vendorId]: [...vendorCart, { ...item, quantity }],
        };
      }
    });
  };

  const removeFromCart = (
    vendorId: string,
    productId: string,
    quantity: number
  ) => {
    setCart((prevCart) => {
      const vendorCart = prevCart[vendorId] || [];
      const existingItemIndex = vendorCart.findIndex(
        (item) => item.productId === productId
      );

      if (existingItemIndex !== -1) {
        const updatedVendorCart = [...vendorCart];

        // Create a deep copy of the existing item
        const existingItem = { ...updatedVendorCart[existingItemIndex] };

        // Decrease quantity or remove item if quantity exceeds current
        if (existingItem.quantity > quantity) {
          // Decrement the quantity
          existingItem.quantity -= quantity;

          // Replace the item in the array with the updated item
          updatedVendorCart[existingItemIndex] = existingItem;

          return { ...prevCart, [vendorId]: updatedVendorCart };
        } else {
          // Remove item entirely if the quantity is less than or equal to current
          const newVendorCart = vendorCart.filter(
            (item) => item.productId !== productId
          );

          // If the updated cart is empty, remove the vendor entry
          if (newVendorCart.length === 0) {
            const { [vendorId]: _, ...remainingCart } = prevCart;
            return remainingCart;
          }
          return { ...prevCart, [vendorId]: newVendorCart };
        }
      }

      return prevCart; // No changes if item is not found
    });
  };

 const clearCart = (vendorId: string) => {
    setCart((prevCart) => {
      const { [vendorId]: _, ...remainingCart } = prevCart;
      return remainingCart;
    });
  };

  const clearAllCarts = () => {
    setCart({});
  };

  const getTotalItems = (vendorId: string): number => {
    const vendorCart = cart[vendorId] || [];
    return vendorCart.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = (vendorId: string): number => {
    const vendorCart = cart[vendorId] || [];
    return vendorCart.reduce(
      (total, item) => total + item.offerPrice * item.quantity,
      0
    );
  };

  if (!isHydrated) {
    return null;
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        clearAllCarts,
        getTotalItems,
        getTotalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextProps => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
