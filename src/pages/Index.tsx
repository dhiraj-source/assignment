import { useState } from "react";
import { useAtom } from "jotai";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import ProductsHeader from "@/components/ProductsHeader";
import CategoryTabs from "@/components/CategoryTabs";
import CategoryModal from "@/components/CategoryModal";
import { categoriesAtom, productsAtom, activeCategoryAtom } from "@/lib/store";
import { useNavigate } from "react-router-dom";
import { Product } from "@/types";
import { Badge } from "@/components/ui/badge";


const Index = () => {
  const navigate = useNavigate();
  const [categories] = useAtom(categoriesAtom);
  const [products] = useAtom(productsAtom);
  const [isCategoryModalOpen, setCategoryModalOpen] = useState(false);

  console.log("Products:", products);
  console.log("Filtered Products:", isCategoryModalOpen);   
  console.log("Categoriescategories:", categories);
  const productsByCategory: Record<string, Product[]> = {};

  const handleAddCategory = () => {
    setCategoryModalOpen(true);
  };
  products.forEach(product => {
    if (!productsByCategory[product.category]) {
      productsByCategory[product.category] = [];
    }
    productsByCategory[product.category].push(product);
  });
  const handleAddProduct = () => {
    navigate("/add-product");
  };


  return (
    <Layout>
      <ProductsHeader
        heading ="Products"
        buttonContent={{ first: "Add Category", second: "Add Product" }}
        firstBtn={handleAddCategory}
        secondBtn={handleAddProduct}
      />

      <div className="bg-white rounded-lg">
        {categories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No categories yet. Add a category to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-3">
            {categories.map(category => (
              <div key={category.id} className="bg-[#F8F8F8] rounded-lg shadow-sm p-4">
                <h2 className="text-md font-medium text-gray-900 mb-4 pb-2">
                  {category.name}
                </h2>

                <div className="space-y-3">
                  {productsByCategory[category.id] ? (
                    productsByCategory[category.id].map((product, index) => (
                      <div key={product.id} className="flex  p-2 bg-white rounded-md">
                        <div className="flex-shrink-0  flex items-center justify-center  rounded-md mr-3">
                          <div className=" w-full  rounded-sm overflow-hidden">
                            <img
                              src={"images/Rectangle.png"}
                              alt={product.name}
                              className="w-full h-full object-fill"
                              onError={(e) => {
                                e.currentTarget.src = "/placeholder.svg";
                              }}
                            />
                          </div>
                        </div>
                        <div className="flex-1 pl-1 min-w-0 justify-around">
                          <p className="text-sm font-medium truncate">
                            {product.name}
                          </p>
                          <p className="text-sm text-gray-500 pb-2">
                            ₹{product.priceInr.toFixed(2)}
                          </p>
                          <div className="flex mb-0">
                            <span className="text-sm bg-[#ECF7FF] text-blue-500 py-1 px-2 rounded-sm">{product.brand}</span>
                            </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No products in this category
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
      />
    </Layout>
  );
};

export default Index;
