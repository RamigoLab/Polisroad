import {
  Home, BookOpen, ClipboardList, Star, Search, Calculator, GraduationCap,
  Newspaper, Link2, User, UserCheck, Bell, BellOff, ShieldAlert, ShieldCheck,
  Settings, X, Check, Lightbulb, PenLine, FileText, OctagonAlert,
  RotateCw, Rocket, CircleCheck, CircleX, TriangleAlert, Info, Medal, Building2,
  Mail, Smartphone, Download, Palette, Moon, Sun, Package, Megaphone,
  ScrollText, Trash2, Zap, ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  Copy, ExternalLink, LogOut, Plus, Minus, RefreshCw, Eye, EyeOff, Lock,
  Percent, Repeat, CreditCard, MapPin, Phone, Globe, BookMarked, HelpCircle,
  LifeBuoy, MessageSquare, Heart, Share2, Filter, SlidersHorizontal, Ban,
  CheckCircle2, AlertCircle, Wifi, WifiOff, FileDown, BarChart3, Layers,
} from 'lucide-react';

/**
 * Icon — wrapper unico per lucide-react.
 * Un solo posto da aggiornare se cambia libreria o icona.
 * Lucide-react v0.383 è già nel package.json — tutte le icone qui sopra esistono.
 */
const MAP = {
  // Navigazione principale
  home:              Home,
  'book-open':       BookOpen,
  'clipboard-list':  ClipboardList,
  star:              Star,
  search:            Search,
  calculator:        Calculator,
  'graduation-cap':  GraduationCap,
  newspaper:         Newspaper,
  link:              Link2,
  user:              User,
  'user-check':      UserCheck,

  // Azioni comuni
  settings:          Settings,
  close:             X,
  x:                 X,
  check:             Check,
  'rotate-cw':       RotateCw,
  'refresh-cw':      RefreshCw,
  plus:              Plus,
  minus:             Minus,
  copy:              Copy,
  download:          Download,
  'file-down':       FileDown,
  'external-link':   ExternalLink,
  'log-out':         LogOut,
  eye:               Eye,
  'eye-off':         EyeOff,
  lock:              Lock,
  share:             Share2,
  filter:            Filter,
  sliders:           SlidersHorizontal,
  ban:               Ban,

  // Notifiche e stato
  bell:              Bell,
  'bell-off':        BellOff,
  'shield-alert':    ShieldAlert,
  'shield-check':    ShieldCheck,
  'circle-check':    CircleCheck,
  'check-circle':    CheckCircle2,
  'circle-x':        CircleX,
  'triangle-alert':  TriangleAlert,
  'alert-circle':    AlertCircle,
  info:              Info,
  wifi:              Wifi,
  'wifi-off':        WifiOff,

  // Profilo e identità
  medal:             Medal,
  building:          Building2,
  mail:              Mail,
  smartphone:        Smartphone,
  phone:             Phone,
  'map-pin':         MapPin,
  globe:             Globe,

  // UI e layout
  palette:           Palette,
  moon:              Moon,
  sun:               Sun,
  package:           Package,
  megaphone:         Megaphone,
  scroll:            ScrollText,
  'trash-2':         Trash2,
  'file-text':       FileText,
  zap:               Zap,
  'chevron-left':    ChevronLeft,
  'chevron-right':   ChevronRight,
  'chevron-down':    ChevronDown,
  'chevron-up':      ChevronUp,
  rocket:            Rocket,
  lightbulb:         Lightbulb,
  'pen-line':        PenLine,
  'octagon-alert':   OctagonAlert,

  // Calcolatore
  percent:           Percent,
  repeat:            Repeat,
  'credit-card':     CreditCard,

  // Statistiche
  'bar-chart':       BarChart3,
  layers:            Layers,

  // Help & support
  'help-circle':     HelpCircle,
  'life-buoy':       LifeBuoy,
  'message-square':  MessageSquare,
  heart:             Heart,

  // Contenuto
  'book-marked':     BookMarked,
};

export const Icon = ({ name, size = 20, color, strokeWidth = 1.75, style, ...rest }) => {
  const Cmp = MAP[name];
  if (!Cmp) {
    // Fallback silenzioso in prod, warning in dev
    if (import.meta.env.DEV) console.warn(`Icon: icona "${name}" non trovata`);
    return null;
  }
  return <Cmp size={size} color={color} strokeWidth={strokeWidth} style={style} {...rest} />;
};
