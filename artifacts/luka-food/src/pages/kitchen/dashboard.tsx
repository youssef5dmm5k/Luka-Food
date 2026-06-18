import { Switch, Route } from "wouter";
import { OrdersManager } from "./orders";
import { MenuManager } from "./menu-manager";
import { LayoutDashboard, UtensilsCrossed, Settings } from "lucide-react";
import { Link, useLocation } from "wouter";

export function KitchenDashboard() {
  const [location] = useLocation();

  const navItems = [
    { href: "/kitchen", label: "الطلبات الحية", icon: <LayoutDashboard className="w-5 h-5" /> },
    { href: "/kitchen/menu", label: "إدارة القائمة", icon: <UtensilsCrossed className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 border-l bg-card flex flex-col">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-black text-primary tracking-tight">LUKA KITCHEN</h1>
          <p className="text-sm text-muted-foreground">لوحة إدارة المطعم</p>
        </div>
        <nav className="flex-1 p-4 space-y-2 flex flex-row md:flex-col overflow-x-auto md:overflow-visible">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors whitespace-nowrap md:whitespace-normal ${
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <Switch>
          <Route path="/kitchen/menu" component={MenuManager} />
          <Route path="/kitchen" component={OrdersManager} />
        </Switch>
      </main>
    </div>
  );
}
