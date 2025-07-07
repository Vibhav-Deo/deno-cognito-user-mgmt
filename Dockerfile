FROM denoland/deno:alpine-1.44.1

WORKDIR /app

COPY . .

EXPOSE 8000

CMD ["run", "--allow-net", "--allow-read", "main.ts"]
