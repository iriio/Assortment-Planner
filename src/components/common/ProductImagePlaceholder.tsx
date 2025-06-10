import React from "react";

interface ProductImagePlaceholderProps {
  productName: string;
  imageUrl?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const ProductImagePlaceholder: React.FC<ProductImagePlaceholderProps> = ({
  productName,
  imageUrl,
  size = "md",
  className = "",
}) => {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={productName}
        className={`w-full h-full object-cover ${className}`}
      />
    );
  }

  return (
    <div
      className={`w-full h-full flex flex-col items-center justify-center text-center p-4 border-2 border-dashed border-slate-200 bg-slate-50 ${className}`}
    >
      <div className={`mb-${size === "sm" ? "1" : "3"}`}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className={`${sizeClasses[size]} text-slate-300`}
        >
          <path d="M12.378 1.602a.75.75 0 00-.756 0L3 6.632l9 5.25 9-5.25-8.622-5.03zM21.75 7.93l-9 5.25v9l8.628-5.032a.75.75 0 00.372-.648V7.93zM11.25 22.18v-9l-9-5.25v8.57a.75.75 0 00.372.648l8.628 5.033z" />
        </svg>
      </div>
      <span
        className={`${
          size === "sm" ? "text-[10px]" : "text-sm"
        } font-medium text-slate-600 line-clamp-2`}
      >
        {productName}
      </span>
    </div>
  );
};

export default ProductImagePlaceholder;
