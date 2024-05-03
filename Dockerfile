FROM node:22.1.0-slim as dev

# Install latest chrome dev package and fonts to support major charsets (Chinese, Japanese, Arabic, Hebrew, Thai and a few others)
# Note: this installs the necessary libs to make the bundled version of Chromium that Puppeteer
# installs, work.
# hadolint ignore=DL4006,DL3015
RUN apt-get update \
    && apt-get install -y \
      wget=1.21.3-1+b2 \
      gnupg=2.2.40-1.1 \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y \
      procps=2:4.0.2-3 \
      google-chrome-stable=124.* \
      fonts-ipafont-gothic=00303-23 \
      fonts-wqy-zenhei=0.9.45-8 \
      fonts-thai-tlwg=1:0.7.3-1 \
      fonts-kacst=2.01+mry-15 \
      fonts-freefont-ttf=20120503-10 \
      libxss1=1:1.2.3-1 \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

ADD https://github.com/Yelp/dumb-init/releases/download/v1.2.1/dumb-init_1.2.1_amd64 /usr/local/bin/dumb-init
RUN chmod +x /usr/local/bin/dumb-init

WORKDIR /app

COPY --chown=1000:1000 src/ src/
COPY --chown=1000:1000 scripts/ scripts/
COPY --chown=1000:1000 package.json package.json
COPY --chown=1000:1000 yarn.lock yarn.lock
COPY --chown=1000:1000 .babelrc .babelrc

RUN yarn install && yarn cache clean

USER 1000

ENTRYPOINT ["dumb-init", "--"]
CMD ["yarn", "start-dev"]

################################################################################

FROM dev as prod

USER root

ENV BABEL_ENV=production
ENV NODE_ENV=production

RUN yarn build

USER 1000

CMD ["yarn", "start"]
