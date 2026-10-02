# React and UI

Read this file with `SKILL.md` and `typescript.md` before you write or review a `.tsx` file. Visual tokens and named design rules live in the project's design doc.

## Components

- A component is `React.FC<ComponentNameProps>` (`UserAvatar` takes `UserAvatarProps`), and it destructures props in the signature.
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

- JSX holds no logic. An event prop receives a named function, or an arrow whose whole body is one call to a named function: `onClick={() => selectItem(item.id)}`.
- Conditional rendering puts a real boolean before `&&`: `{hasItems && <ItemList />}`.
- A list `key` is a stable id.

## State

- Effects sync with external systems only. Derived state and events live in render and handlers. See https://react.dev/learn/you-might-not-need-an-effect.
- UI is state-driven. A ref holds a non-render value, and only when nothing else works.
- A value derived from props is computed in render.
- A hook lives beside the thing it controls.
- A framework hook is a thin adapter over plain functions.
- URL state uses nuqs (`parseAsInt`, `parseAsBoolean`, `createLoader`).
- Browser state uses `usehooks-ts` (`useLocalStorage`, `useMediaQuery`).
- Prefer the TanStack libraries wherever one fits: TanStack Form for forms, TanStack Store for shared client state, TanStack Query for server state.

## Structure

- A branch that returns a different UI is its own component.
- A page file composes components from their own files.
- Logic and types live in a module or a hook, outside the client component.
- Repeated markup becomes one generic component. Shared UI, such as `not-found`, is one component.
- Long prose pages (legal, policy) render from Markdown.

## Design system

- Build from the project's UI package and shadcn primitives, used as they are: `Button`, `Card`, `Table`, `Dialog` with `DialogHeader`, `ConfirmDialog`, `Carousel`. Trust the design system.
- A new look is a CVA variant on the primitive.
- Mobile first. Desktop layout uses `lg:` breakpoints.
- Style with Tailwind utilities: `rotate-45`, `size-full`, `via-transparent`.
- Every color, easing, surface, and type role comes from the design system's named tokens and utilities. A name missing from the design doc does not exist.
- Partial opacity (`/NN`) is for an element that is really transparent, such as a `bg-black/50 backdrop-blur-sm` overlay over page content. A softer color is a different token.
- The error variant is named `error`.
- `cn` joins classes under a condition.
- Every class and wrapper element does visible work.
- Padding and positions that scale use percentages. Pixel values are named tokens.
- Images use Next `Image` with static imports from the app's source assets folder, sized with classes. A static import carries its own size.
- Assets are imported from source, with no exceptions. The `public` folder stays empty. Fixed-URL files use the framework's file conventions, such as `app/robots.ts` and `app/icon.png`.
- Every image has a real `alt`.
- Mobile skips work too heavy for its memory, such as a high-resolution export.
- Check every change on mobile.

## Accessibility

- Every input has a label.
- Every mouse handler has a keyboard equivalent.
- An interactive element is the semantic element for its job: `<button>`, `<a>`, `<nav>`. A `div` with a role is a bug.
- Headings go in order, one level at a time.

## Copy

- Copy follows the project's voice guide.
- A shareable page has `generateMetadata` with friendly text for link previews. A single value goes directly in the metadata object.
- Data-page headings use the right level and no trailing period.
- Error states are designed: a toast on failure, styled error text.
- Body text is upright. Selectable text needs no copy button.
- Domain things use the domain's own words.
