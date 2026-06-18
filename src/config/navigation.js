// Fonte unica delle voci di navigazione, usata sia da BottomNav (solo le 5
// voci con primary: true) sia da Sidebar (tutte e 10). Prima erano due array
// "TABS" duplicati e mantenuti a mano in entrambi i componenti.

export const NAV_ITEMS = [
  { id: 'home', icon: 'home', label: 'Home', primary: true },
  { id: 'normativa', icon: 'book-open', label: 'Normativa', primary: true },
  { id: 'prontuario', icon: 'clipboard-list', label: 'Prontuario', primary: true },
  { id: 'preferiti', icon: 'star', label: 'Preferiti' },
  { id: 'ricerca', icon: 'search', label: 'Cerca', primary: true },
  { id: 'calcolatore', icon: 'calculator', label: 'Calcolatore' },
  { id: 'guide', icon: 'graduation-cap', label: 'Guide Pratiche' },
  { id: 'news', icon: 'newspaper', label: 'News' },
  { id: 'links', icon: 'link', label: 'Links' },
  { id: 'profilo', icon: 'user', label: 'Profilo', primary: true },
];

export const NAV_ITEMS_PRIMARY = NAV_ITEMS.filter((item) => item.primary);
