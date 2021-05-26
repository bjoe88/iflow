import { Svg } from '@svgdotjs/svg.js'
import { SVG, G } from '@svgdotjs/svg.js'
const draw = SVG();

interface ComponentSubElement {
  type: string
}
export interface ComponenentElementData {
  _uid: string,
  selected: boolean,
  component: string,
  title: string,
  x: number,
  y: number,
  linkFrom?: number[]
}
export interface ComponenentData {
  drawType: string,
  block: ComponenentElementData,
  event?: {
    mouseDown: (e: React.MouseEvent<Element, globalThis.MouseEvent>) => void,
  },
  getData?: () => ComponenentElementData[]
}
class Base {
  static readonly MetaData = {
    width: 10,
    height: 10,
    radius: 10,
    headerBGColor1: "#dae8fc",
    headerBGColor2: "#7ea6e0",
    bodyColor: "#FFFFFF",
    strokeColor: "#000000",
    selectedStrokeColor: "#00a8ff",
    selectedStrokeDasharray: "4, 4",
  };
  private subElement: ComponentSubElement[] = []
  private defaultAttr
  private g: G
  private svg: Svg
  private data: ComponenentData;
  constructor(svg: Svg, data: ComponenentData) {
    this.svg = svg
    this.data = data;
    this.g = draw.group();
    this.render()
  }

  resetDefaultAttr() {
    this.defaultAttr = {
      x: this.data.block.x ? this.data.block.x : 50,
      y: this.data.block.y ? this.data.block.y : 150,
      rx: this.getMetaData().radius,
      ry: this.getMetaData().radius,
      fill: this.getMetaData().bodyColor,
      stroke: this.getMetaData().strokeColor,
    }
  }

  render(data: ComponenentData | null = null) {
    if (data) this.data = data;
    if (!!this.g) {
      this.g.remove();
    }
    this.g = draw.group();
    this.resetDefaultAttr();
    if (this.data.drawType === 'element') {
      this.drawElement();
      if (!!this.data.block.selected) this.addSelectedBoxIfNeeded()
    }
    else if (this.data.drawType === 'line') {
      this.drawElementLines()
    }
    this.addToSvg()
    return this
  }

  addToSvg() {
    if (this.g) {
      this.g.addTo(this.svg)
    }
    return this
  }

  drawElement() {
    const x = this.defaultAttr.x
    const y = this.defaultAttr.y
    const headerBDGradient = draw.gradient('linear', (add) => {
      add.stop(0, this.getMetaData().headerBGColor1)
      add.stop(1, this.getMetaData().headerBGColor2)
    }).addTo(this.g);
    const headerClipRect = draw.rect(this.getMetaData().width, 25).attr({ x, y, })
    const headerClip = draw.clip().add(headerClipRect).addTo(this.g);
    draw.rect(this.getMetaData().width, this.getMetaData().height)
      .attr(this.defaultAttr)
      .addTo(this.g);
    draw.rect(this.getMetaData().width, this.getMetaData().height)
      .attr({
        ...this.defaultAttr,
        fill: headerBDGradient,
      })
      .clipWith(headerClip)
      .addTo(this.g);
    // this.addSubElement();
    this.addEventBinding();
  }

  addEventBinding() {
    if (this.data.event?.mouseDown) {
      this.g.mousedown((e) => {
        this.data.event?.mouseDown(e)
      });
    }
  }

  addSelectedBoxIfNeeded(): void {
    draw.rect(this.getMetaData().width + 2, this.getMetaData().height + 2).attr({
      x: this.defaultAttr.x - 1,
      y: this.defaultAttr.y - 1,
      rx: this.defaultAttr.rx + 1,
      ry: this.defaultAttr.ry + 1,
      fill: "none",
      stroke: this.getMetaData().selectedStrokeColor,
      "stroke-dasharray": this.getMetaData().selectedStrokeDasharray
    }).addTo(this.g);
  }

  drawElementLines() {
    const x = this.defaultAttr.x
    const y = this.defaultAttr.y
    this.data?.block.linkFrom?.forEach((i: number) => {
      if (!this.data.getData) return
      const inputElement = this.data.getData()[i]
      const start = { x: inputElement.x + 119, y: inputElement.y + 30 }
      const end = { x, y: y + 30 }
      const mid = { x: Math.floor((start.x + end.x) / 2), y: Math.floor((start.y + end.y) / 2) }
      const preMid = { x: start.x + 10 + Math.floor((end.x - start.x) / 2), y: start.y + Math.floor((end.y - start.y) * 1 / 10) }
      const postMid = { x: end.x - 10 - Math.floor((end.x - start.x) / 2), y: end.y - Math.floor((end.y - start.y) * 1 / 10) }
      if (preMid.x < start.x + 30) preMid.x = start.x + 30;
      if (postMid.x > end.x - 30) postMid.x = end.x - 30;
      const path = `M ${start.x} ${start.y} Q ${preMid.x} ${preMid.y} ${mid.x} ${mid.y} Q ${postMid.x} ${postMid.y} ${end.x} ${end.y}`
      return draw.path(path)
        .attr({
          fill: "none",
          stroke: "blue",
          "stroke-miterlimit": this.getMetaData().radius,
          "pointer-events": "stroke",
          "stroke-width": "2"
        })
        .addTo(this.g)
    });
  }

  getMetaData() {
    return Base.MetaData;
  }
}
export default Base