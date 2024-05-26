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

# Build the Go app
RUN go build -o main .

# Expose port 7300
EXPOSE 7300

ENV MYSQL_HOST=trainerz-db-server.clucio0esuhj.us-east-1.rds.amazonaws.com
ENV MYSQL_PORT=3308
ENV MYSQL_USER=alxAdmin
ENV MYSQL_PASS=Alexecelmaitarefemeilemoare2


# Command to run the executable
CMD ["./main"]
