import type { ComponentProps } from 'lib/component-props';

export interface CBREHeaderParams {
  [key: string]: string | undefined;
}

export type CBREHeaderFields = Record<string, never>;

export interface CBREHeaderNavItem {
  label: string;
  href: string;
}

export interface CBREHeaderProps extends Partial<ComponentProps> {
  params?: ComponentProps['params'] & CBREHeaderParams;
  fields?: CBREHeaderFields | null;
  items?: readonly CBREHeaderNavItem[];
  homeHref?: string;
  localeLabel?: string;
  searchHref?: string;
}
