FROM node:12.14.1 as build

ARG COMMIT_HASH
ENV COMMIT_HASH=${COMMIT_HASH}
ARG TAG_NAME
ENV TAG_NAME=${TAG_NAME}

ARG DATE

WORKDIR ./src

COPY . .

WORKDIR ./frontend

RUN npm ci && npm run postinstall
RUN npm run build

RUN mkdir -p ./server/dist && \
    echo ${COMMIT_HASH} > ./server/dist/COMMIT_HASH && \
    echo ${DATE} > ./server/dist/BUILD_DATE && \
    echo ${TAG_NAME} > ./server/dist/TAG_NAME
#RUN pwd
#RUN ls
#RUN find / -name 2.7198cd4b.chunk.js
#WORKDIR ./src/build
#RUN ls
#
#WORKDIR ./frontend
# Generate the dependency licenses files (one for the UI and one for the webserver),
# concatenate them to one file under ./src/server
RUN npm i -D license-checker
#RUN node gen_licenses . && node gen_licenses server && \
#    cat dependency-licenses.txt >> server/dependency-licenses.txt

FROM node:12.14.1-alpine

COPY --from=build ./src/server /server
COPY --from=build ./src/build /client

WORKDIR /server

RUN ls

EXPOSE 3000
RUN npm run build
ENV API_SERVER_ADDRESS http://localhost:3001
CMD node dist/server.js ../client/ 3000
