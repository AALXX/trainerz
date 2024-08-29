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

# Copy the .env file to the container
COPY .env .env

# Set environment variables from the .env file using a shell command
RUN export $(grep -v '^[[:space:]]*#' .env | grep -v '^[[:space:]]*$' | xargs)

# Build the Go app
RUN go build -o main .

# Expose port 7250
EXPOSE 7250

# Command to run the executable
CMD ["./main"]