declare enum ChatMode {
    NORMAL = 0,
    SLOW = 1
}
declare enum ConnectionStatus {
    NOT_STARTED = "NOT_STARTED",
    LOGGING_IN = "LOGGING_IN",
    LOGGED_IN = "LOGGED_IN",
    DISCONNECTED = "DISCONNECTED",
    RESTARTING = "RESTARTING"
}
declare enum RedstoneMode {
    ON = "ON",
    OFF = "OFF"
}
export { ChatMode, ConnectionStatus, RedstoneMode };
