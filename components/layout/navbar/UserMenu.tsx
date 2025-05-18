"use client";
import Link from "next/link";
import { LogOut, Settings, LayoutDashboard, UserCircle } from "lucide-react";
import { signOut } from "next-auth/react";
import type { Session } from "next-auth"; 
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface UserMenuProps {
  session: Session;
}

export function UserMenu({ session }: UserMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-11 w-11 rounded-full focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background p-0">
          <Avatar className="h-10 w-10 border-2 border-transparent group-hover:border-primary transition-colors">
            <AvatarImage src={session.user?.image ?? undefined} alt={session.user?.name ?? "Avatar"} />
            <AvatarFallback className="bg-muted text-muted-foreground font-semibold">
              {session.user?.name ? session.user.name.substring(0, 2).toUpperCase() : <UserCircle size={22} />}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-60" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1 py-1">
            <p className="text-sm font-semibold leading-none truncate">{session.user?.name || "Usuário"}</p>
            <p className="text-xs leading-none text-muted-foreground truncate">
              {session.user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard" className="flex items-center w-full cursor-pointer">
            <LayoutDashboard className="mr-2.5 h-4 w-4 text-muted-foreground" />
            <span>Dashboard</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/dashboard/configuracoes" className="flex items-center w-full cursor-pointer">
            <Settings className="mr-2.5 h-4 w-4 text-muted-foreground" />
            <span>Configurações</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/' })} className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer">
          <LogOut className="mr-2.5 h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}