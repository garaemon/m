import { statSync, writeFileSync, mkdirSync, readFileSync } from 'fs';
import { dirname, join } from 'path';
import * as yaml from 'yaml';

import { IAppConfig } from './IAppConfig';

export class AppConfig implements IAppConfig {
    public foldImage: boolean = true;
    public foldLink: boolean = true;
    public foldMath: boolean = true;
    public foldEmoji: boolean = true;

    getConfigFilePath() {
        const homeDir = process.env['HOME'];
        if (!homeDir) {
            console.error('no HOME environmental variable exists');
            return null;
        }
        const configFilePath: string = join(homeDir, '.m/config.yaml');
        return configFilePath;
    }

    private dumpToYaml() {
        return yaml.stringify({
            foldImage: this.foldImage,
            foldLink: this.foldLink,
            foldMath: this.foldMath,
            foldEmoji: this.foldEmoji,
        });
    }

    initializeAndReadConfig() {
        const configFilePath = this.getConfigFilePath();
        if (!configFilePath) {
            return;
        }
        try {
            statSync(configFilePath);
            this.readConfig(configFilePath);
        }
        catch (error) {
            // no config file exists
            this.initializeConfig(configFilePath);
        }
    }

    private readConfig(file: string) {
        const configStringContent = readFileSync(file).toString('utf-8');
        const configContent = yaml.parse(configStringContent);
        this.foldImage = configContent.foldImage;
    }

    private initializeConfig(file: string) {
        const configDirectory = dirname(file);
        mkdirSync(configDirectory);
        const configYamlFileContent = this.dumpToYaml();
        writeFileSync(file, configYamlFileContent);
    }

}
