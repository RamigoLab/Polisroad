// navigation.js — fonte unica delle voci di navigazione.
// Icone: tutte da lucide-react via Icon.jsx — stessa libreria, stessa stroke-width.

export const NAV_ITEMS = [
  { id: 'home',        icon: 'home',           label: 'Home',          primary: true  },
  { id: 'normativa',   icon: 'book-open',       label: 'Normativa',     primary: true  },
  { id: 'prontuario',  icon: 'clipboard-list',  label: 'Prontuario',    primary: true  },
  { id: 'preferiti',   icon: 'star',            label: 'Preferiti',     primary: false },
  { id: 'ricerca',     icon: 'search',          label: 'Cerca',         primary: true  },
  { id: 'calcolatore', icon: 'calculator',      label: 'Calcolatore',   primary: false },
  { id: 'guide',       icon: 'graduation-cap',  label: 'Guide Pratiche',primary: false },
  { id: 'news',        icon: 'newspaper',       label: 'News',          primary: false },
  { id: 'links',       icon: 'link',            label: 'Links',         primary: false },
  { id: 'profilo',     icon: 'user',            label: 'Profilo',       primary: true  },
];

export const NAV_ITEMS_PRIMARY = NAV_ITEMS.filter(i => i.primary);
