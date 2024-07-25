package routes

import (
    "net/http"

    "github.com/zishang520/socket.io/v2/socket"
    "chat-server/services"
)

func SetupSocketRoute(io *socket.Server) {
    // Handler for socket.io events
    io.On("connection", services.SocketConnectionHandler)

    // Serve socket.io at /socket.io/
    http.Handle("/socket.io/", io.ServeHandler(nil))
}