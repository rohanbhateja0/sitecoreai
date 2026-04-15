import type { ComponentProps } from 'lib/component-props';

export interface CBREFooterParams {
  [key: string]: string | undefined;
}

export type CBREFooterFields = Record<string, never>;

export interface CBREFooterNavItem {
  label: string;
  href: string;
}

export interface CBREFooterSocialItem {
  label: string;
  href: string;
  icon: 'facebook' | 'x' | 'linkedin';
}

export interface CBREFooterProps extends Partial<ComponentProps> {
  params?: ComponentProps['params'] & CBREFooterParams;
  fields?: CBREFooterFields | null;
  primaryItems?: readonly CBREFooterNavItem[];
  secondaryItems?: readonly CBREFooterNavItem[];
  socialItems?: readonly CBREFooterSocialItem[];
  homeHref?: string;
  copyrightText?: string;
}
