---
name: lean-containers
description: >
  Container image discipline for writing or reviewing Dockerfiles: base image
  choice (alpine vs slim vs distroless), layer-order caching, .dockerignore,
  multi-stage builds, digest pinning. Use when writing or editing a Dockerfile
  or compose build, when an image is huge or builds are slow, when a build
  fails only inside alpine, or when the user mentions image size, layer
  caching, or base image choice.
---

# Lean Containers

Five rules that cover ~90% of container quality. Apply every rule that touches
the Dockerfile in front of you; call out violations even when unasked.

## 1. Slim over alpine

Alpine uses musl libc; nearly all prebuilt native artifacts (Python wheels,
Node native modules) target glibc. On alpine they recompile from source —
needing `build-base` toolchains, multiplying build time — or silently run
slower. Default to `-slim` (glibc, ~90 MB over alpine) and let binaries
install as binaries. Reach for alpine only when everything in the image is
pure or you control the whole toolchain.

## 2. Layer order is your cache strategy

Docker reuses layers until an earlier input changes. Structure the Dockerfile
as an onion: outermost layers change most often, so peel from the outside —
copy dependency manifests first, install, *then* copy source.

```dockerfile
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
```

A code edit now invalidates only the final copy; the install layer stays
cached. Use the lockfile-strict installer (`npm ci`, not `npm install`).

## 3. .dockerignore, not surgical COPYs

`COPY . .` is fine — the bad pattern is a dirty build context. Ignore
`node_modules`, `.git`, logs, and build artifacts in `.dockerignore` instead
of maintaining a mile-long list of per-file COPY lines. Every Dockerfile ships
with one.

## 4. Builder stage is the bloat zone

Multi-stage: compile in a `builder` stage, and the final stage carries runtime
only — for compiled languages, copy the one binary. `FROM scratch` is the
floor (a Go hello-world lands ~2 MB); distroless is the practical pick when
you want CA certs, a nonroot user, and sane defaults without a shell or
package manager.

## 5. Digests over tags

Tags move — `latest`, `nightly`, even version tags, especially on internal
registries. Pin the base image by digest
(`node:26-slim@sha256:…`, from `docker buildx imagetools inspect`) so the
build is reproducible regardless of what the tag points at tomorrow.

## Escape hatch: two processes, one container

One process per container is a vibe, not a law. When an app genuinely needs a
sidecar-in-the-same-box (nginx in front of an app server) and you're not at
orchestrator scale, run both under `supervisord` with autorestart rather than
paying the complexity of a second container.
