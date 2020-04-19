import { statSync, writeFileSync, mkdirSync, readFileSync } from 'fs';
import { dirname, join } from 'path';
import * as yaml from 'yaml';
import * as log4js from 'log4js';

import { IAppConfig } from './IAppConfig';

export class AppConfig implements IAppConfig {
  public foldImage: boolean = true;
  public foldLink: boolean = true;
  public foldMath: boolean = true;
  public foldEmoji: boolean = true;
  public showLineNumber: boolean = false;
  private logger: log4js.Logger = log4js.getLogger('AppConfig');

  getConfigFilePath() {
    const homeDir = process.env['HOME'];
    if (!homeDir) {
      console.error('no HOME environmental variable exists');
      return null;
    }
    const configFilePath: string = join(homeDir, '.m/config.yaml');
    return configFilePath;
  }

  public updateFromDictionaryObject(newValue: IAppConfig) {
    this.foldImage = newValue.foldImage;
    this.foldLink = newValue.foldLink;
    this.foldMath = newValue.foldMath;
    this.foldEmoji = newValue.foldEmoji;
    this.showLineNumber = newValue.showLineNumber;
  }

  public toDictionaryObject() {
    return {
      foldImage: this.foldImage,
      foldLink: this.foldLink,
      foldMath: this.foldMath,
      foldEmoji: this.foldEmoji,
      showLineNumber: this.showLineNumber,
    };
  }

  private dumpToYaml() {
    return yaml.stringify(this.toDictionaryObject());
  }

  initializeAndReadConfig() {
    const configFilePath = this.getConfigFilePath();
    if (!configFilePath) {
      return;
    }
    try {
      statSync(configFilePath);
      this.readConfig(configFilePath);
    } catch (error) {
      // no config file exists
      this.initializeConfig(configFilePath);
    }
  }

  private readConfig(file: string) {
    this.logger.info(`read config from ${file}`);
    const configStringContent = readFileSync(file).toString('utf-8');
    const configContent = yaml.parse(configStringContent);
    this.updateFromDictionaryObject(configContent);
  }

  private initializeConfig(file: string) {
    const configDirectory = dirname(file);
    mkdirSync(configDirectory);
    const configYamlFileContent = this.dumpToYaml();
    writeFileSync(file, configYamlFileContent);
  }

  public save() {
    const configYamlFileContent = this.dumpToYaml();
    const configFilePath = this.getConfigFilePath();
    if (configFilePath) {
      writeFileSync(configFilePath, configYamlFileContent);
    }
  }
}
