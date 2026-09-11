import {
  LayoutDashboard,
  Route,
  Plus,
  Settings,
  Folder,
  FileText,
  FlaskConical,
  Tag,
  Link as LinkIcon,
  type LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard,
  Route,
  Plus,
  Settings,
  Folder,
  FileText,
  Link: LinkIcon,
  FlaskConical,
  Tag,
};

/** 将 DB 中的 Lucide 图标名解析为组件 */
export function resolveNavIcon(name?: string | null): LucideIcon | null {
  if (!name) return null;
  return ICON_MAP[name] ?? null;
}
