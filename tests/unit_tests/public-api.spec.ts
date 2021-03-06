import { expect } from 'chai';
import { EventEmitter } from 'events';
import { basename, dirname, resolve } from 'path';
import { createApp, resolveConfig } from '@archetyped/index';
import Archetyped from '@archetyped/archetyped';
import { ArchetypedConfig } from '@archetyped/lib';

describe('Archetyped Public API', () => {
  describe('Create app', () => {
    let app: Archetyped | null;
    let appConfig: ArchetypedConfig;
    let basePath: string;

    before(() => {
      basePath = resolve(dirname(__dirname), 'build', 'demos', 'tests');
      appConfig = resolveConfig(
        [{ packagePath: './extensions/calculator' }, { packagePath: 'math' }],
        basePath
      );
      app = createApp(appConfig, () => {});
    });

    it('should create an instance of Archetyped', () => {
      expect(app).to.not.be.null;
      expect(app instanceof EventEmitter).to.be.true;
      expect(app instanceof Archetyped).to.be.true;
    });

    it('should create and sort extension configs', () => {
      expect(app!.extensions).to.be.not.empty;
      const [math, calculator] = app!.extensions;
      expect(basename(math.packagePath)).to.be.equal('math');
      expect(basename(calculator.packagePath)).to.be.equal('calculator');
    });
  });

  describe('Create app with custom manifest key', () => {
    let app: Archetyped | null;
    let appConfig: ArchetypedConfig;
    let basePath: string;

    before(() => {
      basePath = resolve(dirname(__dirname), 'build', 'demos', 'tests');
      appConfig = resolveConfig(
        [
          {
            packagePath: './extensions/calculator',
            key: 'custom.package.key',
          },
          { packagePath: 'math' },
        ],
        basePath
      );
      app = createApp(appConfig, () => {});
    });

    it('should create an instance of Archetyped', () => {
      expect(app).to.not.be.null;
      expect(app instanceof EventEmitter).to.be.true;
      expect(app instanceof Archetyped).to.be.true;
    });

    it('should create and sort extension configs', () => {
      expect(app!.extensions).to.be.not.empty;
      const [math, calculator] = app!.extensions;
      expect(basename(math.packagePath)).to.be.equal('math');
      expect(basename(calculator.packagePath)).to.be.equal('calculator');
    });
  });

  describe('Create app with ExtensionConfig as a string', () => {
    let app: Archetyped | null;
    let appConfig: ArchetypedConfig;
    let basePath: string;

    before(() => {
      basePath = resolve(dirname(__dirname), 'build', 'demos', 'tests');
      appConfig = resolveConfig(
        ['./extensions/calculator', { packagePath: 'math' }],
        basePath
      );
      app = createApp(appConfig, () => {});
    });

    it('should create an instance of Archetyped', () => {
      expect(app).to.not.be.null;
      expect(app instanceof EventEmitter).to.be.true;
      expect(app instanceof Archetyped).to.be.true;
    });

    it('should create and sort extension configs', () => {
      expect(app!.extensions).to.be.not.empty;
      const [math, calculator] = app!.extensions;
      expect(basename(math.packagePath)).to.be.equal('math');
      expect(basename(calculator.packagePath)).to.be.equal('calculator');
    });
  });
});
