"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  X,
  Check,
  Moon,
  Sun,
  User,
  LogOut,
  Settings,
  Star,
  Compass,
  Search,
  BarChart3,
  BookOpen,
  ShieldCheck,
  Save,
  FileText,
  LayoutGrid,
  ChevronLeft,
  Menu,
  ChevronRight,
  Clock,
  Globe,
  Link as LinkIcon,
  Building,
  Users,
  PieChart,
  AlertTriangle,
  CheckCircle,
  Clock as ClockIcon,
  Eye,
  ExternalLink,
  TrendingUp,
  TrendingDown,
  Zap,
  Layers,
  Minus,
  Globe as GlobeIcon,
} from "lucide-react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface BaseProps {
  className?: ClassValue;
  children?: React.ReactNode;
}
interface PropsWithChildren {
  children: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Button
// ---------------------------------------------------------------------------
const buttonVariants: Record<string, string> = {
  default: "border-border bg-card text-foreground hover:bg-accent/30",
  primary:
    "border-primary bg-primary text-primary-foreground shadow-[0_0_40px_-12px_hsl(var(--signal)/0.8)] hover:bg-primary/90 hover:shadow-[0_0_60px_-8px_hsl(var(--signal)/0.9)] transition-all",
  ghost: "hover:bg-accent/30 hover:text-foreground",
  danger: "border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive",
  outline: "border-border bg-transparent text-foreground hover:bg-accent/30",
};

type ButtonOwnProps = BaseProps & {
  variant?: keyof typeof buttonVariants;
  asChild?: boolean;
  type?: "button" | "submit" | "reset";
};

export const Button = React.forwardRef<
  HTMLButtonElement,
  ButtonOwnProps & React.ButtonHTMLAttributes<HTMLButtonElement>
>(
  ({ className, variant = "default", asChild, type = "button", ...props }, ref) => {
    if (asChild) {
      return (
        <Slot className={cn(buttonVariants[variant], className)} {...(props as Record<string, unknown>)} />
      );
    }
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          "inline-flex items-center justify-center rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-card disabled:pointer-events-none disabled:opacity-50",
          buttonVariants[variant],
          className,
        )}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

// ---------------------------------------------------------------------------
// Card
// ---------------------------------------------------------------------------
export function Card({ className, ...props }: BaseProps & PropsWithChildren) {
  return (
    <div className={cn("rounded-2xl border border-border bg-card shadow-soft", className)} {...props} />
  );
}
export function CardHeader({ className, ...props }: BaseProps & PropsWithChildren) {
  return <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />;
}
export function CardTitle({ className, ...props }: BaseProps & PropsWithChildren) {
  return <h3 className={cn("font-display text-xl font-semibold tracking-tight", className)} {...props} />;
}
export function CardDescription({ className, ...props }: BaseProps & PropsWithChildren) {
  return <p className={cn("text-sm text-muted-foreground leading-relaxed", className)} {...props} />;
}
export function CardContent({ className, ...props }: BaseProps & PropsWithChildren) {
  return <div className={cn("p-6 pt-0", className)} {...props} />;
}
export function CardFooter({ className, ...props }: BaseProps & PropsWithChildren) {
  return <div className={cn("flex items-center gap-2 p-6 pt-0", className)} {...props} />;
}

// ---------------------------------------------------------------------------
// Badge
// ---------------------------------------------------------------------------
export function Badge({ className, variant = "default", ...props }: BaseProps & { variant?: string }) {
  const variants: Record<string, string> = {
    default: "border-border bg-secondary text-secondary-foreground",
    primary: "bg-primary text-primary-foreground",
    success: "border-success/30 bg-success/10 text-success",
    warn: "border-warn/30 bg-warn/10 text-warn",
    danger: "border-destructive/30 bg-destructive/10 text-destructive",
    muted: "bg-muted text-muted-foreground",
    ghost: "border-border bg-transparent text-foreground",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-[0.12em]",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}

// ---------------------------------------------------------------------------
// Input
// ---------------------------------------------------------------------------
export function Input({ className, ...props }: BaseProps & React.ComponentPropsWithoutRef<"input">) {
  return (
    <input
      className={cn(
        "flex h-10 w-full rounded-lg border border-input bg-input/40 px-3 py-2 text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

// ---------------------------------------------------------------------------
// Label
// ---------------------------------------------------------------------------
export function Label({ className, ...props }: BaseProps & React.ComponentPropsWithoutRef<"label">) {
  return <label className={cn("text-sm font-medium text-foreground", className)} {...props} />;
}

// ---------------------------------------------------------------------------
// Separator
// ---------------------------------------------------------------------------
import * as SeparatorPrimitive from "@radix-ui/react-separator";

export function Separator({ className, ...props }: BaseProps & React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root className={cn("border-border h-[1px] w-full", className)} {...props} />
  );
}

// ---------------------------------------------------------------------------
// Dialog
// ---------------------------------------------------------------------------
import * as DialogPrimitive from "@radix-ui/react-dialog";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  BaseProps & React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-border bg-card p-6 shadow-soft sm:rounded-2xl",
        className,
      )}
      {...props}
    />
    <DialogPrimitive.Close className="absolute right-3 top-3 rounded-sm opacity-50 ring-offset-background transition-opacity hover:opacity-100 hover:bg-accent/30 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
      <span className="sr-only">Close</span>
      <X className="h-4 w-4" />
    </DialogPrimitive.Close>
  </DialogPrimitive.Portal>
));
DialogContent.displayName = "DialogContent";

export const DialogHeader = ({ className, ...props }: BaseProps & PropsWithChildren) => (
  <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props} />
);
export const DialogTitle = ({ className, ...props }: BaseProps & PropsWithChildren) => (
  <h2 className={cn("font-display text-lg font-semibold tracking-tight", className)} {...props} />
);
export const DialogDescription = ({ className, ...props }: BaseProps & PropsWithChildren) => (
  <div className={cn("text-sm text-muted-foreground", className)} {...props} />
);

// ---------------------------------------------------------------------------
// Tabs
// ---------------------------------------------------------------------------
import * as TabsPrimitive from "@radix-ui/react-tabs";

export const Tabs = TabsPrimitive.Root;
export const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  BaseProps & React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List ref={ref} className={cn("inline-flex flex-wrap gap-1 border-b border-border", className)} {...props} />
));
TabsList.displayName = "TabsList";

export const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  BaseProps & { value?: string } & React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, value, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    value={value}
    className={cn(
      "flex items-center justify-center whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-all",
      "data-[state=active]:border-primary data-[state=active]:bg-primary/10 data-[state=active]:text-primary",
      "data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:bg-accent/30 data-[state=inactive]:hover:text-foreground",
      className,
    )}
    {...props}
  />
));
TabsTrigger.displayName = "TabsTrigger";

export const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  BaseProps & React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content ref={ref} className={cn("mt-2 focus:outline-none", className)} {...props} />
));
TabsContent.displayName = "TabsContent";

// ---------------------------------------------------------------------------
// Select
// ---------------------------------------------------------------------------
import * as SelectPrimitive from "@radix-ui/react-select";

export const Select = SelectPrimitive.Root;
export const SelectGroup = SelectPrimitive.Group;
export const SelectValue = SelectPrimitive.Value;
export const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  BaseProps & React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex w-full items-center justify-between rounded-lg border border-input bg-input/40 px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
SelectTrigger.displayName = "SelectTrigger";

export const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  BaseProps & React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "relative z-50 max-h-72 min-w-[var(--select-trigger-width)] overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-soft",
        className,
      )}
      {...props}
    >
      {children}
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = "SelectContent";

export const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  BaseProps & { value: string; disabled?: boolean } & React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, disabled, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    disabled={disabled}
    className={cn(
      "relative flex w-full cursor-pointer select-none items-center rounded-lg py-1.5 pl-8 pr-2 text-sm outline-none transition-colors",
      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      "data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground",
      className,
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-2.5 w-2.5" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = "SelectItem";

// ---------------------------------------------------------------------------
// ScrollArea
// ---------------------------------------------------------------------------
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";

export const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  BaseProps & React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <ScrollAreaPrimitive.Root ref={ref} className={cn("relative overflow-hidden", className)} {...props}>
    <ScrollAreaPrimitive.Viewport className="h-full w-full">{children}</ScrollAreaPrimitive.Viewport>
    <ScrollAreaPrimitive.Scrollbar className="flex touch-none flex-col select-none">
      <ScrollAreaPrimitive.Thumb className="relative flex-1 rounded-full bg-border" />
    </ScrollAreaPrimitive.Scrollbar>
  </ScrollAreaPrimitive.Root>
));
ScrollArea.displayName = "ScrollArea";

// ---------------------------------------------------------------------------
// Avatar
// ---------------------------------------------------------------------------
import * as AvatarPrimitive from "@radix-ui/react-avatar";

export const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  BaseProps & React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn("flex h-10 w-10 shrink-0 overflow-hidden rounded-full border border-border bg-muted", className)}
    {...props}
  />
));
Avatar.displayName = "Avatar";

export const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  BaseProps & React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image ref={ref} className={cn("aspect-square h-full w-full object-cover", className)} {...props} />
));
AvatarImage.displayName = "AvatarImage";

export const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  BaseProps & React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn("flex h-full w-full items-center justify-center rounded-full text-muted-foreground font-medium", className)}
    {...props}
  />
));
AvatarFallback.displayName = "AvatarFallback";

// ---------------------------------------------------------------------------
// Tooltip
// ---------------------------------------------------------------------------
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

export const Tooltip = TooltipPrimitive.Provider;
export const TooltipTrigger = TooltipPrimitive.Trigger;
export const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  BaseProps & React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    className={cn(
      "rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-card-foreground shadow-soft animate-in fade-in zoom-in duration-200",
      className,
    )}
    {...props}
  />
));
TooltipContent.displayName = "TooltipContent";

// ---------------------------------------------------------------------------
// Switch
// ---------------------------------------------------------------------------
import * as SwitchPrimitive from "@radix-ui/react-switch";

export const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  BaseProps & React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitive.Root
    ref={ref}
    className={cn(
      "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
      className,
    )}
    {...props}
  >
    <SwitchPrimitive.Thumb className="pointer-events-none block h-3 w-3 rounded-full bg-background shadow-ring transition-transform data-[state=checked]:translate-x-4" />
  </SwitchPrimitive.Root>
));
Switch.displayName = "Switch";

// ---------------------------------------------------------------------------
// Checkbox
// ---------------------------------------------------------------------------
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";

export const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  BaseProps & React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "inline-flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-sm border border-input bg-input text-accent-foreground shadow-ring focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
      className,
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator className="flex items-center justify-center">
      <Check className="h-4 w-4" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = "Checkbox";

// ---------------------------------------------------------------------------
// Popover
// ---------------------------------------------------------------------------
import * as PopoverPrimitive from "@radix-ui/react-popover";

export const Popover = PopoverPrimitive.Root;
export const PopoverTrigger = PopoverPrimitive.Trigger;
export const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  BaseProps & React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, ...props }, ref) => (
  <PopoverPrimitive.Content
    ref={ref}
    className={cn("z-50 w-60 rounded-xl border border-border bg-card p-4 shadow-soft", className)}
    {...props}
  />
));
PopoverContent.displayName = "PopoverContent";

// ---------------------------------------------------------------------------
// DropdownMenu
// ---------------------------------------------------------------------------
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";

export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
export const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  BaseProps & React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Content
    ref={ref}
    className={cn("z-50 min-w-[180px] rounded-xl border border-border bg-card p-1 shadow-soft", className)}
    {...props}
  />
));
DropdownMenuContent.displayName = "DropdownMenuContent";

export const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  BaseProps & React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-pointer select-none items-center rounded-sm px-3 py-2 text-sm outline-none transition-colors",
      "data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground",
      className,
    )}
    {...(props as Record<string, unknown>)}
  />
));
DropdownMenuItem.displayName = "DropdownMenuItem";

export const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  BaseProps & React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator ref={ref} className={cn("-mx-1 h-px border-border my-2", className)} {...props} />
));
DropdownMenuSeparator.displayName = "DropdownMenuSeparator";

export const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Label>,
  BaseProps & React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Label ref={ref} className={cn("px-3 py-2 text-sm font-medium text-muted-foreground", className)} {...props} />
));
DropdownMenuLabel.displayName = "DropdownMenuLabel";

// ---------------------------------------------------------------------------
// Sheet
// ---------------------------------------------------------------------------
import * as SheetPrimitive from "@radix-ui/react-dialog";

export const Sheet = SheetPrimitive.Root;
export const SheetTrigger = SheetPrimitive.Trigger;
export const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  BaseProps & React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Portal>
    <SheetPrimitive.Overlay className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" />
    <SheetPrimitive.Content
      ref={ref}
      className={cn(
        "fixed right-0 top-0 z-50 h-full w-full max-w-[440px] border-l border-border bg-card shadow-lift flex flex-col",
        className,
      )}
      {...props}
    />
    <SheetPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-50 ring-offset-background transition-opacity hover:opacity-100 hover:bg-accent/30 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
      <span className="sr-only">Close</span>
      <X className="h-4 w-4" />
    </SheetPrimitive.Close>
  </SheetPrimitive.Portal>
));
SheetContent.displayName = "SheetContent";

export const SheetHeader = ({ className, ...props }: BaseProps & PropsWithChildren) => (
  <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
);
export const SheetTitle = ({ className, ...props }: BaseProps & PropsWithChildren) => (
  <h2 className={cn("font-display text-lg font-semibold tracking-tight", className)} {...props} />
);
export const SheetDescription = ({ className, ...props }: BaseProps & PropsWithChildren) => (
  <p className={cn("text-sm text-muted-foreground", className)} {...props} />
);

// ============================================================================
// ORBITORY-SPECIFIC COMPONENTS
// ============================================================================

// --- Status badge ---
export function StatusBadge({ status, ...props }: BaseProps & { status?: string }) {
  const variants: Record<string, string> = {
    ACTIVE: "bg-success/10 text-success border-success/30",
    ACQUIRED: "bg-info/10 text-info border-info/30",
    CLOSED: "bg-destructive/10 text-destructive border-destructive/30",
    IPO: "bg-primary/10 text-primary border-primary/30",
    UNKNOWN: "bg-muted text-muted-foreground border-muted/50",
    PARTIAL: "bg-warn/10 text-warn border-warn/30",
    RESEARCHED: "bg-success/10 text-success border-success/30",
    UNRESEARCHED: "bg-muted text-muted-foreground border-muted/50",
    VERIFIED: "bg-success/10 text-success border-success/30",
    REPORTED: "bg-info/10 text-info border-info/30",
    ESTIMATED: "bg-warn/10 text-warn border-warn/30",
    INTERPRETATION: "bg-warn/10 text-warn border-warn/30",
    ILLUSTRATIVE: "bg-muted text-muted-foreground border-muted/50",
  };
  return (
    <Badge variant={status ? (status === "ACTIVE" ? "success" : status === "REPORTED" ? "muted" : "default") : "default"} className={variants[status ?? ""]}>
      {status ? String(status).charAt(0).toUpperCase() + String(status).slice(1).toLowerCase() : "—"}
    </Badge>
  );
}

// --- Metric Card ---
export function MetricCard({
  title,
  value,
  unit,
  category,
  valueType,
  definition,
  period,
  trend,
}: {
  title: string;
  value?: string | number;
  unit?: string;
  category?: string;
  valueType?: string;
  definition?: string;
  period?: string;
  trend?: { direction: "up" | "down" | "neutral"; percent?: number; label?: string };
}) {
  const typeColors: Record<string, string> = {
    REPORTED: "border-success/30 bg-success/10 text-success",
    CALCULATED: "border-info/30 bg-info/10 text-info",
    ESTIMATED: "border-warn/30 bg-warn/10 text-warn",
    ILLUSTRATIVE: "border-muted text-muted-foreground",
  };
  return (
    <div className="metric-card">
      <div className="flex items-start justify-between mb-3">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{category}</span>
          <h4 className="font-display text-base font-semibold mt-0.5">{title}</h4>
        </div>
        <Badge variant={valueType ? (valueType === "REPORTED" ? "success" : valueType === "ILLUSTRATIVE" ? "muted" : "default") : "default"} className={typeColors[valueType ?? ""]}>
          {valueType ? String(valueType).charAt(0).toUpperCase() + String(valueType).slice(1).toLowerCase() : "—"}
        </Badge>
      </div>
      <div className="mb-3">
        <span className="metric-card-value">{value ?? "—"}</span>
        {unit && <span className="text-xs text-muted-foreground ml-1">{unit}</span>}
      </div>
      {period && (
        <p className="text-[10px] text-muted-foreground mb-3">Period: {period}</p>
      )}
      {definition && (
        <p className="text-xs text-muted-foreground line-clamp-2">{definition}</p>
      )}
      {trend && (
        <div className="mt-3 flex items-center gap-1.5">
          {trend.direction === "up" ? (
            <TrendingUp className="h-3.5 w-3.5 text-success" />
          ) : trend.direction === "down" ? (
            <TrendingDown className="h-3.5 w-3.5 text-destructive" />
          ) : (
            <Minus className="h-3.5 w-3.5 text-muted-foreground" />
          )}
          <span className="text-xs text-muted-foreground">
            {trend.label ?? (trend.percent !== undefined ? `${trend.percent > 0 ? "+" : ""}${trend.percent}%` : "—")}
          </span>
        </div>
      )}
    </div>
  );
}

// --- Evidence / Source chip ---
export function EvidenceChip({ status, confidence }: { status?: string; confidence?: string }) {
  const statusColor: Record<string, string> = {
    VERIFIED: "border-success/30 bg-success/10 text-success",
    REPORTED: "border-info/30 bg-info/10 text-info",
    ESTIMATED: "border-warn/30 bg-warn/10 text-warn",
    INTERPRETATION: "border-warn/30 bg-warn/10 text-warn",
    ILLUSTRATIVE: "border-muted text-muted-foreground",
    UNKNOWN: "border-muted text-muted-foreground",
  };
  return (
    <Badge variant={status ? (status === "VERIFIED" ? "success" : status === "REPORTED" ? "muted" : "default") : "default"} className={statusColor[status ?? ""]}>
      {status ? String(status).charAt(0).toUpperCase() + String(status).slice(1).toLowerCase() : "—"}
      {confidence && (
        <span className="ml-1 text-[9px] opacity-70">[{confidence}]</span>
      )}
    </Badge>
  );
}

// --- Source link ---
export function SourceLink({ url, title, publisher }: { url: string; title: string; publisher?: string }) {
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm flex items-center gap-1.5">
      <ExternalLink className="h-3 w-3" />
      <span>{title}</span>
      {publisher && <span className="text-muted-foreground ml-1">· {publisher}</span>}
    </a>
  );
}

// --- Empty State ---
export function EmptyState({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-12 text-center">
      <div className="h-12 w-12 mx-auto rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-4">
        <Layers className="h-6 w-6" />
      </div>
      <h3 className="font-medium">{title}</h3>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
