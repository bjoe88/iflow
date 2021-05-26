import { Svg } from '@svgdotjs/svg.js'
import { SVG, G } from '@svgdotjs/svg.js'
const draw = SVG();

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
  private defaultAttr
  private g: G
  private svg: Svg
  constructor(svg: Svg, data: any) {
    this.svg = svg
    this.g = draw.group();
    this.render(data)
  }

  resetDefaultAttr(data) {
    this.defaultAttr = {
      x: data.block.x ? data.block.x : 50,
      y: data.block.y ? data.block.y : 150,
      rx: this.getMetaData().radius,
      ry: this.getMetaData().radius,
      fill: this.getMetaData().bodyColor,
      stroke: this.getMetaData().strokeColor,
    }
  }

  render(data) {
    if (!!this.g) {
      this.g.remove();
    }
    this.g = draw.group();
    this.resetDefaultAttr(data);
    if (data.drawType === 'element') {
      this.drawElement(data, this.g);
      if (!!data.block.selected) this.addSelectedBoxIfNeeded(this.g, draw)
    }
    else if (data.drawType === 'line') {
      this.drawElementLines(data, this.g)
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

  drawElement(data: any, g: G) {
    const x = this.defaultAttr.x
    const y = this.defaultAttr.y
    const headerBDGradient = draw.gradient('linear', (add) => {
      add.stop(0, this.getMetaData().headerBGColor1)
      add.stop(1, this.getMetaData().headerBGColor2)
    }).addTo(g);
    const headerClipRect = draw.rect(this.getMetaData().width, 25).attr({ x, y, })
    const headerClip = draw.clip().add(headerClipRect).addTo(g);
    draw.rect(this.getMetaData().width, this.getMetaData().height)
      .attr(this.defaultAttr)
      .addTo(g);
    draw.rect(this.getMetaData().width, this.getMetaData().height)
      .attr({
        ...this.defaultAttr,
        fill: headerBDGradient,
      })
      .clipWith(headerClip)
      .addTo(g);
    if (data.event?.mouseDown) {
      g.mousedown((e) => {
        data.event?.mouseDown(e)
      });
    }
  }

  addSelectedBoxIfNeeded(g: G, draw: Svg): void {
    draw.rect(this.getMetaData().width + 2, this.getMetaData().height + 2).attr({
      x: this.defaultAttr.x - 1,
      y: this.defaultAttr.y - 1,
      rx: this.defaultAttr.rx + 1,
      ry: this.defaultAttr.ry + 1,
      fill: "none",
      stroke: this.getMetaData().selectedStrokeColor,
      "stroke-dasharray": this.getMetaData().selectedStrokeDasharray
    }).addTo(g);
  }

  drawElementLines(data: any, g: G) {
    const x = this.defaultAttr.x
    const y = this.defaultAttr.y
    data.block.linkFrom?.map((i: number) => {
      const inputElement = data.getData()[i]
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
        .addTo(g)
    });
  }

  getMetaData() {
    return Base.MetaData;
  }
}
export default Base