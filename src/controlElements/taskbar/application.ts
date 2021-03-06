import * as PIXI from 'pixi.js'
import { gsap } from 'gsap'
import { Window } from '../../core/window'

export class Application extends PIXI.Sprite {
  appName: string = 'noname'
  window: Window

  spriteSize: number

  constructor(appName: string, appSize: number, icon: PIXI.Texture, window: Window) {
    super(icon)

    this.window = window

    this.appName = appName
    this.spriteSize = appSize
    this.interactive = true
    this.buttonMode = true

    this.anchor.set(0.5)

    this.setAnimations()

    this.reflesh()
  }

  scaleTween: gsap.core.Tween
  setAnimations() {
    this.scaleTween = gsap.to(this, {
      duration: 0.2,
      width: this.spriteSize + 15,
      height: this.spriteSize + 15,
      paused: true,
    })

    this.on('pointerover', this.onMouseEnter).on('pointerout', this.onMouseExit)
  }

  onMouseEnter() {
    this.scaleTween.play()
  }

  onMouseExit() {
    this.scaleTween.reverse()
  }

  reflesh() {
    this.width = this.spriteSize
    this.height = this.spriteSize
  }
}
