FROM node:14-alpine3.14 as app

WORKDIR /usr/src/app
COPY package.json yarn.lock ./
RUN yarn install

COPY src/ src/
COPY tsconfig.json \
     serverless.yaml \
     ./

RUN mkdir .build
RUN mkdir buckets

EXPOSE 3000

CMD [ "yarn", "start", "--host", "0.0.0.0" ]
