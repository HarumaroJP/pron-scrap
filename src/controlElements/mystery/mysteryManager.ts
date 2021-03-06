import * as PIXI from 'pixi.js'
import { AssetLoader } from '../../core/assetLoader'
import { CmdHandler } from '../../core/cmdHandler'
import { MainMystery } from './mainMystery'
import { Mystery } from './mystery'
import { ColorMystery as ColorMystery } from './colorMystery/colorMystery'
import { PanelChatElement } from './colorMystery/panelChatElement'
import { ChatScrollView } from '../applications/chat/chatScrollView'
import { SelectMenu } from '../applications/chat/selectMenu'
import { SpriteChatElement } from '../applications/chat/chatElement/spriteChatElement'
import { PuzzleMystery } from './puzzleMystery/puzzleMystery'
import { ChatElement } from '../applications/chat/chatElement/chatElement'
import { BombMystery } from './bombMystery/bombMystery'
import { BombChatElement } from './bombMystery/bombChatElement'
import { MathUtils } from '../../extensions/utils'
import { Taskbar } from '../taskbar/taskbar'
import { VideoPanel } from '../../core/videoPanel'
import { videoScene } from '../../core/main'

export class MysteryManager {
  currentMystery: Mystery
  mysteries: Mystery[] = []
  scrollView: ChatScrollView
  selectMenu: SelectMenu

  mainMys: MainMystery = new MainMystery(0, false)
  colorMys: ColorMystery = new ColorMystery(1, true)
  puzzleMys: PuzzleMystery = new PuzzleMystery(2, false)
  bombMys: BombMystery = new BombMystery(3, true)

  constructor(scrollView: ChatScrollView, selectMenu: SelectMenu, taskBar: Taskbar) {
    this.scrollView = scrollView
    this.selectMenu = selectMenu

    this.mysteries.push(this.mainMys)
    this.mysteries.push(this.colorMys)
    this.mysteries.push(this.puzzleMys)
    this.mysteries.push(this.bombMys)
    this.mysteries.forEach((mys) => {
      mys.scrollView = scrollView
      mys.selectMenu = selectMenu
      mys.chatInterval = +AssetLoader.getConfigByKey('chat_Interval')
    })

    CmdHandler.Register('image', async (args) => {
      const spriteName = args[0]
      const element: ChatElement = new SpriteChatElement(1, AssetLoader.getTexture(spriteName), -1)
      element.setIcon(PIXI.Texture.WHITE)
      this.scrollView.setMessage(element)
    })

    CmdHandler.Register('video', async (args) => {
      const videoName = args[0]
      const duration = +args[1]

      const video: { src: any; panel: PIXI.Graphics } = VideoPanel.play(videoName, duration, () => {})
      videoScene.addChild(video.panel)

      await new Promise((resolve) => setTimeout(resolve, duration * 1000))
    })

    CmdHandler.Register('mystery', async (args) => {
      const mysteryID = +args[0]

      //cant stop mainMystery
      if (mysteryID == 0) return

      const mystery = this.getMystery(mysteryID)

      this.pause(0)
      this.start(mysteryID)

      mystery.onCleared = () => {
        this.selectMenu.clearElements()
        this.currentMystery = this.mainMys
        this.restart(0)
      }
    })

    CmdHandler.Register('panel-result', async () => {
      const op = this.colorMys.getOperation(this.colorMys.requestedOp)

      if (op != undefined) {
        this.colorMys.panelInfo[op.panelIdx] = !this.colorMys.panelInfo[op.panelIdx]

        if (op.lampIdx != -1) {
          this.colorMys.panelInfo[op.lampIdx] = !this.colorMys.panelInfo[op.lampIdx]
        }

        const pattern = this.colorMys.getPattern()
        const isCurrect = pattern.every((idx) => this.colorMys.panelInfo[idx] == true)

        if (isCurrect) {
          this.colorMys.nextAttempt()
        } else {
          this.colorMys.resetAttempt()
        }
      }

      const panel: ChatElement = new PanelChatElement(5, this.colorMys.panelInfo)
      panel.setIcon(AssetLoader.getIconById(5))
      this.scrollView.setMessage(panel)

      this.colorMys.requestedOp = ''
    })

    CmdHandler.Register('lightsout', async () => {
      this.puzzleMys.panel.onShow = () => {
        taskBar.Yochimu.window.open()
        const x = this.puzzleMys.panel.x + (this.puzzleMys.panel.width - taskBar.Yochimu.window.width) * 0.5
        const y = this.puzzleMys.panel.y + 20
        taskBar.yochimuToFixed(x, y)

        taskBar.Yochimu.window.disable()
      }

      this.puzzleMys.startLightsout()

      await this.puzzleMys.waitUntil(() => this.puzzleMys.isCleard)

      taskBar.Yochimu.window.enable()
    })

    const buttonPattern = MathUtils.shuffle([0, 1, 2, 3, 4, 5])

    CmdHandler.Register('bomb-result', async () => {
      const op = this.bombMys.getOperation(this.bombMys.requestedOp)

      if (op != undefined) {
        this.bombMys.panelInfo[op.panelIdx] = !this.bombMys.panelInfo[op.panelIdx]
        this.bombMys.nextAttempt()
      }

      // const panel: ChatElement = new PanelChatElement(5, this.colorMys.panelInfo)

      const panel: ChatElement = new BombChatElement(5, this.bombMys.panelInfo, buttonPattern)
      panel.setIcon(AssetLoader.getIconById(5))
      this.scrollView.setMessage(panel)

      this.colorMys.requestedOp = ''
    })
  }

  start(id: number) {
    this.currentMystery = this.getMystery(id)
    this.currentMystery.startMystery()
  }

  pause(id: number) {
    this.getMystery(id).paused = true
  }

  restart(id: number) {
    this.getMystery(id).paused = false
  }

  getMystery(id: number): Mystery {
    return this.mysteries.find((mys) => mys.id == id)
  }
}
