import React, { Fragment, MouseEvent } from 'react'
import { Svg, SVG } from '@svgdotjs/svg.js'

import Event from "./FlowComponents/Event";
import Job from "./FlowComponents/Job";
import { v4 as uuidv4 } from 'uuid';
import './Flow.css';
import Base from './FlowComponents/Base';

interface IProps {
}

interface IState {
  transform: {
    scale: number,
    translate: {
      x: number,
      y: number
    }
  },
  targetType: string;
  targetItem: any;
  targetNumber: number;
  cursor: string;
}

interface FlowElement {
  _uid: string,
  selected: boolean,
  component: "event" | "job",
  title: string,
  x: number,
  y: number,
  linkFrom?: number[]
}

const data: FlowElement[] = [
  {
    _uid: uuidv4(),
    selected: false,
    component: "event",
    title: "Foo",
    x: 50,
    y: 50,
  },
  {
    _uid: uuidv4(),
    selected: false,
    component: "event",
    title: "Event",
    x: 50,
    y: 200,
  },
  {
    _uid: uuidv4(),
    selected: false,
    component: "job",
    title: "Foo",
    x: 400,
    y: 300,
    linkFrom: [1]
  }
]
function ComponentMapping(componentName: string) {
  switch (componentName.toLowerCase()) {
    case "job":
      return Job;
    case "event":
      return Event;
    default:
      throw new Error("Component type unknown")
  }
}

class Flow extends React.Component<IProps, IState>  {
  mousePosition = { x: 0, y: 0 }
  domElement: React.RefObject<HTMLDivElement>;
  svg!: Svg;
  elementList: { element: Base[], line: Base[] } = {
    element: [],
    line: []
  }
  gridSizePerField = 500;
  svgHeight = this.gridSizePerField;
  svgWidth = this.gridSizePerField;
  data: FlowElement[];
  constructor(props: IProps) {
    super(props);
    this.data = data;
    this.state = {
      transform: {
        scale: 1,
        translate: {
          x: 0,
          y: 0,
        }
      },
      targetType: "",
      targetItem: null,
      targetNumber: 0,
      cursor: "default"
    };
    this.domElement = React.createRef();
    window.addEventListener("mousemove", (e: any) => {
      this.mouseMove(e);
    })
  }

  componentDidMount() {
    // this.svg = this.domElement.current?.firstChild as unknown as HTMLElement & SVGSVGElement;
    // const ele = SVG(this.svg);
    const svg = SVG()
      .css('background', "#FFFFFF")
      .css('height', `${this.svgHeight}px`)
      .css('width', `${this.svgWidth}px`)
    this.svg = svg;
    svg.addTo(this.domElement.current as unknown as HTMLElement);
    const rect = SVG(`<g>
      <defs>
        <pattern id="smallGrid" width="10" height="10" patternUnits="userSpaceOnUse">
          <path d="M 10 0 L 0 0 0 10" fill="none" stroke="gray" stroke-width="0.5" />
        </pattern>
        <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
          <rect width="100" height="100" fill="url(#smallGrid)" />
          <path d="M 100 0 L 0 0 0 100" fill="none" stroke="gray" stroke-width="1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
    </g>`);
    rect.addTo(svg);

    this.drawSvgElement()
  }

  componentDidUpdate() {
  }

  recalibrateElement() {
    const dataLen = this.data.length
    let startX = this.gridSizePerField + 1, startY = this.gridSizePerField + 1;
    let endX = 0, endY = 0;
    for (let i = 0; i < dataLen; i++) {
      startX = Math.min(startX, this.data[i].x)
      startY = Math.min(startY, this.data[i].y)
      endX = Math.max(endX, this.data[i].x + ComponentMapping(this.data[i].component).MetaData.width)
      endY = Math.max(endY, this.data[i].y + ComponentMapping(this.data[i].component).MetaData.height)
    }
    const data = [...this.data]
    for (let i = 0; i < dataLen; i++) {
      if (startX < 0) { data[i].x += this.gridSizePerField }
      else if (startX > this.gridSizePerField) { data[i].x -= this.gridSizePerField }
      if (startY < 0) { data[i].y += this.gridSizePerField }
      else if (startY > this.gridSizePerField) { data[i].y -= this.gridSizePerField }
    }
    let newX = this.state.transform.translate.x
    let newY = this.state.transform.translate.y
    if (startX < 0 || startY < 0 || // Element start before grid
      startX > this.gridSizePerField || startY > this.gridSizePerField || // Element start after next grid
      endX > this.svgWidth || endY > this.svgHeight || // Element end after next grid
      endX < this.svgWidth - this.gridSizePerField || endY < this.svgHeight - this.gridSizePerField) { // element end before next grid
      const offSetByWidth = ((1 - this.state.transform.scale) * this.gridSizePerField / 2)
      const offSetByHeight = ((1 - this.state.transform.scale) * this.gridSizePerField / 2)
      if (startX < 0 || endX > this.svgWidth) {
        this.svgWidth += this.gridSizePerField;
        newX = this.state.transform.translate.x - offSetByWidth
        if (startX < 0) newX -= (this.gridSizePerField * this.state.transform.scale)
      }
      else if (startX > this.gridSizePerField || endX < this.svgWidth - this.gridSizePerField) {
        this.svgWidth -= this.gridSizePerField;
        newX = this.state.transform.translate.x + offSetByWidth
        if (startX > this.gridSizePerField) newX += (this.gridSizePerField * this.state.transform.scale)
      }
      if (startY < 0 || endY > this.svgHeight) {
        this.svgHeight += this.gridSizePerField;
        newY = this.state.transform.translate.y - offSetByHeight
        if (startY < 0) newY -= (this.gridSizePerField * this.state.transform.scale)
      }
      else if (startY > this.gridSizePerField || endY < this.svgHeight - this.gridSizePerField) {
        this.svgHeight -= this.gridSizePerField;
        newY = this.state.transform.translate.y + offSetByHeight
        if (startY > this.gridSizePerField) newY += (this.gridSizePerField * this.state.transform.scale)
      }
      const matrix = new DOMMatrixReadOnly();
      const scaledMatrix = matrix.scale(this.state.transform.scale).translate(newX / this.state.transform.scale, newY / this.state.transform.scale);
      const svg = this.domElement.current?.firstChild as unknown as HTMLElement & SVGSVGElement;
      svg.setAttribute('transform', scaledMatrix.toString());
    }
    this.data = data;
    this.setState({
      ...this.state,
      transform: {
        ...this.state.transform,
        translate: {
          x: newX,
          y: newY
        }
      },
    });
  }

  updateSvg() {
    this.svg
      .css('background', "#FFFFFF")
      .css('height', `${this.svgHeight}px`)
      .css('width', `${this.svgWidth}px`)
  }

  drawElement() {
    this.data.forEach((block, i) => {
      const data = {
        drawType: "element",
        block,
        event: {
          mouseDown: (e: React.MouseEvent<Element, globalThis.MouseEvent>) => {
            this.svgMouseDown(e, i)
          }
        }
      }
      if (this.elementList.element[i]) {
        this.elementList.element[i].render(data);
      }
      else {
        this.elementList.element[i] = new (ComponentMapping(block.component))(this.svg, data);
      }
    })
  }

  drawLine() {
    this.data.forEach((block, i) => {
      const data = {
        drawType: "line",
        block,
        getState: () => this.state,
        getData: () => this.data,
      }
      if (this.elementList.line[i]) {
        this.elementList.line[i].render(data);
      }
      else {
        this.elementList.line[i] = new (ComponentMapping(block.component))(this.svg, data);
      }
    })
  }

  drawSvgElement() {
    this.recalibrateElement()
    this.updateSvg()
    this.drawElement()
    this.drawLine()
  }

  mouseMove(e: MouseEvent) {
    // TODO: Move to enum
    if (e.buttons === 2 && this.state.targetType === "svgCanvas") {
      e.stopPropagation();
      e.preventDefault();
      const svg = this.domElement.current?.firstChild as unknown as HTMLElement & SVGSVGElement;
      if (!svg) return;
      const moveX = e.clientX - this.mousePosition.x;
      const moveY = e.clientY - this.mousePosition.y;
      this.mousePosition.x = e.clientX;
      this.mousePosition.y = e.clientY;
      const newX = this.state.transform.translate.x + (moveX);
      const newY = this.state.transform.translate.y + (moveY);
      const matrix = new DOMMatrixReadOnly();
      const scaledMatrix = matrix.scale(this.state.transform.scale).translate(newX / this.state.transform.scale, newY / this.state.transform.scale);
      svg.setAttribute('transform', scaledMatrix.toString());
      this.setState({
        ...this.state,
        transform: {
          ...this.state.transform,
          translate: {
            x: newX,
            y: newY
          }
        }
      });
    }
    else if (e.buttons === 1 && this.state.targetType === "svgElement") {
      e.stopPropagation();
      e.preventDefault();
      const moveX = e.clientX - this.mousePosition.x;
      const moveY = e.clientY - this.mousePosition.y;
      const i = this.state.targetNumber;
      this.mousePosition.x = e.clientX;
      this.mousePosition.y = e.clientY;
      const newX = this.data[i].x + (moveX / this.state.transform.scale);
      const newY = this.data[i].y + (moveY / this.state.transform.scale);
      const data = [...this.data]
      data[i].x = newX;
      data[i].y = newY;
      this.data = data;
      this.drawSvgElement()
    }
  }

  svgMouseDown(e: MouseEvent, i: number) {
    e.preventDefault()
    e.stopPropagation()
    if (e.button === 0) {
      const data = [...this.data];
      data.forEach((ele) => {
        ele.selected = false;
      })
      data[i].selected = true;
      this.data = data;
      this.setState({
        ...this.state,
        targetType: "svgElement",
        targetItem: this.data[i],
        targetNumber: i,
      })
      this.mousePosition.x = e.clientX;
      this.mousePosition.y = e.clientY;
      this.drawSvgElement()
    }
  }

  svgMouseUp(e: React.MouseEvent, i: number) {
    console.log(this, e)
    e.preventDefault()
    e.stopPropagation()
    if (e.button === 0) {
      this.setState({
        ...this.state,
        targetType: "",
        targetItem: null,
        targetNumber: -1,
      })
    }
  }

  wheelScroll(e) {
    const svg = this.domElement.current?.firstChild as unknown as HTMLElement & SVGSVGElement;
    const delta = e.deltaY;
    const newX = this.state.transform.translate.x;
    const newY = this.state.transform.translate.y;
    const matrix = new DOMMatrixReadOnly();
    const zoomScale = this.state.transform.scale * Math.pow(1.2, delta / 360);
    const screenTopLeft = {
      x: (svg.width.baseVal.value / 2) + this.state.transform.translate.x,
      y: (svg.width.baseVal.value / 2) + this.state.transform.translate.y
    }
    const mousePosition = {
      x: e.pageX,
      y: e.pageY
    }
    const mousePosFromCenterX = screenTopLeft.x - mousePosition.x
    const mousePosFromCenterY = screenTopLeft.y - mousePosition.y
    const deltaMouseX = (mousePosFromCenterX / zoomScale) - (mousePosFromCenterX / this.state.transform.scale)
    const deltaMouseY = (mousePosFromCenterY / zoomScale) - (mousePosFromCenterY / this.state.transform.scale)
    const scaledMatrix = matrix
      .scale(zoomScale)
      .translate((newX / zoomScale) - deltaMouseX, (newY / zoomScale) - deltaMouseY);

    this.setState({
      ...this.state,
      transform: {
        ...this.state.transform,
        translate: {
          x: newX - (deltaMouseX * zoomScale),
          y: newY - (deltaMouseY * zoomScale),
        },
        scale: zoomScale
      }
    });
    svg.setAttribute('transform', scaledMatrix.toString());
  }

  mouseDown(e: MouseEvent) {
    if (e.button === 2) {
      this.mousePosition.x = e.clientX;
      this.mousePosition.y = e.clientY;
      this.setState({
        ...this.state,
        targetType: "svgCanvas",
        cursor: "all-scroll"
      })
    }
  }

  mouseUp(e: MouseEvent) {
    if (e.button === 2) {
      this.setState({
        ...this.state,
        targetType: "",
        cursor: "default"
      })
    } else if (e.button === 0) {
      const data = this.data;
      data.forEach((ele) => {
        ele.selected = false;
      })
      this.data = data;
      this.setState({
        ...this.state,
        targetType: "",
        cursor: "default"
      })
    }
  }

  render() {
    return (
      <Fragment>
        <div className="Flow" style={{
          cursor: this.state.cursor,
        }}
          onContextMenu={(e) => e.preventDefault()}
          onWheel={(e) => { this.wheelScroll(e) }}
          onMouseDown={(e) => { this.mouseDown(e) }}
          onMouseUp={(e) => { this.mouseUp(e) }}
          ref={this.domElement}>
        </div >
      </Fragment>
    )
  }
}

export default Flow;