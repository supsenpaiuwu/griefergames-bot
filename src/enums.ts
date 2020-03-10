enum ChatMode {
  NORMAL,
  SLOW,
}

enum ConnectionStatus {
  NOT_STARTED = 'NOT_STARTED',
  LOGGING_IN = 'LOGGING_IN',
  LOGGED_IN = 'LOGGED_IN',
  DISCONNECTED = 'DISCONNECTED',
  RESTARTING = 'RESTARTING',
}


enum RedstoneMode {
  ON = 'ON',
  OFF = 'OFF',
}

export {
  ChatMode,
  ConnectionStatus,
  RedstoneMode
};
