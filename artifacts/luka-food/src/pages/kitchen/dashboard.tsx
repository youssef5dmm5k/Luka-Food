import { Switch, Route } from "wouter";
import { OrdersManager } from "./orders";
import { MenuManager } from "./menu-manager";
import { CookDisplay } from "./cook-display";
import { LayoutDashboard, UtensilsCrossed, MonitorCheck } from "lucide-react";
import { Link, useLocation } from "wouter";

export function KitchenDashboard() {
  const [location] = useLocation();

  const navItems = [
    { href: "/kitchen", label: "الطلبات الحية", icon: <LayoutDashboard className="w-5 h-5" /> },
    { href: "/kitchen/display", label: "شاشة الطباخ", icon: <MonitorCheck className="w-5 h-5" /> },
    { href: "/kitchen/menu", label: "إدارة القائمة", icon: <UtensilsCrossed className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row" dir="rtl">
      {/* Sidebar */}
      <aside className="w-full md:w-64 border-l bg-card flex flex-col">
        <div className="p-5 border-b flex items-center gap-3">
          <img src="/logo.jpg" alt="Luka" className="h-10 w-10 rounded-xl object-cover" />
          <p className="text-xs text-muted-foreground">لوحة إدارة المطعم</p>
        </div>
        <nav className="flex-1 p-4 space-y-1.5 flex flex-row md:flex-col overflow-x-auto md:overflow-visible">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors whitespace-nowrap md:whitespace-normal text-sm ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
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
      <main className="flex-1 overflow-y-auto">
        <Switch>
          <Route path="/kitchen/display" component={CookDisplay} />
          <Route path="/kitchen/menu" component={MenuManager} />
          <Route path="/kitchen" component={OrdersManager} />
        </Switch>
      </main>
    </div>
  );
}
