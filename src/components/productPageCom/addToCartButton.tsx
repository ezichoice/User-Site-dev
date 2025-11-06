import { useAuth } from "@/context/authContext";
import { useCart } from "@/context/cartContext";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import LoginDialog, { useLoginDialog } from "../utils/loginDialog";

interface AddToCartButtonProps {
  productId: string;
  name: string;
  price: number;
  offerPrice: number;
  image: string;
  vendorId: string;
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  productId,
  name,
  price,
  offerPrice,
  image,
  vendorId,
}) => {
  const [quantity, setQuantity] = useState<number>(1);
  const router = useRouter();
  const { open, showDialog, hideDialog } = useLoginDialog();

  const { addToCart } = useCart(); 
  const { isLoggedIn } = useAuth();

  const decreaseQuantity = (): void => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const increaseQuantity = (): void => {
    setQuantity((prev) => prev + 1);
  };

  const handleAddToCart = (): void => {
    if (!isLoggedIn) {
      showDialog();
    } else {
      addToCart(
        {
          productId,
          name,
          price,
          offerPrice,
          quantity,
          vendorId,
          image,
        },
        quantity
      );
    }
  };

  return (
    <>
    <div className="flex items-center space-x-2 pt-4">
      <div className="flex items-center border border-gray-300 rounded">
        <button
          onClick={decreaseQuantity}
          className="px-2 py-1 bg-gray-100 text-gray-600 hover:bg-gray-200"
        >
          -
        </button>
        <input
          type="number"
          value={quantity}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setQuantity(Math.max(1, parseInt(e.target.value) || 1))
          }
          className="w-12 text-center"
        />
        <button
          onClick={increaseQuantity}
          className="px-2 py-1 bg-gray-100 text-gray-600 hover:bg-gray-200"
        >
          +
        </button>
      </div>
      <button
        onClick={handleAddToCart}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Add to Cart
      </button>
    </div>
    <LoginDialog open={open} onClose={hideDialog} />
   </>
  );
};

export default AddToCartButton;
