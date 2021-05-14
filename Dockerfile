FROM node:14.4.0-slim as dev

# Install latest chrome dev package and fonts to support major charsets (Chinese, Japanese, Arabic, Hebrew, Thai and a few others)
# Note: this installs the necessary libs to make the bundled version of Chromium that Puppeteer
# installs, work.
RUN apt-get update \
    && apt-get install -y wget gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y \
      google-chrome-stable=90.0.4430.212-1 \
      fonts-ipafont-gothic=00303-16 \
      fonts-wqy-zenhei=0.9.45-6 \
      fonts-thai-tlwg=1:0.6.3-1 \
      fonts-kacst=2.01+mry-12 \
      fonts-freefont-ttf=20120503-6 \
      libxss1=1:1.2.2-1 \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

ADD https://github.com/Yelp/dumb-init/releases/download/v1.2.1/dumb-init_1.2.1_amd64 /usr/local/bin/dumb-init
RUN chmod +x /usr/local/bin/dumb-init

WORKDIR /app

COPY --chown=1000:1000 src/ src/
COPY --chown=1000:1000 package.json package.json
COPY --chown=1000:1000 yarn.lock yarn.lock
COPY --chown=1000:1000 .babelrc .babelrc

RUN yarn install

# Run everything after as non-privileged user.
RUN groupadd -r pptruser && useradd -r -g pptruser -G audio,video pptruser \
    && mkdir -p /home/pptruser/Downloads \
    && chown -R pptruser:pptruser /home/pptruser
USER pptruser

ENTRYPOINT ["dumb-init", "--"]
CMD ["yarn", "start-dev"]

################################################################################

FROM dev as prod

USER root

ENV BABEL_ENV=production
ENV NODE_ENV=production

RUN yarn build

USER pptruser

CMD ["yarn", "start"]
