import {
  Users,
  MapPin,
  FolderTree,
  MessageSquare,
  ShoppingCart,
  Package,
  FileText,
  PenLine,
  Box,
  Monitor,
  Truck,
  Tag,
  Tags,
  Notebook,
  StickyNote,
  Paperclip,
  Settings,
  Mail,
  CreditCard,
  Calendar,
  Image,
  Star,
  Heart,
  Bell,
  Lock,
  Globe,
  Database,
  Layers,
  BookOpen,
  type LucideIcon,
} from "lucide-react";

const MODEL_COLORS: [string, string][] = [
  ["text-red-500", "bg-red-500"], ["text-orange-500", "bg-orange-500"],
  ["text-amber-500", "bg-amber-500"], ["text-yellow-500", "bg-yellow-500"],
  ["text-lime-500", "bg-lime-500"], ["text-green-500", "bg-green-500"],
  ["text-emerald-500", "bg-emerald-500"], ["text-teal-500", "bg-teal-500"],
  ["text-cyan-500", "bg-cyan-500"], ["text-sky-500", "bg-sky-500"],
  ["text-blue-500", "bg-blue-500"], ["text-indigo-500", "bg-indigo-500"],
  ["text-violet-500", "bg-violet-500"], ["text-purple-500", "bg-purple-500"],
  ["text-fuchsia-500", "bg-fuchsia-500"], ["text-pink-500", "bg-pink-500"],
  ["text-rose-500", "bg-rose-500"],
];

/** Pattern → icon mapping. First match wins. Patterns match against lowercase model name. */
const ICON_PATTERNS: [RegExp, LucideIcon][] = [
  [/user|account|member|person|people|admin|employee|staff|author/i, Users],
  [/address|location|place|geo/i, MapPin],
  [/category|categor|folder|group|section/i, FolderTree],
  [/comment|review|feedback|reply|response/i, MessageSquare],
  [/order_item|line_item|cart_item|basket_item/i, Package],
  [/order|purchase|checkout|transaction|sale/i, ShoppingCart],
  [/digital.?product|download|ebook|software/i, Monitor],
  [/physical.?product|shipped|tangible/i, Truck],
  [/product|item|good|merchandise|sku/i, Box],
  [/page|document|wiki|article/i, FileText],
  [/post|blog|entry|story|publication/i, PenLine],
  [/tagging|categoriz/i, Tags],
  [/tag|label|keyword/i, Tag],
  [/note$/i, StickyNote],
  [/notes$/i, Notebook],
  [/attachment|file|upload|media|asset/i, Paperclip],
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function getModelIcon(name: string): LucideIcon | null {
  // Strip namespace for matching (e.g. "Notes::Attachment" → "Attachment")
  const simpleName = name.includes("::") ? name.split("::").pop()! : name;
  // Also try the full name for namespace-aware patterns
  for (const [pattern, icon] of ICON_PATTERNS) {
    if (pattern.test(simpleName) || pattern.test(name)) return icon;
  }
  return null; // no match — will show colored dot fallback
}

/** Map of Lucide icon names that can be configured via the Ruby DSL. */
const ICON_NAME_MAP: Record<string, LucideIcon> = {
  Users, MapPin, FolderTree, MessageSquare, ShoppingCart, Package,
  FileText, PenLine, Box, Monitor, Truck, Tag, Tags, Notebook,
  StickyNote, Paperclip, Settings, Mail, CreditCard, Calendar,
  Image, Star, Heart, Bell, Lock, Globe, Database, Layers, BookOpen,
};

export function ModelIcon({ name, iconOverride }: { name: string; iconOverride?: string }) {
  const [textColor, bgColor] = MODEL_COLORS[hashString(name) % MODEL_COLORS.length];

  // Configured icon override from DSL
  if (iconOverride) {
    const OverrideIcon = ICON_NAME_MAP[iconOverride];
    if (OverrideIcon) return <OverrideIcon className={`h-4 w-4 shrink-0 ${textColor}`} />;
  }

  const Icon = getModelIcon(name);
  if (Icon) return <Icon className={`h-4 w-4 shrink-0 ${textColor}`} />;
  // Colored dot fallback — wrapped in icon-sized container for alignment
  return (
    <span className="h-4 w-4 shrink-0 flex items-center justify-center">
      <span className={`h-2.5 w-2.5 rounded-full ${bgColor}`} />
    </span>
  );
}
