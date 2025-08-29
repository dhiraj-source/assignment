import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface ProductsHeaderProps {
  firstBtn: () => void;
  secondBtn: () => void;
  heading: string;
  buttonContent: {
    first: string;
    second: string;
  };
}

export default function ProductsHeader({heading, buttonContent, firstBtn, secondBtn }: ProductsHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground pr-4">{heading}</h1>
      </div>
      
      <div className="flex gap-3">
        <Button variant="outline" onClick={firstBtn} className="bg-gray-200 text-blue-500  w-20 md:w-24 lg:w-40">
          {buttonContent.first}
        </Button>
        <Button onClick={secondBtn} className="w-20 md:w-24 lg:w-40">
          {buttonContent.second}
        </Button>
      </div>
    </div>
  );
}