FROM alpine:3.19

ARG PB_VERSION=0.39.8

RUN apk add --no-cache ca-certificates wget unzip \
    && wget -q "https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip" -O /tmp/pb.zip \
    && unzip /tmp/pb.zip -d /usr/local/bin \
    && rm /tmp/pb.zip \
    && chmod +x /usr/local/bin/pocketbase

RUN mkdir -p /pb/pb_data /pb/pb_hooks

EXPOSE 8090
WORKDIR /pb
CMD ["pocketbase", "serve", "--http=0.0.0.0:8090", "--dir=/pb/pb_data"]
