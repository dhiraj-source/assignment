import { 
  Store, 
  Package, 
  ShoppingCart, 
  BookOpen, 
  TrendingUp, 
  ArrowLeftRight, 
  Archive, 
  Settings,
  Circle
} from "lucide-react";

const sidebarItems = [
  { name: "Home", icon: Store, active: false },
  { name: "Stores", icon: Package, active: false },
  { name: "Products", icon: Package, active: true },
  { name: "Catalogues", icon: BookOpen, active: false },
  { name: "Promotions", icon: TrendingUp, active: false },
  { name: "Reports", icon: Package, active: false },
  { name: "Docs", icon: Package, active: false },
  { name: "Settings", icon: Settings, active: false },
];

// 
export default function Sidebar() {
  return (
    <div className="w-64 h-screen bg-sidebar border-r border-sidebar-border flex flex-col bg-white px-4">  
        <div className="flex items-center gap-2 py-4">
          <div className="w-28 flex items-center justify-center">
            <img src="images/lemonLogo.png"/>
          </div>
        </div>
        <div className="w-full border-b-[0.5px]"></div>
      <nav className="flex-1 py-3">
        <ul className="space-y-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.name}>
                <button
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    item.active
                      ? "bg-[#ECF7FF] text-blue-500"
                      : "text-sidebar-accent-foreground  hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  }`}
                >
                  <img src="/images/icons/Rectanglelogo.png" className="w-4 h-4"/>
                  <span className="font-normal text-sm">{item.name}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-muted-foreground">
              <img src="images/icons/Ellipse.png"/>
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-accent-foreground truncate">
            Andy Samberg
            </p>
            <p className="text-xs text-sidebar-foreground truncate">
            andy.samberg@gmail.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}