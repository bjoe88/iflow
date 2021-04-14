import React, { MouseEvent } from 'react'
import Components from "./FlowComponent";
import FlowGrid from "./FlowComponents/FlowGrid";
import { v4 as uuidv4 } from 'uuid';
interface IProps {
}

interface IState {
  data: any[],
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
const data = [
  {
    _uid: uuidv4(),
    component: "foo",
    title: "Foo",
    x: 50,
    y: 50,
  },
  {
    _uid: uuidv4(),
    component: "bar",
    title: "Bar",
    x: 50,
    y: 200,
  },
  {
    _uid: uuidv4(),
    component: "bar",
    title: "Bar",
    x: 400,
    y: 300,
    linkFrom: [1]
  }
]

class Flow extends React.Component<IProps, IState>  {
  mousePosition = { x: 0, y: 0 }
  domElement: React.RefObject<HTMLDivElement>;
  constructor(props: IProps) {
    super(props);
    this.state = {
      data,
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

  componentDidUpdate() {
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
      const newX = this.state.data[i].x + (moveX / this.state.transform.scale);
      const newY = this.state.data[i].y + (moveY / this.state.transform.scale);
      const data = [...this.state.data]
      data[i].x = newX;
      data[i].y = newY;
      this.setState({
        ...this.state,
        data,
      });
    }
  }
  getState() {
    console.log(this)
    return this
  }


  render() {
    const wheel = (e) => {
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
    const mouseDown = (e: MouseEvent) => {
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
    const mouseUp = (e: MouseEvent) => {
      if (e.button === 2) {
        this.setState({
          ...this.state,
          targetType: "",
          cursor: "default"
        })
      }
    }
    const svgMouseDown = (e: MouseEvent, i: number) => {
      if (e.button === 0) {
        this.setState({
          ...this.state,
          targetType: "svgElement",
          targetItem: this.state.data[i],
          targetNumber: i,
        })
        this.mousePosition.x = e.clientX;
        this.mousePosition.y = e.clientY;
      }
    }
    const svgMouseUp = (e: React.MouseEvent, i: number) => {
      if (e.button === 0) {
        this.setState({
          ...this.state,
          targetType: "",
          targetItem: null,
          targetNumber: -1,
        })
      }
    }
    return (
      <div style={{
        width: "100",
        height: "100vh",
        overflow: "hidden",
        background: "red",
        cursor: this.state.cursor,
      }}
        onContextMenu={(e) => e.preventDefault()}
        onWheel={wheel}
        onMouseDown={mouseDown}
        onMouseUp={mouseUp}
        ref={this.domElement}>
        <svg width="2000px" height="2000px" xmlns="http://www.w3.org/2000/svg" style={{
          background: "white",
        }} >
          <FlowGrid />
          {this.state.data.map((block, i: number) => Components("line", { index: i, ...block }, {
            onMouseDown: svgMouseDown,
            onMouseUp: svgMouseUp,
            getState: () => this.state,
          }))}
          {this.state.data.map((block, i: number) => Components("element", { index: i, ...block }, {
            onMouseDown: svgMouseDown,
            onMouseUp: svgMouseUp,
            getState: () => this.state,
          }))}
        </svg>
      </div >
    )
  }
}

export default Flow;
