import type { JSX } from 'react';
import Link from 'next/link';
import type { CBREHeaderNavItem, CBREHeaderProps } from '@/types/cbre-header';

const DEFAULT_NAV_ITEMS: readonly CBREHeaderNavItem[] = [
  { label: 'Services', href: '#' },
  { label: 'Insight & Research', href: '#' },
  { label: 'Properties', href: '#' },
  { label: 'Offices', href: '#' },
  { label: 'Careers', href: '/about' },
  { label: 'About Us', href: '#' },
];

const SearchIcon = (): JSX.Element => (
  <svg aria-hidden="true" className="cbre-header__icon-svg" viewBox="0 0 18 18">
    <circle cx="7.5" cy="7.5" fill="none" r="6" stroke="currentColor" strokeWidth="1.5" />
    <path
      d="M11.9 11.9L16 16"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="1.5"
    />
  </svg>
);

const MenuIcon = (): JSX.Element => (
  <svg aria-hidden="true" className="cbre-header__icon-svg" viewBox="0 0 18 18">
    <path
      d="M2 4.5H16M2 9H16M2 13.5H16"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="1.75"
    />
  </svg>
);

const USFlagIcon = (): JSX.Element => (
  <svg aria-hidden="true" className="cbre-header__flag-svg" viewBox="0 0 28 20">
    <rect fill="#FFFFFF" height="20" rx="2" width="28" />
    <path
      d="M0 1.54H28M0 4.62H28M0 7.69H28M0 10.77H28M0 13.85H28M0 16.92H28"
      stroke="#C62828"
      strokeWidth="1.54"
    />
    <rect fill="#24408E" height="10.77" rx="2" width="12" />
    <g fill="#FFFFFF">
      <circle cx="2.2" cy="2.2" r="0.55" />
      <circle cx="4.8" cy="2.2" r="0.55" />
      <circle cx="7.4" cy="2.2" r="0.55" />
      <circle cx="10" cy="2.2" r="0.55" />
      <circle cx="3.5" cy="3.9" r="0.55" />
      <circle cx="6.1" cy="3.9" r="0.55" />
      <circle cx="8.7" cy="3.9" r="0.55" />
      <circle cx="2.2" cy="5.6" r="0.55" />
      <circle cx="4.8" cy="5.6" r="0.55" />
      <circle cx="7.4" cy="5.6" r="0.55" />
      <circle cx="10" cy="5.6" r="0.55" />
      <circle cx="3.5" cy="7.3" r="0.55" />
      <circle cx="6.1" cy="7.3" r="0.55" />
      <circle cx="8.7" cy="7.3" r="0.55" />
      <circle cx="2.2" cy="9" r="0.55" />
      <circle cx="4.8" cy="9" r="0.55" />
      <circle cx="7.4" cy="9" r="0.55" />
      <circle cx="10" cy="9" r="0.55" />
    </g>
  </svg>
);

const CBREHeader = ({
  items = DEFAULT_NAV_ITEMS,
  homeHref = '/',
  localeLabel = 'United States',
  searchHref = '#',
}: CBREHeaderProps): JSX.Element => (
  <div className="cbre-header">
    <div className="cbre-header__inner">
      <Link aria-label="CBRE home" className="cbre-header__logo" href={homeHref}>
        <span className="cbre-header__wordmark">CBRE</span>
      </Link>

      <div className="cbre-header__actions">
        <nav aria-label="Primary" className="cbre-header__nav">
          <ul className="cbre-header__nav-list">
            {items.map((item) => (
              <li className="cbre-header__nav-item" key={item.label}>
                <Link className="cbre-header__nav-link" href={item.href}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="cbre-header__utility">
          <button aria-label={localeLabel} className="cbre-header__icon-button" type="button">
            <USFlagIcon />
          </button>
          <Link aria-label="Search" className="cbre-header__icon-button" href={searchHref}>
            <SearchIcon />
          </Link>
          <button
            aria-label="Open navigation menu"
            className="cbre-header__icon-button cbre-header__menu-button"
            type="button"
          >
            <MenuIcon />
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default CBREHeader;
