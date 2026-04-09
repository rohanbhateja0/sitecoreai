import type { JSX, SVGProps } from 'react';
import { Link as ContentSdkLink, NextImage, Text } from '@sitecore-content-sdk/nextjs';
import type { LinkField } from '@sitecore-content-sdk/nextjs';
import type { ArticleHeroProps } from '@/types/article-hero';

type SocialIconName = 'facebook' | 'twitter' | 'linkedin' | 'email';

interface ArticleHeroViewProps {
  fields?: ArticleHeroProps['fields'];
  id?: string;
  styles?: string;
  isEditing: boolean;
  variantClassName?: string;
}

interface SocialLinkDefinition {
  field?: LinkField;
  label: string;
  icon: SocialIconName;
}

const hasTextValue = (value?: string): boolean => Boolean(value?.trim());

const hasLinkValue = (field?: LinkField): boolean => Boolean(field?.value?.href);

const SocialIcon = ({
  icon,
  ...svgProps
}: { icon: SocialIconName } & SVGProps<SVGSVGElement>): JSX.Element => {
  switch (icon) {
    case 'facebook':
      return (
        <svg fill="currentColor" viewBox="0 0 10 20" xmlns="http://www.w3.org/2000/svg" {...svgProps}>
          <path d="M8.79 3.32H10V.14C9.79.11 9.05 0 8.19 0 6.4 0 5.18 1.13 5.18 3.21V6H2v3.55h3.18V20H9V9.55h2.97L12.44 6H9V3.56c0-1.03.28-1.73 1.79-1.73Z" />
        </svg>
      );
    case 'twitter':
      return (
        <svg fill="currentColor" viewBox="0 0 19 19" xmlns="http://www.w3.org/2000/svg" {...svgProps}>
          <path d="M10.89 8.04 18.38 0h-1.77l-6.51 6.99L4.91 0H0l7.85 11.42L0 19h1.77l6.86-7.37L14.09 19H19l-8.11-10.96ZM9.53 9.5l-.79-1.12L2.46 1.1h2.23l5.06 7.2.79 1.12 6.58 9.36h-2.23L9.53 9.5Z" />
        </svg>
      );
    case 'linkedin':
      return (
        <svg fill="currentColor" viewBox="0 0 21 20" xmlns="http://www.w3.org/2000/svg" {...svgProps}>
          <path d="M4.74 2.13A2.37 2.37 0 1 1 0 2.13a2.37 2.37 0 0 1 4.74 0ZM.32 20h4.42V6.26H.32V20ZM7.51 6.26h4.24v1.87h.06c.59-1.12 2.04-2.31 4.21-2.31 4.5 0 5.33 2.96 5.33 6.82V20h-4.42v-6.44c0-1.54-.03-3.52-2.14-3.52-2.15 0-2.48 1.68-2.48 3.41V20H7.51V6.26Z" />
        </svg>
      );
    case 'email':
      return (
        <svg fill="none" viewBox="0 0 21 14" xmlns="http://www.w3.org/2000/svg" {...svgProps}>
          <path
            d="M19 1H2C1.45 1 1 1.45 1 2v10c0 .55.45 1 1 1h17c.55 0 1-.45 1-1V2c0-.55-.45-1-1-1ZM19 3l-8.5 5L2 3V2l8.5 5L19 2v1Z"
            fill="currentColor"
          />
        </svg>
      );
  }
};

const socialLinkDefinitions = (fields?: ArticleHeroProps['fields']): SocialLinkDefinition[] => [
  { field: fields?.FacebookLink, label: 'Facebook', icon: 'facebook' },
  { field: fields?.TwitterLink, label: 'X', icon: 'twitter' },
  { field: fields?.LinkedInLink, label: 'LinkedIn', icon: 'linkedin' },
  { field: fields?.EmailLink, label: 'Email', icon: 'email' },
];

const ArticleHeroView = ({
  fields,
  id,
  styles = '',
  isEditing,
  variantClassName = '',
}: ArticleHeroViewProps): JSX.Element => {
  const eyebrow = fields?.Eyebrow;
  const title = fields?.Title;
  const description = fields?.Description;
  const publishDate = fields?.PublishDate;
  const readTime = fields?.ReadTime;
  const authors = fields?.Authors;
  const primaryCta = fields?.PrimaryCta;
  const heroImage = fields?.HeroImage;
  const socialLinks = socialLinkDefinitions(fields);
  const visibleSocialLinks = socialLinks.filter(({ field }) => hasLinkValue(field));
  const editableSocialLinks = socialLinks.filter(({ field }) => Boolean(field));

  if (!fields) {
    return (
      <section className={`component article-hero ${styles}`.trim()} id={id}>
        <div className="component-content">
          <span className="is-empty-hint">Article Hero</span>
        </div>
      </section>
    );
  }

  return (
    <section className={`component article-hero ${variantClassName} ${styles}`.trim()} id={id}>
      <div className="component-content">
        <div className="article-hero__layout">
          <div className="article-hero__content-column">
            <div className="article-hero__content-shell">
              <div className="article-hero__accent" aria-hidden="true" />

              <div className="article-hero__content">
                <div className="article-hero__header">
                  {(eyebrow?.value || isEditing) && (
                    <Text className="article-hero__eyebrow" tag="p" field={eyebrow} />
                  )}
                  {(title?.value || isEditing) && (
                    <Text className="article-hero__title" tag="h1" field={title} />
                  )}
                </div>

                <div className="article-hero__details">
                  {(description?.value || isEditing) && (
                    <Text className="article-hero__description" tag="p" field={description} />
                  )}

                  {((publishDate && hasTextValue(String(publishDate.value ?? ''))) ||
                    (readTime && hasTextValue(String(readTime.value ?? ''))) ||
                    authors?.value ||
                    isEditing) && (
                    <div className="article-hero__meta">
                      <div className="article-hero__meta-row">
                        {(publishDate?.value || isEditing) && (
                          <Text className="article-hero__meta-item" tag="p" field={publishDate} />
                        )}
                        {(readTime?.value || isEditing) && (
                          <Text className="article-hero__meta-item" tag="p" field={readTime} />
                        )}
                      </div>

                      {(authors?.value || isEditing) && (
                        <p className="article-hero__authors">
                          <span className="article-hero__authors-prefix">By </span>
                          <Text tag="span" field={authors} />
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {((primaryCta && (primaryCta.value?.href || isEditing)) ||
                  visibleSocialLinks.length > 0 ||
                  (isEditing && editableSocialLinks.length > 0)) && (
                  <div className="article-hero__actions">
                    {(primaryCta?.value?.href || isEditing) && primaryCta && (
                      <ContentSdkLink className="article-hero__cta" field={primaryCta} />
                    )}

                    {(visibleSocialLinks.length > 0 || (isEditing && editableSocialLinks.length > 0)) && (
                      <div className="article-hero__socials">
                        {!isEditing &&
                          visibleSocialLinks.map(({ field, label, icon }) => (
                            <a
                              key={label}
                              className="article-hero__social-link"
                              href={field?.value?.href}
                              target={field?.value?.target}
                              rel={field?.value?.target === '_blank' ? 'noreferrer' : undefined}
                              aria-label={label}
                            >
                              <SocialIcon className="article-hero__social-icon" icon={icon} />
                            </a>
                          ))}

                        {isEditing && editableSocialLinks.length > 0 && (
                          <div className="article-hero__social-editor-list">
                            {editableSocialLinks.map(({ field, label, icon }) => (
                              <div className="article-hero__social-editor-item" key={label}>
                                <span className="article-hero__social-link" aria-hidden="true">
                                  <SocialIcon className="article-hero__social-icon" icon={icon} />
                                </span>
                                {field && (
                                  <ContentSdkLink className="article-hero__social-editor-link" field={field} />
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {(heroImage?.value?.src || isEditing) && heroImage && (
            <div className="article-hero__image-column">
              <NextImage
                className="article-hero__image"
                field={heroImage}
                sizes="(max-width: 1024px) 100vw, 488px"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export const Default = ({ fields, params, page }: ArticleHeroProps): JSX.Element => (
  <ArticleHeroView
    fields={fields}
    id={typeof params.RenderingIdentifier === 'string' ? params.RenderingIdentifier : undefined}
    styles={params.styles}
    isEditing={Boolean(page?.mode?.isEditing)}
  />
);

export const Stacked = ({ fields, params, page }: ArticleHeroProps): JSX.Element => (
  <ArticleHeroView
    fields={fields}
    id={typeof params.RenderingIdentifier === 'string' ? params.RenderingIdentifier : undefined}
    styles={params.styles}
    isEditing={Boolean(page?.mode?.isEditing)}
    variantClassName="article-hero--stacked"
  />
);
