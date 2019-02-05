import { Bot } from '../bot';
import { ConnectorOptions } from '../interfaces';
declare function run(bot: Bot, options: ConnectorOptions): Promise<void>;
export { run as connectorTask };
