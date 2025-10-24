import { Home, Search, Pencil, HelpCircle, Settings, Network } from "lucide-react";
import { NavLink } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { title: "Home", url: "/", icon: Home },
  { title: "Explorer Mode", url: "/explorer", icon: Search },
  { title: "Builder Mode", url: "/editor", icon: Pencil },
  { title: "Help", url: "#help", icon: HelpCircle },
  { title: "Settings", url: "#settings", icon: Settings },
];

export function AppSidebar() {
  const { open } = useSidebar();

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-primary/10 text-primary font-medium" : "text-black hover:bg-muted/50";

  return (
    <Sidebar collapsible="icon" className="text-black">
      <SidebarContent className="text-black">
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-3 text-black py-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-hero flex items-center justify-center shrink-0">
              <Network className="w-4 h-4 text-white" strokeWidth={1.5} />
            </div>
            {open && <span className="text-lg font-extralight tracking-tight">corners</span>}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="mt-6">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="h-4 w-4 text-black" />
                      {open && <span className="text-black">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
