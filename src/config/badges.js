export const BADGES = {
  // Tier 1 - Bronze
  NOVICE: {
    id: 'novice',
    name: 'Novizio',
    icon: '🌱',
    description: 'Raggiungi 100 XP',
    unlockCondition: (stats) => stats.xp >= 100,
    tier: 'bronze',
    color: '#cd7f32' // Bronze
  },

  // Tier 2 - Silver
  APPRENTICE: {
    id: 'apprentice',
    name: 'Apprendista',
    icon: '🚀',
    description: 'Raggiungi 500 XP',
    unlockCondition: (stats) => stats.xp >= 500,
    tier: 'silver',
    color: '#c0c0c0' // Silver
  },
  SEARCHER: {
    id: 'searcher',
    name: 'Esploratore',
    icon: '🕵️',
    description: 'Esegui 100 ricerche',
    unlockCondition: (stats) => stats.total_searches >= 100,
    tier: 'silver',
    color: '#c0c0c0'
  },
  COLLECTOR: {
    id: 'collector',
    name: 'Collezionista',
    icon: '🔖',
    description: 'Aggiungi 50 preferiti',
    unlockCondition: (stats) => stats.total_favorites >= 50,
    tier: 'silver',
    color: '#c0c0c0'
  },
  CALCULATOR_PRO: {
    id: 'calc_pro',
    name: 'Matematico',
    icon: '⚖️',
    description: 'Usa il calcolatore 50 volte',
    unlockCondition: (stats) => stats.calculator_uses >= 50,
    tier: 'silver',
    color: '#c0c0c0'
  },

  // Tier 3 - Gold
  EXPERT: {
    id: 'expert',
    name: 'Esperto',
    icon: '🌟',
    description: 'Raggiungi 2000 XP',
    unlockCondition: (stats) => stats.xp >= 2000,
    tier: 'gold',
    color: '#ffd700' // Gold
  },
  KNOWLEDGE_SEEKER: {
    id: 'knowledge_seeker',
    name: 'Topo da Biblioteca',
    icon: '📖',
    description: 'Leggi 500 articoli',
    unlockCondition: (stats) => stats.total_articles_viewed >= 500,
    tier: 'gold',
    color: '#ffd700'
  },

  // Tier 4 - Platinum
  MASTER: {
    id: 'master',
    name: 'Maestro',
    icon: '👑',
    description: 'Raggiungi 5000 XP',
    unlockCondition: (stats) => stats.xp >= 5000,
    tier: 'platinum',
    color: '#e5e4e2' // Platinum
  },
  GUARDIAN: {
    id: 'guardian',
    name: 'Guardiano',
    icon: '🛡️',
    description: 'Usa tutte le features 100+ volte',
    unlockCondition: (stats) => 
      (stats.total_searches || 0) >= 100 &&
      (stats.total_favorites || 0) >= 100 &&
      (stats.calculator_uses || 0) >= 100,
    tier: 'platinum',
    color: '#e5e4e2'
  },

  // Contestazioni
  CONTESTAZIONI_50: {
    id: 'cont_50',
    name: 'Pattuglia Attiva',
    icon: '🚨',
    description: 'Registra 50 contestazioni',
    unlockCondition: (stats) => (stats.total_contestazioni || 0) >= 50,
    tier: 'bronze',
    color: '#cd7f32'
  },
  CONTESTAZIONI_100: {
    id: 'cont_100',
    name: 'Operatore Scelto',
    icon: '🚔',
    description: 'Registra 100 contestazioni',
    unlockCondition: (stats) => (stats.total_contestazioni || 0) >= 100,
    tier: 'silver',
    color: '#c0c0c0'
  },
  CONTESTAZIONI_200: {
    id: 'cont_200',
    name: 'Veterano della Strada',
    icon: '🦅',
    description: 'Registra 200 contestazioni',
    unlockCondition: (stats) => (stats.total_contestazioni || 0) >= 200,
    tier: 'gold',
    color: '#ffd700'
  }
};
