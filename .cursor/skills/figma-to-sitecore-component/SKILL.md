---
name: figma-to-sitecore-component
description: Build a Sitecore XM Cloud component in examples/kit-nextjs-skate-park from a Figma design. Use when the user shares a Figma URL or asks to create, implement, or scaffold a component from Figma, including screenshot and metadata capture, component creation under src/components, prop and field types under src/types, editable Sitecore field rendering, and lint/type-check verification.
---
# Figma To Sitecore Component

## Use This Skill When

- The user wants a component created from a Figma design.
- The task targets `examples/kit-nextjs-skate-park`.
- The component should follow the existing Sitecore component structure in `src/components`.
- The props and field types should live in `examples/kit-nextjs-skate-park/src/types`.

## Outcome

Create or update:

- `examples/kit-nextjs-skate-park/src/components/<component-folder>/<ComponentName>.tsx`
- `examples/kit-nextjs-skate-park/src/types/<component-name>.ts`

The `.tsx` file owns the render logic and variants.
The `.ts` file owns props, params, field, and item types.

## Required Workflow

### 1. Gather Figma context first

Before writing code:

1. Read the Figma MCP tool schema you plan to use.
2. Get a screenshot of the target node.
3. Get metadata for the same node.
4. If the layout, tokens, or hierarchy are still unclear, get design context too.

Capture:

- node name and node id
- frame size and layout direction
- spacing, padding, and alignment
- typography, colors, and border radius
- image treatments, icons, and interactive states
- variant/state differences that should become component variants

Do not start coding from metadata alone when the screenshot reveals visual details not present in the metadata.

### 2. Inspect local implementation patterns

Read a few nearby files in `examples/kit-nextjs-skate-park/src/components` before adding a new component. At minimum, inspect:

- a simple field-driven component
- a component with named variants
- `src/lib/component-props/index.ts`

Use the local starter's conventions rather than inventing a new structure.

### 3. Place files in the project-specific locations

Use these target locations:

- component: `examples/kit-nextjs-skate-park/src/components/<kebab-name>/<PascalName>.tsx`
- types: `examples/kit-nextjs-skate-park/src/types/<kebab-name>.ts`

If `src/types` does not exist yet, create it.

Do not create a shared package, shared workspace utility, or cross-starter abstraction.

### 4. Split responsibilities cleanly

The `src/types/<kebab-name>.ts` file should export:

- `<ComponentName>Params`
- `<ComponentName>Fields`
- `<ComponentName>Props`
- any nested item interfaces needed for repeaters or cards

The `src/components/<kebab-name>/<ComponentName>.tsx` file should contain:

- the actual component render logic
- named variants such as `Default`, `Stacked`, `Compact`, or other design-driven variants
- small private helpers if needed

Keep the component variants in the `.tsx` file unless the component becomes unmanageably large.

### 5. Preserve Sitecore editability

Fields must remain editable in Experience Editor.

Rules:

- Prefer Sitecore field components such as `Text`, `RichText`, `Link`, and `NextImage`.
- Do not eagerly flatten editable fields into plain strings unless only used for non-editable derived values like `alt`, `aria-label`, or JSON-LD.
- When the component behavior changes in editing mode, use `useSitecore()` or `page.mode.isEditing`.
- If a link or interactive wrapper would interfere with editing, disable or simplify that behavior while editing.
- Use safe optional access for datasource and nested field objects.

Use patterns like:

```tsx
const { page } = useSitecore();
const isEditing = page.mode.isEditing;
```

and:

```tsx
{(fields?.title?.value || isEditing) && <Text tag="h2" field={fields.title} />}
```

If the component is GraphQL-shaped and uses `jsonValue`, render the `jsonValue` field object directly:

```tsx
{(title?.jsonValue?.value || isEditing) && <Text tag="h2" field={title?.jsonValue} />}
```

### 6. Match the existing starter conventions

For `kit-nextjs-skate-park`:

- extend from `ComponentProps` in `lib/component-props`
- use import aliases already supported by the starter, such as `components/*`, `lib/*`, and `@/*`
- prefer safe, readable TypeScript over `any`
- keep naming explicit and aligned with business meaning
- reuse local wrappers and utilities when they already solve the problem

Do not edit generated files such as `.next/` or `.sitecore/component-map.ts`.

### 7. Suggested type template

Use this as a starting point and adapt it to the actual design and data shape:

```ts
import type { ComponentProps } from 'lib/component-props';
import type { Field, ImageField, LinkField } from '@sitecore-content-sdk/nextjs';

export interface HeroBannerParams {
  [key: string]: string | undefined;
}

export interface HeroBannerFields {
  Eyebrow?: Field<string>;
  Title?: Field<string>;
  Description?: Field<string>;
  PrimaryCta?: LinkField;
  SecondaryCta?: LinkField;
  BackgroundImage?: ImageField;
}

export interface HeroBannerProps extends ComponentProps {
  params: ComponentProps['params'] & HeroBannerParams;
  fields?: HeroBannerFields;
}
```

If the component uses GraphQL datasource output instead of direct field props, define that shape explicitly in the type file instead of forcing it into the direct field pattern.

### 8. Suggested component template

Keep the component editable and variant-friendly:

```tsx
'use client';

import type { JSX } from 'react';
import {
  Link,
  NextImage,
  RichText,
  Text,
  useSitecore,
} from '@sitecore-content-sdk/nextjs';
import type { HeroBannerProps } from '@/types/hero-banner';

const HeroBannerContent = ({ fields, id, styles, isEditing }: HeroBannerViewProps): JSX.Element => (
  <section className={`component hero-banner ${styles}`.trim()} id={id}>
    {(fields?.Eyebrow?.value || isEditing) && <Text tag="p" field={fields.Eyebrow} />}
    {(fields?.Title?.value || isEditing) && <Text tag="h2" field={fields.Title} />}
    {(fields?.Description?.value || isEditing) && <RichText field={fields.Description} />}
    {(fields?.PrimaryCta?.value?.href || isEditing) && <Link field={fields.PrimaryCta} />}
    {(fields?.BackgroundImage?.value?.src || isEditing) && <NextImage field={fields.BackgroundImage} />}
  </section>
);

interface HeroBannerViewProps {
  fields?: HeroBannerProps['fields'];
  id?: string;
  styles?: string;
  isEditing: boolean;
}

export const Default = ({ fields, params }: HeroBannerProps): JSX.Element => {
  const { page } = useSitecore();
  const isEditing = page.mode.isEditing;

  return (
    <HeroBannerContent
      fields={fields}
      id={params.RenderingIdentifier}
      styles={params.styles}
      isEditing={isEditing}
    />
  );
};

export const Compact = ({ fields, params }: HeroBannerProps): JSX.Element => {
  const { page } = useSitecore();
  const isEditing = page.mode.isEditing;

  return (
    <HeroBannerContent
      fields={fields}
      id={params.RenderingIdentifier}
      styles={`compact ${params.styles ?? ''}`.trim()}
      isEditing={isEditing}
    />
  );
};
```

Adapt the wrapper element, client/server boundary, and variant names to the actual design.

### 9. Validation loop is mandatory

After editing:

1. Run `ReadLints` on the files you changed.
2. Fix introduced lint issues.
3. Run `npm run lint` in `examples/kit-nextjs-skate-park`.
4. Run `npm run type-check` in `examples/kit-nextjs-skate-park`.

If the component introduces meaningful logic and there is an existing nearby testing pattern, add a focused test. Avoid low-value tests that only restate JSX structure.

### 10. Final check before stopping

Confirm that:

- the Figma screenshot and metadata were both reviewed
- the component file is under `src/components`
- the field and prop types live under `src/types`
- fields remain editable in page editing mode
- variant exports are in the `.tsx` file
- lint and type-check pass, or any remaining issues are reported clearly

## Short Checklist

Copy this when doing the work:

```text
- [ ] Read Figma tool schema
- [ ] Get screenshot
- [ ] Get metadata
- [ ] Inspect local component patterns
- [ ] Create/update component .tsx
- [ ] Create/update types .ts
- [ ] Preserve editable Sitecore fields
- [ ] Run ReadLints
- [ ] Run npm run lint
- [ ] Run npm run type-check
```
