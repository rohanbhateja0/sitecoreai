import type { JSX } from 'react';
import Link from 'next/link';
import type {
  CBREFooterNavItem,
  CBREFooterProps,
  CBREFooterSocialItem,
} from '@/types/cbre-footer';

const DEFAULT_PRIMARY_ITEMS: readonly CBREFooterNavItem[] = [
  { label: 'About CBRE', href: '#' },
  { label: 'Corporate Responsibility', href: '#' },
  { label: 'Careers', href: '/about' },
  { label: 'Newsroom', href: '#' },
  { label: 'Investor Relations', href: '#' },
];

const DEFAULT_SECONDARY_ITEMS: readonly CBREFooterNavItem[] = [
  { label: 'Contact Us', href: '#' },
  { label: 'Privacy & Cookie Policy', href: '#' },
  { label: 'Terms of Use', href: '#' },
];

const DEFAULT_SOCIAL_ITEMS: readonly CBREFooterSocialItem[] = [
  { label: 'Facebook', href: '#', icon: 'facebook' },
  { label: 'X', href: '#', icon: 'x' },
  { label: 'LinkedIn', href: '#', icon: 'linkedin' },
];

const FacebookIcon = (): JSX.Element => (
  <svg aria-hidden="true" className="cbre-footer__social-icon" viewBox="0 0 10 20">
    <path
      d="M8.79 3.32H10V.14C9.79.11 9.05 0 8.19 0 6.4 0 5.18 1.13 5.18 3.21V6H2v3.55h3.18V20H9V9.55h2.97L12.44 6H9V3.56c0-1.03.28-1.73 1.79-1.73Z"
      fill="currentColor"
      transform="translate(-1.22 0)"
    />
  </svg>
);

const XIcon = (): JSX.Element => (
  <svg aria-hidden="true" className="cbre-footer__social-icon" viewBox="0 0 19 19">
    <path
      d="M10.89 8.04 18.38 0h-1.77l-6.51 6.99L4.91 0H0l7.85 11.42L0 19h1.77l6.86-7.37L14.09 19H19l-8.11-10.96ZM9.53 9.5l-.79-1.12L2.46 1.1h2.23l5.06 7.2.79 1.12 6.58 9.36h-2.23L9.53 9.5Z"
      fill="currentColor"
    />
  </svg>
);

const LinkedInIcon = (): JSX.Element => (
  <svg aria-hidden="true" className="cbre-footer__social-icon" viewBox="0 0 21 20">
    <path
      d="M4.74 2.13A2.37 2.37 0 1 1 0 2.13a2.37 2.37 0 0 1 4.74 0ZM.32 20h4.42V6.26H.32V20ZM7.51 6.26h4.24v1.87h.06c.59-1.12 2.04-2.31 4.21-2.31 4.5 0 5.33 2.96 5.33 6.82V20h-4.42v-6.44c0-1.54-.03-3.52-2.14-3.52-2.15 0-2.48 1.68-2.48 3.41V20H7.51V6.26Z"
      fill="currentColor"
    />
  </svg>
);

const SocialIcon = ({ icon }: Pick<CBREFooterSocialItem, 'icon'>): JSX.Element => {
  switch (icon) {
    case 'facebook':
      return <FacebookIcon />;
    case 'x':
      return <XIcon />;
    case 'linkedin':
      return <LinkedInIcon />;
  }
};

const CBREFooter = ({
  primaryItems = DEFAULT_PRIMARY_ITEMS,
  secondaryItems = DEFAULT_SECONDARY_ITEMS,
  socialItems = DEFAULT_SOCIAL_ITEMS,
  homeHref = '/',
  copyrightText = 'Copyright © 2020 CBRE. All rights reserved.',
}: CBREFooterProps): JSX.Element => (
  <div className="cbre-footer">
    <div className="cbre-footer__inner">
      <div className="cbre-footer__top-rule" />

      <div className="cbre-footer__primary">
        <Link aria-label="CBRE home" className="cbre-footer__logo" href={homeHref}>
          <span className="cbre-footer__wordmark">CBRE</span>
        </Link>

        <nav aria-label="Footer primary" className="cbre-footer__primary-nav">
          <ul className="cbre-footer__primary-list">
            {primaryItems.map((item) => (
              <li key={item.label}>
                <Link className="cbre-footer__primary-link" href={item.href}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="cbre-footer__details">
        <div className="cbre-footer__divider" />

        <div className="cbre-footer__secondary">
          <nav aria-label="Footer secondary">
            <ul className="cbre-footer__secondary-list">
              {secondaryItems.map((item) => (
                <li key={item.label}>
                  <Link className="cbre-footer__secondary-link" href={item.href}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="cbre-footer__socials">
            {socialItems.map((item) => (
              <Link
                aria-label={item.label}
                className="cbre-footer__social-link"
                href={item.href}
                key={item.label}
              >
                <SocialIcon icon={item.icon} />
              </Link>
            ))}
          </div>
        </div>

        <p className="cbre-footer__copyright">{copyrightText}</p>
      </div>
    </div>
  </div>
);

export default CBREFooter;
