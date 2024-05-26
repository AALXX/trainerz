# Start from the official Golang image
FROM golang:latest

# Set the Current Working Directory inside the container
WORKDIR /app

# Copy go.mod and go.sum files to the workspace
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy the source code from the current directory to the Working Directory inside the container
COPY . .

ENV MYSQL_HOST=mysql-container
ENV MYSQL_PORT=3306
ENV MYSQL_USER=root
ENV MYSQL_USER=root

# Build the Go app
RUN go build -o main .

# Expose port 5500
EXPOSE 5500

# Command to run the executable
CMD ["./main"]
