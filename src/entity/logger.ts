import { configure, getLogger } from 'log4js';
import path from 'path';

configure(path.resolve(__dirname, '../../', 'config', 'log4js.json'));

export default getLogger;
