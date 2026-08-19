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

Measure before you touch: `docker history <image>` names the fat layer, and the fix
targets its cause. Five rules cover approximately 90% of container quality. Apply each rule that touches the
Dockerfile in front of you. Call out violations even when the user did not ask.

## 1. Slim over alpine

Alpine uses musl libc. Almost all prebuilt native artifacts (Python wheels, Node native
modules) target glibc. On alpine, they compile from source, which needs `build-base`
toolchains and multiplies build time. Or they run slower, silently. Default to `-slim`:
glibc, approximately 90 MB more than alpine. Then binaries install as binaries. Use alpine
only when everything in the image is pure, or when you control the whole toolchain.

## 2. Layer order is your cache strategy

Docker reuses layers until an earlier input changes. Structure the Dockerfile as an onion.
The outermost layers change most often, so peel from the outside: copy the dependency
manifests first, install, *then* copy the source.

```dockerfile
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
```

Now a code edit invalidates only the final copy. The install layer stays cached. Use the
lockfile-strict installer (`npm ci`, not `npm install`).

## 3. .dockerignore, not surgical COPYs

`COPY . .` is fine. The bad pattern is a dirty build context. Put `node_modules`, `.git`,
logs, and build artifacts in `.dockerignore`. Do not maintain a long list of per-file COPY
lines. Each Dockerfile ships with a `.dockerignore`.

## 4. Builder stage is the bloat zone

Use a multi-stage build. Compile in a `builder` stage. The final stage carries the runtime
only. For compiled languages, copy the one binary. `FROM scratch` is the floor: a Go
hello-world lands at approximately 2 MB. Distroless is the practical choice when you want CA
certs, a nonroot user, and sane defaults, without a shell or a package manager.

## 5. Digests over tags

Tags move: `latest`, `nightly`, and even version tags, especially on internal registries. Pin
the base image by digest (`node:26-slim@sha256:…`, from `docker buildx imagetools inspect`).
Then the build is reproducible, whatever the tag points at tomorrow.

## Escape hatch: two processes, one container

One process per container is a vibe, not a law. Sometimes an app needs a sidecar in the same
box (nginx in front of an app server), and you are not at orchestrator scale. Then run both
under `supervisord` with autorestart. That costs less than the complexity of a second
container.
