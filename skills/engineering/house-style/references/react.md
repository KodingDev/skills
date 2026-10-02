# React and UI

Read this file with `SKILL.md` and `typescript.md` before you write or review a `.tsx` file. Visual tokens and named design rules live in the project's design doc.

## Components

- A component is `React.FC<ComponentNameProps>` (`SkinChip` takes `SkinChipProps`), and it destructures props in the signature.
- A props type is exported when another file imports it.
- A wrapper component takes `React.PropsWithChildren` and `className`.
- A component that wraps an element extends `React.ComponentProps<"div">` (or that element) and spreads the rest.
- Props exist for real callers. A fixed dimension stays fixed.
- JSX uses the automatic runtime, without `import React`.
- Each component is declared at module level.
- `ref` is a prop (React 19).
- Page and route props use the framework's typed helpers, such as `PageProps` and `RouteProps<"/route">`.
- Async data loads in Server Components. Client Components are synchronous.
- A link with `target="_blank"` has `rel="noopener"`.

## Events and rendering

- JSX holds no logic. An event prop receives a named function, or an arrow whose whole body is one call to a named function: `onClick={() => selectSkin(skin.id)}`.
- Conditional rendering puts a real boolean before `&&`: `{hasTracks && <TrackList />}`.
- A list `key` is a stable id.

## State

- Effects sync with external systems only. Derived state and events live in render and handlers. See https://react.dev/learn/you-might-not-need-an-effect.
- UI is state-driven. A ref holds a non-render value, and only when nothing else works.
- A value derived from props is computed in render.
- A hook lives beside the thing it controls: a light rig owns its rotation.
- A framework hook is a thin adapter over plain functions.
- URL state uses nuqs (`parseAsInt`, `parseAsBoolean`, `createLoader`).
- Browser state uses `usehooks-ts` (`useLocalStorage`, `useMediaQuery`).
- Forms use react-hook-form.

## Structure

- A branch that returns a different UI is its own component.
- A page file composes components from their own files.
- Logic and types live in a module or a hook, outside the client component.
- Repeated markup becomes one generic component. Shared UI, such as `not-found`, is one component.
- Long prose pages (legal, policy) render from Markdown.

## Design system

- Build from the project's UI package and shadcn primitives, used as they are: `Button`, `Card`, `Table`, `Dialog` with `DialogHeader`, `ConfirmDialog`, `Carousel`, the video player. Trust the design system.
- A new look is a CVA variant on the primitive.
- Mobile first. Desktop layout uses `lg:` breakpoints.
- Style with Tailwind utilities: `rotate-45`, `size-full`, `via-transparent`.
- Every color, easing, surface, and type role comes from the design system's named tokens and utilities. A name missing from the design doc does not exist.
- Partial opacity (`/NN`) is for an element that is really transparent, such as a `bg-black/50 backdrop-blur-sm` overlay over scene content. A softer color is a different token.
- The error variant is named `error`.
- `cn` joins classes under a condition.
- Every class and wrapper element does visible work.
- Padding and positions that scale use percentages. Pixel values are named tokens.
- Images use Next `Image` with static imports from the app's assets folder, sized with classes. A static import carries its own size.
- Every image has a real `alt`.
- Mobile skips work too heavy for its memory, such as a 4K capture.
- Check every change on mobile.

## Copy

- Copy follows the project's voice guide.
- A shareable page has `generateMetadata` with friendly text for link previews. A single value goes directly in the metadata object.
- Data-page headings use the right level and no trailing period.
- Error states are designed: a toast on failure, styled error text.
- Item descriptions are upright text, selectable without a copy button.
- Domain things use the domain's own words.
