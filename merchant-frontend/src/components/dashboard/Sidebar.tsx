import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Home,
  Wallet,
  CreditCard,
  Users,
  Package,
  Shield,
  Link,
  BarChart3,
  Monitor,
  Receipt,
  ChevronDown,
  Settings,
  LogOut,
  Plus,
  Building2,
  Users2,
  Info,
  Target,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { NavigationItem } from '@/types';

const navigation: NavigationItem[] = [
  { name: 'Overview', href: '/', icon: Home },
  { name: 'Balance', href: '/balance', icon: Wallet, demo: true },
  { name: 'Transactions', href: '/transactions', icon: CreditCard, demo: true },
  { name: 'Customers', href: '/customers', icon: Users, demo: true },
  { name: 'Products', href: '/products', icon: Package },
  { name: 'Payment Links', href: '/payment-links', icon: Link },
  { name: 'Strategy', href: '/strategy', icon: Target },
  { name: 'Radar', href: '/radar', icon: Shield, comingSoon: true },
  { name: 'Analytics', href: '/reporting', icon: BarChart3, comingSoon: true },
  { name: 'Terminal', href: '/terminal', icon: Monitor, comingSoon: true },
  { name: 'Billing', href: '/billing', icon: Receipt, comingSoon: true },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const location = useLocation();
  const [isCollapsed] = useState(false);

  return (
    <div className={cn(
      'flex h-full w-64 flex-col border-r bg-background',
      isCollapsed && 'w-16',
      className
    )}>
      {/* Logo */}
      <div className="flex h-14 items-center border-b px-4">
        <div className="flex items-center space-x-2">
          <img 
            src="/zappay-logo-white.png" 
            alt="ZapPay Logo" 
            className="h-6 w-6 object-contain"
          />
          {!isCollapsed && (
            <span className="font-semibold">ZapPay</span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive: linkActive }) => cn(
                  'group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  'hover:bg-accent hover:text-accent-foreground',
                  linkActive || isActive
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground',
                  item.comingSoon && 'opacity-60 cursor-not-allowed'
                )}
              >
                <Icon className="mr-3 h-4 w-4 flex-shrink-0" />
                {!isCollapsed && (
                  <div className="flex items-center justify-between w-full min-w-0">
                    <span className="truncate">{item.name}</span>
                    <div className="flex items-center space-x-1 ml-2 flex-shrink-0">
                                              {item.demo && (
                          <Badge variant="outline" className="text-xs bg-amber-50 text-orange-700 border-orange-200">
                            Demo
                          </Badge>
                        )}
                      {item.comingSoon && (
                        <Badge variant="secondary" className="text-xs">
                          Soon
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start p-2 h-auto bg-white hover:bg-gray-100 text-gray-900">
              <div className="flex items-center space-x-3 w-full">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src="/avatars/01.png" alt="@zappay" />
                  <AvatarFallback>ZP</AvatarFallback>
                </Avatar>
                {!isCollapsed && (
                  <>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-sm font-medium truncate">ZapPay</p>
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-500 flex-shrink-0" />
                  </>
                )}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64" align="start" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/avatars/01.png" alt="@zappay" />
                  <AvatarFallback>ZP</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium leading-none">ZapPay</p>
                </div>
              </div>
            </DropdownMenuLabel>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <div className="flex items-center w-full">
                  <div className="mr-2 h-4 w-4 rounded bg-orange-100 flex items-center justify-center">
                    <span className="text-xs text-orange-600">S</span>
                  </div>
                  <span className="flex-1">Switch to sandbox</span>
                </div>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-48">
                <DropdownMenuItem>
                  <Plus className="mr-2 h-4 w-4" />
                  <span>Create sandbox</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <div className="mr-2 h-4 w-4 rounded bg-orange-100 flex items-center justify-center">
                    <span className="text-xs text-orange-600">S</span>
                  </div>
                  <span>Manage sandboxes</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <div className="mr-2 h-4 w-4 rounded bg-blue-100 flex items-center justify-center">
                    <span className="text-xs text-blue-600">T</span>
                  </div>
                  <span>Test mode</span>
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
              Accounts
            </DropdownMenuLabel>
            
            <DropdownMenuItem>
              <div className="flex items-center w-full">
                <div className="mr-2 h-4 w-4 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-xs text-blue-600">C</span>
                </div>
                <span className="flex-1">ZapPay</span>
              </div>
            </DropdownMenuItem>
            
            <DropdownMenuItem>
              <div className="flex items-center w-full">
                <div className="mr-2 h-4 w-4 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-xs text-green-600">D</span>
                </div>
                <span className="flex-1">Demo Account</span>
              </div>
            </DropdownMenuItem>
            
            <DropdownMenuItem>
              <div className="flex items-center w-full">
                <div className="mr-2 h-4 w-4 rounded-full bg-purple-100 flex items-center justify-center">
                  <span className="text-xs text-purple-600">T</span>
                </div>
                <span className="flex-1">Test Account</span>
              </div>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Plus className="mr-2 h-4 w-4" />
                <span>Create</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-48">
                <DropdownMenuItem>
                  <Building2 className="mr-2 h-4 w-4" />
                  <span>Create account</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Users2 className="mr-2 h-4 w-4" />
                  <span>Create organization</span>
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem>
              <div className="flex items-center w-full">
                <div className="mr-2 h-4 w-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <span className="text-xs text-gray-600">S</span>
                </div>
                <span className="flex-1">Sky Yap</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Roles: Admin and Super Admin</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </DropdownMenuItem>
            
            <DropdownMenuItem>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}