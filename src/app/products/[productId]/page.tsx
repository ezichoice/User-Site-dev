import ProductPageClient from "@/components/productPageCom/productPageClient";
import { supabase } from "@/lib/supabase";

export const revalidate = 0;

// Server-side function to fetch the product data
async function fetchProduct(productId: string) {
  const { data, error } = await supabase
    .from("offers")
    .select(`*, offerVariation(*), vendor_id(*)`)
    .eq("id", productId);

  if (error) throw new Error(error.message);

  return data[0];
}

// Add the `generateMetadata` function to set the page metadata dynamically
export async function generateMetadata({
  params,
}: {
  params: { productId: string };
}) {
  const product = await fetchProduct(params.productId);

  const imageUrl = product?.offerVariation[0].img_url ?? `/logo.png`;
  console.log(product.offerVariation[0]?.img_url);

  return {
    title: `${product.name} - Product Details`,
    description:
      product.description || "Explore the best deals on our products.",
    openGraph: {
      title: `${product.name} - Product Details`,
      description: product.description || "Discover this amazing product!",
      images: [
        {
          url: imageUrl,
          alt: product.name,
        },
      ],
      type: "website", // Change from "product" to "website"
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} - Product Details`,
      description: product.description || "Discover this amazing product!",
      images: [imageUrl],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: { productId: string };
}) {
  const product = await fetchProduct(params.productId);

  return (
    <>
      <ProductPageClient product={product} />
    </>
  );
}
