import './Bar.css';
import React, { MouseEventHandler } from "react";
import { v4 as uuidv4 } from 'uuid';

const Bar = props => {
  const clippathId = uuidv4();
  const x = props.block.x ? props.block.x : 50;
  const y = props.block.y ? props.block.y : 150;
  const mouseDown: MouseEventHandler<SVGGElement> = (e: React.MouseEvent<SVGGElement, MouseEvent>) => {
    props.onMouseDown(e, props.block.index);
  }
  const mouseUp: MouseEventHandler<SVGGElement> = (e: React.MouseEvent<SVGGElement, MouseEvent>) => {
    props.onMouseUp(e, props.block.index);
  }
  if ((!props.block.linkFrom || props.block.linkFrom?.length === 0) && props.drawType === "line") {
    return (null)
  }

  return (
    <g
      className="Bar"
      onMouseDown={mouseDown}
      onMouseUp={mouseUp}
    >
      { props.drawType === "element" &&
        <g>
          <clipPath id={clippathId}>
            <rect x={x} y={y} width="119" height="25"> </rect>
          </clipPath>
          <rect
            x={x}
            y={y}
            width="119"
            height="59"
            rx="10"
            ry="10"
            fill="#ffffff"
            stroke="#000000"
            pointerEvents="all"
          >
          </rect>
          <rect
            x={x}
            y={y}
            width="119"
            height="59"
            rx="10"
            ry="10"
            fill="url(#mx-gradient-dae8fc-1-7ea6e0-1-s-0)"
            stroke="#000000"
            pointerEvents="all"
            clipPath={`url(#${clippathId})`}
          >
          </rect>
          <line x1={x} y1={y + 25} x2={x + 119} y2={y + 25} style={{ stroke: 'rgb(255,0,0)', strokeWidth: 2 }} />
          <foreignObject
            x={x}
            y={y}
            width="119"
            height="59"
          >
            <div style={{ textAlign: "center" }}>{props.block.title}</div>
          </foreignObject>

          {!!props.selected &&
            <rect
              x={x - 1}
              y={y - 1}
              width="121"
              height="61"
              rx="11"
              ry="11"
              fill="none"
              stroke="#00a8ff"
              strokeDasharray="4, 4"
            >
            </rect>
          }
          <linearGradient x1="0%" y1="0%" x2="0%" y2="100%" id="mx-gradient-dae8fc-1-7ea6e0-1-s-0">
            <stop offset="0%" style={{ stopColor: '#dae8fc' }}>
            </stop>
            <stop offset="100%" style={{ stopColor: '#7ea6e0' }}>
            </stop>
          </linearGradient>
        </g>
      }
      {props.block.linkFrom?.map((i: number) => {
        // eslint-disable-next-line array-callback-return
        if (props.drawType !== "line") return
        const inputElement = props.getState().data[i]
        const start = { x: inputElement.x + 119, y: inputElement.y + 30 }
        const end = { x, y: y + 30 }
        const mid = { x: Math.floor((start.x + end.x) / 2), y: Math.floor((start.y + end.y) / 2) }
        const preMid = { x: start.x + 10 + Math.floor((end.x - start.x) / 2), y: start.y + Math.floor((end.y - start.y) * 1 / 10) }
        const postMid = { x: end.x - 10 - Math.floor((end.x - start.x) / 2), y: end.y - Math.floor((end.y - start.y) * 1 / 10) }
        if( preMid.x < start.x + 30) preMid.x = start.x + 30;
        if( postMid.x > end.x - 30) postMid.x = end.x - 30;
        const paths = `M ${start.x} ${start.y} Q ${preMid.x} ${preMid.y} ${mid.x} ${mid.y} Q ${postMid.x} ${postMid.y} ${end.x} ${end.y}`
        return <path key={uuidv4()} d={paths} fill="none" stroke="blue" strokeMiterlimit="10" pointerEvents="stroke" strokeWidth="3"></path>
      })}
    </g>
  )
};

export default Bar;