import { mockPage } from '../../mocks/mockPage';

export const mockArticleHeroProps = {
  rendering: {
    componentName: 'ArticleHero',
    dataSource: '',
    uid: 'article-hero-default-uid',
  },
  params: {
    styles: 'article-hero-styles',
    RenderingIdentifier: 'article-hero-test-id',
  },
  fields: {
    Eyebrow: {
      value: 'Evolving Workforces',
    },
    Title: {
      value: 'The Future of the Office',
    },
    Description: {
      value: '2020 Global Occupier Sentiment Survey: Fall Update',
    },
    PublishDate: {
      value: 'September 21, 2020',
    },
    ReadTime: {
      value: '5 min read',
    },
    Authors: {
      value: 'Kris Kudson, Stuart Kuhic, Zuzanna Anandbahadoer, Richard Blake',
    },
    PrimaryCta: {
      value: {
        href: '/download-report',
        text: 'Download',
      },
    },
    HeroImage: {
      value: {
        src: '/article-hero.jpg',
        alt: 'People working in an office hallway',
        width: 488,
        height: 681,
      },
    },
    FacebookLink: {
      value: {
        href: 'https://facebook.com/cbre',
        text: 'Facebook',
      },
    },
    TwitterLink: {
      value: {
        href: 'https://x.com/cbre',
        text: 'X',
      },
    },
    LinkedInLink: {
      value: {
        href: 'https://linkedin.com/company/cbre',
        text: 'LinkedIn',
      },
    },
    EmailLink: {
      value: {
        href: 'mailto:info@example.com',
        text: 'Email',
      },
    },
  },
  page: mockPage,
};

export const mockArticleHeroEditingProps = {
  ...mockArticleHeroProps,
  page: {
    ...mockPage,
    mode: {
      ...mockPage.mode,
      isEditing: true,
    },
  },
};

export const mockArticleHeroNoFields = {
  rendering: {
    componentName: 'ArticleHero',
    dataSource: '',
    uid: 'article-hero-empty-uid',
  },
  params: {
    styles: 'article-hero-empty-styles',
    RenderingIdentifier: 'article-hero-empty-id',
  },
  fields: null as unknown as typeof mockArticleHeroProps.fields,
  page: mockPage,
};
