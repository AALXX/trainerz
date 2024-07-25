package util

import "log"

func InitLogger() {
    log.SetPrefix("[CHAT-SERVER] ")
    log.SetFlags(log.LstdFlags | log.Lshortfile)
}