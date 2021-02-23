import fs from 'fs';
import path from 'path';
import importFresh from 'import-fresh';
import stripComments from 'strip-json-comments';
import yaml from 'js-yaml';

/*
 * @description 保证文件一定存在，文件不存在则创建文件
 * @param filePath 文件路径
 * */
export function fileExit(filePath: string) {
  try {
    fs.readFileSync(filePath, 'utf-8');
  } catch (_) {
    fs.appendFileSync(filePath, '', 'utf-8');
  }
}

export class Config {
  static loadConfigFile(filePath: string) {
    switch (path.extname(filePath)) {
      case '.js':
        return Config.loadJSConfigFile(filePath);

      case '.json':
        if (path.basename(filePath) === 'package.json') {
          return Config.loadPackageJSONConfigFile(filePath);
        }
        return Config.loadJSONConfigFile(filePath);

      case '.yaml':
      case '.yml':
        return Config.loadYAMLConfigFile(filePath);

      default:
        return Config.loadLegacyConfigFile(filePath);
    }
  }

  static loadJSConfigFile(filePath: string) {
    try {
      return importFresh(filePath);
    } catch (e) {
      e.message = `Cannot read config file: ${filePath}\nError: ${e.message}`;
      throw e;
    }
  }

  static loadPackageJSONConfigFile(filePath: string) {
    try {
      return Config.loadJSONConfigFile(filePath);;
    } catch (e) {
      e.message = `Cannot read config file: ${filePath}\nError: ${e.message}`;
      throw e;
    }
  }

  static loadJSONConfigFile(filePath: string) {
    try {
      return JSON.parse(stripComments(Config.readFile(filePath)));
    } catch (e) {
      e.message = `Cannot read config file: ${filePath}\nError: ${e.message}`;
      e.messageTemplate = 'failed-to-read-json';
      e.messageData = {
        path: filePath,
        message: e.message
      };
      throw e;
    }
  }

  static readFile(filePath: string) {
    return fs.readFileSync(filePath, 'utf8').replace(/^\ufeff/u, '');
  }

  static loadYAMLConfigFile(filePath: string) {
    try {
      return yaml.safeLoad(Config.readFile(filePath)) || {};
    } catch (e) {
      e.message = `Cannot read config file: ${filePath}\nError: ${e.message}`;
      throw e;
    }
  }

  static loadLegacyConfigFile(filePath: string) {
    try {
      return yaml.safeLoad(stripComments(this.readFile(filePath))) || {};
    } catch (e) {
      e.message = `Cannot read config file: ${filePath}\nError: ${e.message}`;
      throw e;
    }
  }
}