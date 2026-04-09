import type { ComponentProps } from 'lib/component-props';
import type { Field, ImageField, LinkField } from '@sitecore-content-sdk/nextjs';

export interface ArticleHeroParams {
  [key: string]: string | undefined;
}

export interface ArticleHeroFields {
  Eyebrow?: Field<string>;
  Title?: Field<string>;
  Description?: Field<string>;
  PublishDate?: Field<string>;
  ReadTime?: Field<string>;
  Authors?: Field<string>;
  PrimaryCta?: LinkField;
  HeroImage?: ImageField;
  FacebookLink?: LinkField;
  TwitterLink?: LinkField;
  LinkedInLink?: LinkField;
  EmailLink?: LinkField;
}

export interface ArticleHeroProps extends ComponentProps {
  params: ComponentProps['params'] & ArticleHeroParams;
  fields?: ArticleHeroFields | null;
}
