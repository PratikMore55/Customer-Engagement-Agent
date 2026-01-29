// Simple logger utility for better console output

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  
  // Foreground colors
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

class Logger {
  info(message, ...args) {
    console.log(`${colors.blue}ℹ️  ${message}${colors.reset}`, ...args);
  }

  success(message, ...args) {
    console.log(`${colors.green}✅ ${message}${colors.reset}`, ...args);
  }

  error(message, ...args) {
    console.error(`${colors.red}❌ ${message}${colors.reset}`, ...args);
  }

  warn(message, ...args) {
    console.warn(`${colors.yellow}⚠️  ${message}${colors.reset}`, ...args);
  }

  debug(message, ...args) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`${colors.magenta}🔍 ${message}${colors.reset}`, ...args);
    }
  }

  ai(message, ...args) {
    console.log(`${colors.cyan}🤖 ${message}${colors.reset}`, ...args);
  }

  email(message, ...args) {
    console.log(`${colors.magenta}📧 ${message}${colors.reset}`, ...args);
  }

  processing(message, ...args) {
    console.log(`${colors.yellow}⚙️  ${message}${colors.reset}`, ...args);
  }
}

export default new Logger();