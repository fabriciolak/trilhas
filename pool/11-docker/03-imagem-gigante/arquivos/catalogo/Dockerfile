FROM golang:1.27-alpine
WORKDIR /app
COPY . .
RUN go build -o catalogo .
EXPOSE 8080
CMD ["./catalogo"]
