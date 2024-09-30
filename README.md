## ton-game-sdk - Phaser 3 UI Components Library and utilities

ton-game-sdk is a UI component library and utilities for the TON blockchain bindings in the Phaser game engine.

## Key Features

- **Phaser 3 Compatibility**: Fully compatible with Phaser 3.8+.
- **Customizable Components**: Out-of-the-box UI components such as buttons, sliders, checkboxes, dialogs, and more.
- **TypeScript Support**: TypeScript types for a better development experience.
- **Flexible Event Handling**: Easy-to-use event handlers for interactions like clicks, hovers, and value changes.
- **Responsive Design**: Adaptable UI elements that work across different screen sizes and game layouts.

## Supported Components

- ✅ Checkbox
- ✅ CheckboxGroup
- ✅ Container
- ✅ Dialog
- ✅ Grid
- ✅ LinearLayout
- ✅ Image
- ✅ ImageButton
- ✅ Label
- ✅ ProgressBar
- ✅ RoundedButton
- ✅ Slider
- ✅ Tabs
- ✅ Text
- ✅ TextBox
- ✅ TextButton
- ✅ Toast
- ✅ VolumeSlider
- ✅ Sprite

## Installation

Install **ton-game-sdk** via npm or yarn:

```bash
npm install ton-game-sdk
# or
yarn add ton-game-sdk
```

## Usage Example

Here’s a quick example of how to create different types of buttons using the **ton-game-sdk** library:

```typescript
import { BaseScene, Mai3Game } from "ton-game-sdk";

export class ButtonDemo extends BaseScene {
  constructor() {
    super('ButtonDemo');
  }
  
  preload() {
    super.preload();
  }

  create() {
    this.mai3.add.imageButton({
        x: 10,
        y: 160,
        width: 160,
        height: 60,
        texture: "StartGameButton",
        borderWidth: 3,
        handleHover: {
          audio: "sfx-hover",
          texture: "StartGameButtonHover",
        },
        handleOut: {
          texture: "StartGameButton",
        },
        handleDown: {
          audio: "sfx-press",
          texture: "StartGameButtonDown",
          handleFn: () => {
            console.log("Button pressed");
          }
        },
        handleUp: {
          texture: "StartGameButton",
          handleFn: () => {
            console.log("Button released");
          }
        },
    });
  }
}

const config = getGameConfig();
const game = Mai3Game.Init(config);
game.scene.add('ButtonDemo', ButtonDemo, true);
```

## GameFi SDK for TON Blockchain Integration

The **GameFi SDK** provides bindings and utilities to integrate **TON blockchain** functionalities into game engines like Phaser, Cocos, and vanilla JavaScript. This allows developers to easily add blockchain-based features like wallet connection, in-game purchases, NFT interactions, and more to their games.

### Connecting Wallet

```typescript
import { BaseScene, Mai3Game } from "ton-game-sdk";

export class ButtonDemo extends BaseScene {
  constructor() {
    super('ButtonDemo');
  }
  
  preload() {
    super.preload();
  }

  create() {
    this.mai3.add.connectWalletButton({
      x: 200,
      y: 200,
      width: 160,
      height: 60,
      style: 'dark',
      language: 'en',
      walletApp: 'telegram-wallet',
      onWalletChange: (wallet: Wallet | null) => {
        console.log('wallet address: ', wallet?.account.address);
      }
    });
  }
}

const config = getGameConfig();
const game = Mai3Game.Init(config);
game.scene.add('ButtonDemo', ButtonDemo, true);

```

This can be used to:
- Watch the wallet state and reflect it on the game UI.
- Restore connection with a previously connected wallet after app reload.

### GameFi Methods & Props

#### GameFi Static Methods

| Method     | Description                    |
|------------|--------------------------------|
| `create`   | Creates a GameFi instance      |

#### GameFi Instance Methods

| Method                    | Description                                          |
|---------------------------|------------------------------------------------------|
| `createConnectButton`      | Creates a button to connect a wallet.                |
| `connectWallet`            | Connect wallet manually (without built-in UIs).      |
| `onWalletChange`           | Watch whether a wallet was connected or disconnected.|
| `disconnectWallet`         | Disconnect wallet manually.                          |
| `buyWithTon`               | Buy from in-game shop with TON.                      |
| `buyWithJetton`            | Buy from in-game shop with Jetton.                   |
| `transferTon`              | Transfer TON to another wallet.                      |
| `transferJetton`           | Transfer Jetton to another wallet.                   |
| `openNftCollection`        | Open an NFT collection contract.                     |
| `openNftSale`              | Open an NFT sale contract.                           |
| `openNftItem`              | Open an NFT item contract.                           |
| `openNftItemByIndex`       | Open an NFT item contract using its index.           |
| `openSbtCollection`        | Open an SBT collection contract.                     |
| `openJetton`               | Open a Jetton contract.                              |
| `openJettonWallet`         | Open a Jetton wallet contract.                       |

#### GameFi Instance Properties

| Property                  | Description                                        |
|---------------------------|----------------------------------------------------|
| `assetsSdk`                | Asset-sdk instance for direct use if needed.       |
| `walletConnector`          | Wallet connector instance for direct use.          |
| `wallet`                   | User's connected wallet.                           |
| `walletAccount`            | User's connected account.                          |
| `walletAddress`            | User's connected wallet address.                   |
| `merchantAddress`          | In-game shop's address to receive TON.             |
| `merchantJettonAddress`    | In-game shop's Jetton used as in-game currency.    |


## Contribution

We welcome contributions! If you’d like to help improve **mai3-phaser-ui**, feel free to submit issues or pull requests on our [GitHub repository](https://github.com/miracleAI-Lab/mai3-phaser-ui).

## License

This project is licensed under the MIT License. For details, check the [LICENSE](https://github.com/miracleAI-Lab/mai3-phaser-ui/blob/main/LICENSE) file.