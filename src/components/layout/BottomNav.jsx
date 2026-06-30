import React from 'react';
import { LS } from '../../styles/layout';
import { C } from '../../styles/theme';
import { NAV_ITEMS_PRIMARY } from '../../config/navigation';
import { Icon } from '../ui/Icon';

export const BottomNav = ({ currentPage, onNavigate }) => (
  <div style={LS.navContainer} className="app-bottom-nav">
    <nav style={LS.navScroll} role="navigation" aria-label="Navigazione principale">
      {NAV_ITEMS_PRIMARY.map((tab) => {
        const isActive = currentPage === tab.id;
        return (
          <div
            key={tab.id}
            onClick={() => onNavigate(tab.id)}
            style={LS.navTab(isActive)}
            role="button"
            aria-label={tab.label}
            aria-current={isActive ? 'page' : undefined}
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onNavigate(tab.id)}
          >
            <Icon
              name={tab.icon}
              size={22}
              color={isActive ? C.accent : C.textLight}
              strokeWidth={isActive ? 2.25 : 1.75}
            />
            <span style={LS.navTabLabel(isActive)}>{tab.label}</span>
          </div>
        );
      })}
    </nav>
  </div>
);
