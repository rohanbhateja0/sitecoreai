import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { Default as ArticleHero } from '../../../components/article-hero/ArticleHero';
import {
  mockArticleHeroEditingProps,
  mockArticleHeroNoFields,
  mockArticleHeroProps,
} from './ArticleHero.mockProps';

describe('ArticleHero Component should', () => {
  const getComponent = () => document.querySelector('.component.article-hero');

  it('render the article hero content and image', () => {
    render(<ArticleHero {...mockArticleHeroProps} />);

    expect(screen.getByText('Evolving Workforces')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'The Future of the Office' })).toBeInTheDocument();
    expect(screen.getByText('2020 Global Occupier Sentiment Survey: Fall Update')).toBeInTheDocument();
    expect(screen.getByText('September 21, 2020')).toBeInTheDocument();
    expect(screen.getByText('5 min read')).toBeInTheDocument();
    expect(screen.getByText(/Kris Kudson/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Download' })).toHaveAttribute('href', '/download-report');
    expect(screen.getByAltText('People working in an office hallway')).toBeInTheDocument();
  });

  it('apply the configured component classes and id', () => {
    render(<ArticleHero {...mockArticleHeroProps} />);

    expect(getComponent()).toHaveClass('component', 'article-hero', 'article-hero-styles');
    expect(getComponent()).toHaveAttribute('id', 'article-hero-test-id');
  });

  it('render icon links in normal mode', () => {
    render(<ArticleHero {...mockArticleHeroProps} />);

    expect(screen.getByRole('link', { name: 'Facebook' })).toHaveAttribute(
      'href',
      'https://facebook.com/cbre'
    );
    expect(screen.getByRole('link', { name: 'X' })).toHaveAttribute('href', 'https://x.com/cbre');
    expect(screen.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute(
      'href',
      'https://linkedin.com/company/cbre'
    );
    expect(screen.getByRole('link', { name: 'Email' })).toHaveAttribute(
      'href',
      'mailto:info@example.com'
    );
  });

  it('render editable social links in page editing mode', () => {
    render(<ArticleHero {...mockArticleHeroEditingProps} />);

    expect(document.querySelectorAll('.article-hero__social-editor-item')).toHaveLength(4);
    expect(screen.getByText('Facebook')).toBeInTheDocument();
    expect(screen.getAllByText('LinkedIn').length).toBeGreaterThan(0);
  });

  it('show an empty hint when fields are missing', () => {
    render(<ArticleHero {...mockArticleHeroNoFields} />);

    const emptyHint = screen.getByText('Article Hero');
    expect(emptyHint).toBeInTheDocument();
    expect(emptyHint).toHaveClass('is-empty-hint');
  });
});
