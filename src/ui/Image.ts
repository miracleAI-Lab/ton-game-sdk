import { Container } from ".";
import { BaseScene } from "../game";
import { ImageConfig } from "../types";
import Utils from "../utils";

export class Image extends Container {
  private _config: ImageConfig;
  protected image?: Phaser.GameObjects.Image;
  protected maskShape?: Phaser.GameObjects.Graphics;

  constructor(scene: BaseScene, config: ImageConfig) {
    super(scene, config);
    this._config = config;
    this.Type = "Image";
    this.reDraw(this._config);
  }

  reDraw(config: ImageConfig): void {
    this._config = config;
    this.clear();

    const width = config.width ?? 0;
    const height = config.height ?? 0;
    const borderWidth = config.borderWidth ?? 0;
    const radius = config.radius ?? 0;
    const isCircle = config.isCircle ?? false;

    if (!this.maskShape) this.maskShape = this.scene.add.graphics();
    if (!this.image) this.image = this.scene.make.image({});

    if (isCircle) {
      const btnRadius = Math.min(width, height) / 2;
      this.reDrawImage(config.key!, borderWidth, borderWidth, btnRadius * 2 - borderWidth * 2, btnRadius * 2 - borderWidth * 2);
      this.reDrawMaskShape(btnRadius - borderWidth, 0xffffff, true);
    } else {
      this.reDrawImage(config.key!, 0, 0, width, height);
      if (radius > 0) {
        this.reDrawMaskShape(radius, 0xffffff, false);
      } else {
        this.image.clearMask();
      }
    }
    
    this.RefreshBounds();
    this.updateMaskShapePos();
  }

  private reDrawImage(textureKey: string, x: number, y: number, w: number, h: number) {
    this.image?.setTexture(textureKey);
    this.image?.setPosition(x, y);
    this.image?.setDisplaySize(w, h);
    this.image?.setOrigin(0);
    this.addChildAt(this.image!, 0);
  }

  private reDrawMaskShape(radius: number, fillColor: number, isCircle: boolean) {
    this.maskShape!.clear();
    this.maskShape!.fillStyle(fillColor);
    
    if (isCircle) {
      this.maskShape!.fillCircle(0, 0, radius);
    } else {
      const width = this._config.width ?? 0;
      const height = this._config.height ?? 0;
      this.maskShape!.fillRoundedRect(0, 0, width, height, radius);
    }
    
    let mask = this.maskShape!.createGeometryMask();
    this.maskShape!.setVisible(false);
    this.image!.setMask(mask);
    this.addChildAt(this.maskShape!, 1);
  }

  public updateMaskShapePos() {
    const isCircle = this._config.isCircle ?? false;
    // const borderWidth = this._config.borderWidth ?? 0;
    let imageLeftTopPos = Utils.getWorldPosition(this.image!);
    
    if (isCircle) {
      const radius = Math.min(this._config.width ?? 0, this._config.height ?? 0) / 2;
      this.maskShape!.setPosition(imageLeftTopPos.x + radius, imageLeftTopPos.y + radius);
    } else {
      this.maskShape!.setPosition(imageLeftTopPos.x, imageLeftTopPos.y);
    }
  }

  private clear(): void {
    if (this.image) {
      this.image.destroy();
      this.image = undefined;
    }
    if (this.maskShape) {
      this.maskShape.destroy();
      this.maskShape = undefined;
    }
  }

  get config(): ImageConfig {
    return this._config!;
  }

  destroy(fromScene?: boolean): void {
    this.clear();
    super.destroy(fromScene);
  }
}
