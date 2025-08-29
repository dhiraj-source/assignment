import { Card } from "@/components/ui/card";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  category?: string;
}

export default function ProductCard({ name, price, image, category }: ProductCardProps) {
  return (
    <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer border border-border">
      <div className="space-y-3">
        {/* Product Image */}
        <div className="aspect-square w-full bg-muted rounded-lg overflow-hidden">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = "/placeholder.svg";
            }}
          />
        </div>

        {/* Product Info */}
        <div className="space-y-1">
          <h3 className="font-medium text-card-foreground text-sm leading-tight">
            {name}
          </h3>
          <p className="text-primary font-semibold text-sm">
            ${price}
          </p>
        </div>
      </div>
    </Card>
  );
}