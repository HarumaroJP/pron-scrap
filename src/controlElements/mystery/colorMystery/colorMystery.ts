import * as PIXI from 'pixi.js'
import { AssetLoader } from '../../../core/assetLoader'
import { CmdHandler } from '../../../core/cmdHandler'
import { ChatElement } from '../../applications/chat/chatElement/chatElement'
import { TextChatElement } from '../../applications/chat/chatElement/textChatElement'
import { Mystery } from '../mystery'

export class ColorMystery extends Mystery {
  requestedOp: string
  operations: { id: string; panelIdx: number; lampIdx: number }[] = []
  conditions: { id: string; condition: () => boolean }[] = []
  panelInfo: boolean[] = Array(9).fill(false)

  attempt: number = 1
  isDefuseFailed: boolean = false

  readonly phases: { isClear: boolean; leverIdx: number; pattern: number[] }[] = [
    { isClear: false, leverIdx: 6, pattern: [1, 3, 6] },
    { isClear: false, leverIdx: 7, pattern: [3, 5, 7] },
    { isClear: false, leverIdx: 8, pattern: [5, 3, 1, 8] },
  ]

  constructor(id: number, isRepeat: boolean) {
    super(id, AssetLoader.getMysteryLineData(id), isRepeat)

    this.registerOps()

    this.onChatLogic = async (chat) => {
      let canBreak: boolean = false

      while (!canBreak) {
        if (chat.id == 1) {
          //if command
          await CmdHandler.Execute(chat.line)
        } else if (chat.id == 2) {
          //if player
          const lines: string[] = chat.line.split(',')
          const ops: { line: string; op: string; cond: string }[] = []

          //parse to operation
          lines.forEach((li) => {
            if (!li.match(/\S/g)) return

            const msgs = li.split(/(?=[:@])/g)

            const line = msgs[0]
            const op = this.castArgument(msgs, ':')
            const cond = this.castArgument(msgs, '@')

            console.log({ line: line, op: op, cond: cond })
            ops.push({ line: line, op: op, cond: cond })
          })

          const cleardPhases = this.getCleardPhase()

          //add chatElement
          ops.forEach((msg) => {
            if (msg.op != undefined) {
              //cleard lever?
              const op = this.getOperation(msg.op)

              if (cleardPhases.some((p) => p.leverIdx == op.panelIdx)) {
                return
              }
            }

            const element: ChatElement = new TextChatElement(2, msg.line)
            this.selectMenu.addElement(element)

            if (msg.op != undefined) {
              element.onClick.push(() => {
                this.requestedOp = msg.op
              })
            }
          })

          this.paused = true

          await this.waitUntil(() => !this.paused)
        } else {
          //if friend
          const lines: string[] = chat.line.split('@')
          const msg: { line: string; cond: string } = { line: lines[0], cond: lines[1] }

          if (this.condition(msg.cond)) {
            const element: ChatElement = new TextChatElement(chat.id, chat.line)
            element.setIcon(AssetLoader.getIconById(chat.id))
            this.scrollView.setMessage(element)
          } else {
            chat = this.forceNext()
            continue
          }
        }

        canBreak = true
      }
    }
  }

  castArgument(msgs: string[], tag: string): string {
    const arg = msgs.find((str) => str.slice(0, 1) == tag)

    if (arg == undefined) return undefined

    return arg.slice(1)
  }

  condition(key: string): boolean {
    if (key == undefined) return true

    return this.conditions.find((cond) => cond.id == key).condition()
  }

  getOperation(key: string): { id: string; panelIdx: number; lampIdx: number } {
    return this.operations.find((opElm) => opElm.id == key)
  }

  getCurrentPhase(): { isClear: boolean; leverIdx: number; pattern: number[] } {
    //if all clear
    if (this.phases.every((p) => p.isClear == true)) return undefined

    return this.phases.find((p) => !p.isClear)
  }

  getCleardPhase(): { isClear: boolean; leverIdx: number; pattern: number[] }[] {
    return this.phases.filter((p) => p.isClear)
  }

  getPattern(): number[] {
    const phase = this.getCurrentPhase()

    if (phase == undefined) return undefined

    return phase.pattern.slice(0, this.attempt)
  }

  nextAttempt() {
    const phase = this.getCurrentPhase()

    if (this.attempt == phase.pattern.length) {
      phase.isClear = true

      const nextPhase = this.getCurrentPhase()

      if (nextPhase == undefined) {
        this.isCleard = true
      }

      this.resetButtons()
      this.attempt = 1
    } else {
      this.isDefuseFailed = false
      this.attempt++
    }
  }

  resetAttempt() {
    const phase = this.getCurrentPhase()

    this.isDefuseFailed = true

    this.panelInfo[phase.leverIdx] = false
    this.resetButtons()
    this.attempt = 1
  }

  buttonsIdx: number[] = [0, 1, 2, 3, 4, 5]

  resetButtons() {
    this.buttonsIdx.forEach((idx) => (this.panelInfo[idx] = false))
  }

  registerOps() {
    this.operations.push({ id: 'button-red', panelIdx: 1, lampIdx: 0 })
    this.operations.push({ id: 'button-blue', panelIdx: 3, lampIdx: 2 })
    this.operations.push({ id: 'button-green', panelIdx: 5, lampIdx: 4 })
    this.operations.push({ id: 'lever-purple', panelIdx: 6, lampIdx: -1 })
    this.operations.push({ id: 'lever-cyan', panelIdx: 7, lampIdx: -1 })
    this.operations.push({ id: 'lever-white', panelIdx: 8, lampIdx: -1 })

    this.conditions.push({ id: 'isDefuseFailed', condition: () => this.isDefuseFailed })
  }
}
