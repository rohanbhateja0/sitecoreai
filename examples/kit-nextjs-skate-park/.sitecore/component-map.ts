// Below are built-in components that are available in the app, it's recommended to keep them as is

import { BYOCServerWrapper, NextjsContentSdkComponent, FEaaSServerWrapper } from '@sitecore-content-sdk/nextjs';
import { Form } from '@sitecore-content-sdk/nextjs';

// end of built-in components
import * as Title from 'src/components/title/Title';
import * as StructuredData from 'src/components/structured-data/StructuredData';
import * as RowSplitter from 'src/components/row-splitter/RowSplitter';
import * as RichText from 'src/components/rich-text/RichText';
import * as types from 'src/components/property-listings/types';
import * as PropertySearchBox from 'src/components/property-listings/PropertySearchBox';
import * as PropertyResultsList from 'src/components/property-listings/PropertyResultsList';
import * as PropertyPagination from 'src/components/property-listings/PropertyPagination';
import * as PropertyMap from 'src/components/property-listings/PropertyMap';
import * as PropertyListingsPage from 'src/components/property-listings/PropertyListingsPage';
import * as PropertyFilters from 'src/components/property-listings/PropertyFilters';
import * as Promo from 'src/components/promo/Promo';
import * as PartialDesignDynamicPlaceholder from 'src/components/partial-design-dynamic-placeholder/PartialDesignDynamicPlaceholder';
import * as PageContent from 'src/components/page-content/PageContent';
import * as Navigation from 'src/components/navigation/Navigation';
import * as LinkList from 'src/components/link-list/LinkList';
import * as Image from 'src/components/image/Image';
import * as ContentBlock from 'src/components/content-block/ContentBlock';
import * as Container from 'src/components/container/Container';
import * as ColumnSplitter from 'src/components/column-splitter/ColumnSplitter';
import * as CBREHeader from 'src/components/cbre-header/CBREHeader';
import * as CBREFooter from 'src/components/cbre-footer/CBREFooter';
import * as ArticleHero from 'src/components/article-hero/ArticleHero';

export const componentMap = new Map<string, NextjsContentSdkComponent>([
  ['BYOCWrapper', BYOCServerWrapper],
  ['FEaaSWrapper', FEaaSServerWrapper],
  ['Form', { ...Form, componentType: 'client' }],
  ['Title', { ...Title }],
  ['StructuredData', { ...StructuredData }],
  ['RowSplitter', { ...RowSplitter }],
  ['RichText', { ...RichText }],
  ['types', { ...types }],
  ['PropertySearchBox', { ...PropertySearchBox, componentType: 'client' }],
  ['PropertyResultsList', { ...PropertyResultsList, componentType: 'client' }],
  ['PropertyPagination', { ...PropertyPagination, componentType: 'client' }],
  ['PropertyMap', { ...PropertyMap, componentType: 'client' }],
  ['PropertyListingsPage', { ...PropertyListingsPage, componentType: 'client' }],
  ['PropertyFilters', { ...PropertyFilters, componentType: 'client' }],
  ['Promo', { ...Promo }],
  ['PartialDesignDynamicPlaceholder', { ...PartialDesignDynamicPlaceholder }],
  ['PageContent', { ...PageContent }],
  ['Navigation', { ...Navigation, componentType: 'client' }],
  ['LinkList', { ...LinkList }],
  ['Image', { ...Image }],
  ['ContentBlock', { ...ContentBlock }],
  ['Container', { ...Container }],
  ['ColumnSplitter', { ...ColumnSplitter }],
  ['CBREHeader', { ...CBREHeader }],
  ['CBREFooter', { ...CBREFooter }],
  ['ArticleHero', { ...ArticleHero }],
]);

export default componentMap;
