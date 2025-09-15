import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { LogOut, Settings, User, MoreVertical, Menu } from "lucide-react";
import Link from "next/link";
import { DollarSign } from "lucide-react";

const FahariLogo = () => (
    <div className="relative w-8 h-8">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path d="M5 9C5 7.89543 5.89543 7 7 7H17C18.1046 7 19 7.89543 19 9V18C19 19.1046 18.1046 20 17 20H7C5.89543 20 5 19.1046 5 18V9Z" stroke="hsl(var(--primary))" strokeWidth="1.5"/>
            <path d="M9 14H13" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M9 11V17" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M15 7C15 4.79086 13.2091 3 11 3C8.79086 3 7 4.79086 7 7" stroke="hsl(var(--primary))" strokeWidth="1.5"/>
        </svg>
    </div>
);


export function AppHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-card/80 px-4 backdrop-blur-sm md:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden">
          <Menu />
        </SidebarTrigger>
      </div>

      <div className="flex items-center gap-2">
        <FahariLogo />
        <span className="font-headline text-xl font-bold">
          Fahari Pesa
        </span>
      </div>

      <div className="flex items-center justify-end gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <MoreVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">Fahari User</p>
                <p className="text-xs leading-none text-muted-foreground">
                  user@fahari.com
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/">
                <LogOut />
                Log out
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
