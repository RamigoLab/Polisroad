import {
  Home, BookOpen, ClipboardList, Star, Search, Calculator, GraduationCap,
  Newspaper, Link2, User, Bell, ShieldAlert, Settings, X, Check, Clock,
  Lightbulb, PenLine, FileText, Construction, OctagonAlert, RotateCw,
  Rocket, CircleCheck, CircleX, TriangleAlert, Info, Medal, Building2,
  Mail, Smartphone, Download, Palette, Moon, Sun, Gamepad2, Package,
  Megaphone, ScrollText, Unlock, Trash2, Save, PartyPopper, Zap,
} from 'lucide-react';

// Mappa unica nome -> componente lucide-react. Si estende qui, non importando
// lucide-react sparso nei singoli file: un solo punto da aggiornare se cambia
// la libreria di icone o un'icona specifica.
const MAP = {
  home: Home, 'book-open': BookOpen, 'clipboard-list': ClipboardList, star: Star,
  search: Search, calculator: Calculator, 'graduation-cap': GraduationCap,
  newspaper: Newspaper, link: Link2, user: User, bell: Bell,
  'shield-alert': ShieldAlert, settings: Settings, close: X, check: Check,
  clock: Clock, lightbulb: Lightbulb, 'pen-line': PenLine, 'file-text': FileText,
  construction: Construction, 'octagon-alert': OctagonAlert, 'rotate-cw': RotateCw,
  rocket: Rocket, 'circle-check': CircleCheck, 'circle-x': CircleX,
  'triangle-alert': TriangleAlert, info: Info, medal: Medal, building: Building2,
  mail: Mail, smartphone: Smartphone, download: Download, palette: Palette,
  moon: Moon, sun: Sun, gamepad: Gamepad2, package: Package, megaphone: Megaphone,
  scroll: ScrollText, unlock: Unlock, trash: Trash2, save: Save,
  celebrate: PartyPopper, zap: Zap,
};

export const Icon = ({ name, size = 20, color, strokeWidth = 2, ...rest }) => {
  const Cmp = MAP[name];
  if (!Cmp) return null;
  return <Cmp size={size} color={color} strokeWidth={strokeWidth} {...rest} />;
};
