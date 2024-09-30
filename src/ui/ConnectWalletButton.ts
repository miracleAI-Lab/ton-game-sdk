import {ConnectWalletButtonConfig, HandleError, Locale, Locales, Styles, Wallet, WalletApp} from '../types';
import { DropdownMenu, DropdownMenuItem } from './dropdown';
import {
  buttonDesign,
  locales,
  DARK_COPY,
  DARK_DISCONNECT,
  LIGHT_COPY,
  LIGHT_DISCONNECT
} from '../common/consts';
import Utils from '../utils';
import { loadIcons } from '../common/icons';
import { BaseScene, TonConnectUI } from "../game";
import { Container } from './Container';

export class ConnectWalletButton extends Container {
  buttonContainer: Container;
  buttonBackground: Phaser.GameObjects.RenderTexture;
  buttonText: Phaser.GameObjects.Text;
  buttonIcon?: Phaser.GameObjects.Image;
  buttonWidth: number;
  buttonHeight: number;
  wallet: Wallet | null = null;
  connector: TonConnectUI;
  // params: ConnectWalletButtonParams;
  connectionSourceName: WalletApp;
  unsubscribeFromConnector: () => void;
  dropdownMenu?: DropdownMenu;
  locale: Locale;
  currentIcon: string;
  changeIconTimer: NodeJS.Timeout | number | null = null;
  private onError: HandleError;
  private _config: ConnectWalletButtonConfig;

  constructor(scene: BaseScene, config: ConnectWalletButtonConfig) {
    super(scene, config, 'ConnectButton');
    this._config = config;

    this.connectionSourceName = config.walletApp || 'telegram-wallet';
    this.connector = new TonConnectUI({
      manifestUrl: 'https://raw.githubusercontent.com/ton-defi-org/tonconnect-manifest-temp/main/tonconnect-manifest.json',
      uiPreferences: {
        borderRadius: 's'
      }
    });

    this.onError = config.onError
      ? config.onError
      : (error) => {
        throw error;
      };
    
    this.buttonContainer = new Container(scene, {});
    this.loadAssets(scene);

    const locale = locales[config.language ?? 'en'];
    this.locale = locale;
    const styleSchema = config.style === 'dark' ? buttonDesign.dark : buttonDesign.light;
    const backgroundColor =
      config.style === 'dark'
        ? Utils.hexToNumber(styleSchema.backgroundColor)
        : Utils.hexToNumber(styleSchema.backgroundColor);

    const textObject = scene.add.text(
      buttonDesign.horizontalPadding + buttonDesign.icon.width,
      buttonDesign.verticalPadding,
      locale.connectWallet,
      {
        color: styleSchema.fontColor,
        fontFamily: buttonDesign.fontFamily,
        fontSize: buttonDesign.fontSize
      }
    );
    textObject.setOrigin(0);
    this.buttonText = textObject;

    const textWidth = textObject.width;
    const textHeight = textObject.height;
    const buttonWidth =
      textWidth +
      buttonDesign.horizontalPadding * 2 +
      buttonDesign.icon.width +
      buttonDesign.icon.horizontalPadding;
    const buttonHeight = textHeight + buttonDesign.verticalPadding * 2;

    this.buttonWidth = buttonWidth;
    this.buttonHeight = buttonHeight;

    this.currentIcon = styleSchema.icons.diamond;

    const button = scene.add.graphics({
      x: 0,
      y: 0,
      fillStyle: {
        color: this.wallet == null ? Utils.hexToNumber(styleSchema.backgroundColor) : backgroundColor
      },
      lineStyle: { width: buttonDesign.borderWidth, color: Utils.hexToNumber(styleSchema.borderColor) }
    });
    button.fillRoundedRect(0, 0, buttonWidth, buttonHeight, buttonDesign.borderRadius);
    button.strokeRoundedRect(0, 0, buttonWidth, buttonHeight, buttonDesign.borderRadius);
    const buttonRt = scene.add.renderTexture(0, 0, buttonWidth, buttonHeight);
    buttonRt.draw(button);
    buttonRt.setOrigin(0);
    button.removeAllListeners();
    button.destroy();

    this.buttonBackground = buttonRt;
    this.buttonContainer.RefreshBounds();
    this.buttonContainer.setEventInteractive();
    this.enable();

    const walletChanged = (wallet: Wallet | null) => {
      this.wallet = wallet;
      if (wallet) {
        textObject.setText(Utils.rawAddressToFriendly(wallet.account.address, true));
        this.setSchema(styleSchema);
      } else {
        textObject.setText(locale.connectWallet);
        this.setSchema(buttonDesign.default);
      }

      if (config.onWalletChange) {
        config.onWalletChange(wallet);
      }
    };
  
    this.unsubscribeFromConnector = this.connector.onStatusChange(walletChanged);
    this.connector.connectionRestored.then((connected) => {
      if (!connected) {
        walletChanged(null);
      }

      this.enable();
    });
  }

  private async loadAssets(scene: Phaser.Scene): Promise<void> {
    await loadIcons(scene.textures);

    const icon = scene.add.image(0, 0, this.currentIcon);
    this.buttonIcon = icon;
    this.buttonIcon.setOrigin(0);
    this.buttonIcon.setPosition(
      buttonDesign.horizontalPadding - buttonDesign.icon.horizontalPadding,
      this.buttonHeight * 0.5 - icon.displayHeight * 0.5);

    // buttonDesign.horizontalPadding -
    // buttonDesign.icon.horizontalPadding +
    // buttonDesign.icon.width * 0.5,
    // this.buttonHeight * 0.5,

    this.dropdownMenu = new DropdownMenu(
      scene,
      0,
      this.buttonHeight + buttonDesign.dropDown.topMargin,
      {
        style: this._config.style ?? 'light',
        items: [
          {
            icon: this._config.style === 'dark' ? DARK_COPY : LIGHT_COPY,
            text: this.locale.copyAddress,
            onClick: this.copyAddress
          },
          {
            icon: this._config.style === 'dark' ? DARK_DISCONNECT : LIGHT_DISCONNECT,
            text: this.locale.disconnectWallet,
            onClick: () => {
              this.toggleDropdownMenu();
              this.disconnectWallet();
            }
          }
        ]
      }
    );
    this.dropdownMenu.setVisible(false);

    this.buttonContainer.add([this.buttonBackground, this.buttonIcon, this.buttonText]);
    this.add([this.buttonContainer, this.dropdownMenu]);
    scene.add.existing(this);
  }

  private changeIcon(icon: string) {
    this.cancelIconChange();

    if (this.buttonIcon) {
      this.currentIcon = icon;
      this.buttonIcon.setTexture(icon);
    } else {
      this.changeIconTimer = setTimeout(() => {
        this.changeIcon(icon);
      }, 4);
    }
  }

  private cancelIconChange() {
    if (this.changeIconTimer != null) {
      clearTimeout(this.changeIconTimer);
      this.changeIconTimer = null;
    }
  }

  protected handleUp(): void {
    super.handleUp();
    Utils.smoothScale(this.scene.tweens, this, 1.02, 125);
    this.connectWallet();
  }

  protected handleDown(): void {
    super.handleDown();
    this.scene.game.canvas.style.cursor = 'pointer';
    Utils.smoothScale(this.scene.tweens, this, 0.98, 125);
  }

  protected handleOut(): void {
    super.handleOut();

    this.scene.game.canvas.style.cursor = 'default';
    const styleSchema = this._config.style === 'dark' ? buttonDesign.dark : buttonDesign.light;
    if (this.wallet != null) {
      this.repaintButtonBackground(styleSchema.backgroundColor, styleSchema.borderColor);
    }

    Utils.smoothScale(this.scene.tweens, this, 1, 125);
  }

  protected handleOver(): void {
    super.handleOver();

    this.scene.game.canvas.style.cursor = 'pointer';
    const styleSchema = this._config.style === 'dark' ? buttonDesign.dark : buttonDesign.light;
    if (this.wallet != null) {
      this.repaintButtonBackground(styleSchema.backgroundColorHover, styleSchema.borderColor);
    }

    Utils.smoothScale(this.scene.tweens, this, 1.02, 125);
  }

  connectWallet = async () => {
    try {
      this.disable();
      if (this.connector.connected) {
        await this.disconnectWallet();
      }
      await this.connector.openModal();
    } catch (error: any) {
      console.log("connectWallet error", error);
      this.onError(error);
    } finally {
      this.enable();
    }
  }

  disconnectWallet = async () => {
    try {
      this.disable();
      await this.connector.disconnect();
    } catch (error: any) {
      console.log("disconnect error", error);
      this.onError(error);
    } finally {
      this.enable();
    }
  }

  private copyAddress = async (item: DropdownMenuItem) => {
    if (this.wallet == null) {
      return;
    }

    try {
      await navigator.clipboard.writeText(Utils.rawAddressToFriendly(this.wallet.account.address));
      const oldText = item.text.text;
      item.text.setText(this.locale.addressCopied);
      setTimeout(() => {
        try {
          item.text.setText(oldText);
        } catch (error) {
          // ignore in case the object was destroyed by leaving the scene
        }
      }, 500);
    } catch (error) {
      this.onError(error);
    }
  };

  private disable() {
    this.buttonContainer.setInteractive(false);
  }

  private enable() {
    this.buttonContainer.setInteractive(
      new Phaser.Geom.Rectangle(0, 0, this.buttonWidth, this.buttonHeight),
      Phaser.Geom.Rectangle.Contains
    );
  }

  private toggleDropdownMenu = () => {
    if (this.dropdownMenu == null) {
      return;
    }

    this.dropdownMenu.setVisible(!this.dropdownMenu.visible);
  };

  private setSchema(schema: typeof buttonDesign.dark) {
    this.repaintButtonBackground(schema.backgroundColor, schema.borderColor);
    this.changeIcon(schema.icons.diamond);
    this.buttonText.setColor(schema.fontColor);
  }

  private repaintButtonBackground(backgroundColor: string, borderColor: string) {
    this.buttonBackground.clear();
    const background = this.scene.add.graphics();
    background.fillStyle(Utils.hexToNumber(backgroundColor));
    background.lineStyle(buttonDesign.borderWidth, Utils.hexToNumber(borderColor));
    background.fillRoundedRect(
      0,
      0,
      this.buttonWidth,
      this.buttonHeight,
      buttonDesign.borderRadius
    );
    background.strokeRoundedRect(
      0,
      0,
      this.buttonWidth,
      this.buttonHeight,
      buttonDesign.borderRadius
    );

    this.buttonBackground.clear();
    this.buttonBackground.draw(background);
    this.buttonBackground.setOrigin(0);
    background.removeAllListeners();
    background.destroy();
  }

  public override destroy() {
    this.unsubscribeFromConnector();
    this.cancelIconChange();
    this.buttonContainer.removeAllListeners();
    this.buttonContainer.destroy();
    super.destroy();
  }
}
