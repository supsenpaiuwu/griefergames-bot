"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ChatMode;
(function (ChatMode) {
    ChatMode[ChatMode["NORMAL"] = 0] = "NORMAL";
    ChatMode[ChatMode["SLOW"] = 1] = "SLOW";
})(ChatMode || (ChatMode = {}));
exports.ChatMode = ChatMode;
var ConnectionStatus;
(function (ConnectionStatus) {
    ConnectionStatus["NOT_STARTED"] = "NOT_STARTED";
    ConnectionStatus["LOGGING_IN"] = "LOGGING_IN";
    ConnectionStatus["LOGGED_IN"] = "LOGGED_IN";
    ConnectionStatus["DISCONNECTED"] = "DISCONNECTED";
    ConnectionStatus["RESTARTING"] = "RESTARTING";
})(ConnectionStatus || (ConnectionStatus = {}));
exports.ConnectionStatus = ConnectionStatus;
var RedstoneMode;
(function (RedstoneMode) {
    RedstoneMode["ON"] = "ON";
    RedstoneMode["OFF"] = "OFF";
})(RedstoneMode || (RedstoneMode = {}));
exports.RedstoneMode = RedstoneMode;
//# sourceMappingURL=enums.js.map