FROM ghcr.io/cloud-cli/node:latest AS builder

USER 0
COPY . .
RUN pnpm i && pnpm build && pnpm test && rm -r node_modules/ src/ tmp/

FROM ghcr.io/cloud-cli/node:latest

COPY --from=builder /home/app/ .
RUN pnpm i --prod
