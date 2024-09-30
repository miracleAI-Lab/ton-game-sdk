import { BaseScene } from "../game";
import { SpriteConfig } from '../types';
import Utils from "../utils";
import { BaseButton } from "./BaseButton";

export class Sprite extends BaseButton {
  private _config: SpriteConfig;
  public instance?: Phaser.GameObjects.Sprite;

  constructor(scene: BaseScene, config: SpriteConfig) {
    super(scene, config, "Sprite");
    this._config = config;

    this.reDraw(config);
    this.setEventInteractive();
  }

  reDraw(config: SpriteConfig) {
    this._config = config;
    this._config.width = config.width ?? 0;
    this._config.height = config.height ?? 0;
    const texture = (this._config.key ?? "") as string;

    if (!this.instance) this.instance = this.scene.make.sprite(this._config);

    this.instance?.setPosition(0, 0);
    this.instance?.setTexture(texture, this._config.frame);
    this.instance?.setDisplaySize(this._config.width, this._config.height);
    this.instance?.setOrigin(0);
    this.addChild(this.instance!);

    this.RefreshBounds();
  }

  public createAnimsSprite(animKey: string, config: SpriteAnimConfig) {
    if (Array.isArray(config.frames)) {
      this.scene.anims.create({
        key: animKey,
        frames: this.scene.anims.generateFrameNumbers(config.key, {
          frames: config.frames,
        }),
        frameRate: config.frameRate,
        repeat: config.repeat,
      });
    } else if (Array.isArray(config.keys)) {
      this.scene.anims.create({
        key: animKey,
        frames: config.keys.map((key) => ({ key })),
        frameRate: config.frameRate,
        repeat: config.repeat,
      });
    }
  }

  public play(
    key:
      | string
      | Phaser.Animations.Animation
      | Phaser.Types.Animations.PlayAnimationConfig,
    ignoreIfPlaying?: boolean
  ) {
    this.instance?.play(key, ignoreIfPlaying);
  }
  get config(): SpriteConfig {
    return this._config!;
  }

  destroy(fromScene?: boolean) {
    if (this.instance) {
      this.instance.destroy();
      this.instance = undefined;
    }
    super.destroy(fromScene);
  }
}

interface SpriteAnimConfig {
  key: string;
  frames?: number[];
  keys?: string[];
  frameRate: number;
  repeat: number;
}
