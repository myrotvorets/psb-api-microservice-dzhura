FROM myrotvorets/node:latest AS base
USER root
WORKDIR /srv/service
RUN chown nobody:nogroup /srv/service
USER nobody:nogroup
COPY --chown=nobody:nogroup ./package.json ./package-lock.json ./tsconfig.json .npmrc ./

FROM base AS deps
RUN npm ci --only=prod

FROM base AS build
RUN \
    npm r --package-lock-only \
        eslint @myrotvorets/eslint-config-myrotvorets-ts @typescript-eslint/eslint-plugin eslint-plugin-import eslint-plugin-prettier \
        @types/jest jest ts-jest merge \
        nodemon && \
    npm ci
COPY --chown=nobody:nogroup ./src ./src
RUN npm run build

FROM myrotvorets/node-min
USER root
WORKDIR /srv/service
RUN chown nobody:nogroup /srv/service
USER nobody:nogroup
ENTRYPOINT ["/usr/bin/node", "server.js"]
COPY --chown=nobody:nogroup ./src/specs ./specs
COPY --chown=nobody:nogroup --from=build /srv/service/dist/ ./
COPY --chown=nobody:nogroup --from=deps /srv/service/node_modules ./node_modules
