import { Home, Search, Pencil, HelpCircle, Settings } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import logo from "/logo.png";

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
  const navigate = useNavigate();

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-primary/10 text-primary font-medium" : "text-black hover:bg-muted/50";

  return (
    <Sidebar collapsible="icon" className="text-black">
      <SidebarContent className="text-black">
        <SidebarGroup>
          <SidebarGroupLabel 
            className="flex items-center gap-3 text-black py-4 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate("/")}
          >
            <img src={logo} alt="Corners logo" className="w-8 h-8 shrink-0" />
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
