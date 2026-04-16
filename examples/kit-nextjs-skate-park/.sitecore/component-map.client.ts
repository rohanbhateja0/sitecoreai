// Client-safe component map for App Router

import { BYOCClientWrapper, NextjsContentSdkComponent, FEaaSClientWrapper } from '@sitecore-content-sdk/nextjs';
import { Form } from '@sitecore-content-sdk/nextjs';

import * as PropertySearchBox from 'src/components/property-listings/PropertySearchBox';
import * as PropertyResultsList from 'src/components/property-listings/PropertyResultsList';
import * as PropertyPagination from 'src/components/property-listings/PropertyPagination';
import * as PropertyMap from 'src/components/property-listings/PropertyMap';
import * as PropertyListingsPage from 'src/components/property-listings/PropertyListingsPage';
import * as PropertyFilters from 'src/components/property-listings/PropertyFilters';
import * as Navigation from 'src/components/navigation/Navigation';

export const componentMap = new Map<string, NextjsContentSdkComponent>([
  ['BYOCWrapper', BYOCClientWrapper],
  ['FEaaSWrapper', FEaaSClientWrapper],
  ['Form', Form],
  ['PropertySearchBox', { ...PropertySearchBox }],
  ['PropertyResultsList', { ...PropertyResultsList }],
  ['PropertyPagination', { ...PropertyPagination }],
  ['PropertyMap', { ...PropertyMap }],
  ['PropertyListingsPage', { ...PropertyListingsPage }],
  ['PropertyFilters', { ...PropertyFilters }],
  ['Navigation', { ...Navigation }],
]);

export default componentMap;
