// https://betterstack.com/community/guides/logging/how-to-install-setup-and-use-winston-and-morgan-to-log-node-js-applications/
import { config, createLogger, format, transports } from 'winston';
const { combine, timestamp, splat, colorize, json, printf, errors } = format;

const payloadFormat = printf(({ timestamp, level, message, stack, ...meta }) => {
  const payload = Object.keys(meta).length ? JSON.stringify(meta, null, 0) : '';
  return `${timestamp} [${level.toUpperCase()}]: ${stack || message} ${payload}`;
});

const logger = createLogger({
  levels: config.syslog.levels,
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp(),
    splat(),
    payloadFormat,
    errors({ stack: true })
  ),
  transports: [
    new transports.Console({ format: colorize({ all: true }) }),
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.File({ filename: 'logs/notice.log', level: 'notice' }),
    new transports.File({ filename: 'logs/warning.log', level: 'warning' }),
    new transports.File({ filename: 'logs/debug.log', level: 'debug' }),
    new transports.File({ filename: 'logs/combined.log' }),
  ],
  exitOnError: false,
});

export default logger;
