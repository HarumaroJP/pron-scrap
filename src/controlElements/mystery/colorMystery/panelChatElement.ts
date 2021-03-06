import * as PIXI from 'pixi.js'
import { AssetLoader } from '../../../core/assetLoader'
import { PIXIUtils } from '../../../extensions/utils'
import { SpriteChatElement } from '../../applications/chat/chatElement/spriteChatElement'

type InteractType = 'lever' | 'button' | 'lamp'

export class PanelChatElement extends SpriteChatElement {
  btnSize: number = 27
  leverSize: number = 30
  lampSize: number = 10

  interacts: Interact[] = []

  constructor(target: number, panelInfo: boolean[]) {
    super(target, AssetLoader.getTexture('lever-background'), 160)

    this.sprite.interactive = false
    this.sprite.buttonMode = false

    this.interacts.push(
      new Interact(200, 25, 0, AssetLoader.getTexture('lamp-off'), AssetLoader.getTexture('lamp-on'), 'lamp')
    )

    this.interacts.push(
      new Interact(
        200,
        45,
        0,
        AssetLoader.getTexture('button-red-off'),
        AssetLoader.getTexture('button-red-on'),
        'button'
      )
    )

    this.interacts.push(
      new Interact(200, 74, 0, AssetLoader.getTexture('lamp-off'), AssetLoader.getTexture('lamp-on'), 'lamp')
    )

    this.interacts.push(
      new Interact(
        200,
        94,
        0,
        AssetLoader.getTexture('button-blue-off'),
        AssetLoader.getTexture('button-blue-on'),
        'button'
      )
    )

    this.interacts.push(
      new Interact(200, 123, 0, AssetLoader.getTexture('lamp-off'), AssetLoader.getTexture('lamp-on'), 'lamp')
    )

    this.interacts.push(
      new Interact(
        200,
        144,
        0,
        AssetLoader.getTexture('button-green-off'),
        AssetLoader.getTexture('button-green-on'),
        'button'
      )
    )

    this.interacts.push(
      new Interact(
        60,
        45,
        40,
        AssetLoader.getTexture('lever-purple-off'),
        AssetLoader.getTexture('lever-purple-on'),
        'lever'
      )
    )

    this.interacts.push(
      new Interact(
        60,
        120,
        40,
        AssetLoader.getTexture('lever-cyan-off'),
        AssetLoader.getTexture('lever-cyan-on'),
        'lever'
      )
    )

    this.interacts.push(
      new Interact(
        120,
        85,
        40,
        AssetLoader.getTexture('lever-white-off'),
        AssetLoader.getTexture('lever-white-on'),
        'lever'
      )
    )

    for (let i = 0; i < panelInfo.length; i++) {
      const interact = this.interacts[i]
      const isActive = panelInfo[i]

      let maxHeight: number

      switch (interact.type) {
        case 'button':
          maxHeight = this.btnSize
          break
        case 'lever':
          maxHeight = this.leverSize
          break
        case 'lamp':
          maxHeight = this.lampSize
          break

        default:
          break
      }

      PIXIUtils.resizeSpriteByHeight(interact, maxHeight)
      interact.set(isActive)
    }

    this.interacts.forEach((interact) => interact.anchor.set(0.5))

    this.interacts.forEach((interact) => this.addChild(interact))
  }
}

class Interact extends PIXI.Sprite {
  enabled: boolean = false

  type: InteractType
  tex_on: PIXI.Texture
  tex_off: PIXI.Texture

  overrideSize: number

  constructor(
    x: number,
    y: number,
    overrideSize: number,
    tex_off: PIXI.Texture,
    tex_on: PIXI.Texture,
    type: InteractType
  ) {
    super(tex_off)

    this.x = x
    this.y = y
    this.overrideSize = overrideSize

    this.type = type

    this.tex_on = tex_on
    this.tex_off = tex_off
  }

  set(isActive: boolean) {
    this.enabled = isActive
    this.texture = isActive ? this.tex_on : this.tex_off

    if (isActive && this.overrideSize != 0) {
      this.width = this.tex_on.width
      this.height = this.tex_on.height

      PIXIUtils.resizeSpriteByHeight(this, this.overrideSize)
    }
  }

  switch() {
    this.enabled = !this.enabled
    this.texture = this.enabled ? this.tex_on : this.tex_off
  }
}
