import React from "react";
import Event from "./FlowComponents/Event";
import { v4 as uuidv4 } from 'uuid';

const Components = {
  event: Event
};

// eslint-disable-next-line import/no-anonymous-default-export
export default (drawType: string, block: { component: any; _uid: any; index: number }, events: { [Identifier: string]: any } = {}) => {
  if (typeof Components[block.component] !== "undefined") {
    return React.createElement(Components[block.component], {
      ...events,
      drawType: drawType,
      key: uuidv4(),
      block: block
    });
  }
  return React.createElement(
    () => <div>The component {block.component} has not been created yet.</div>,
    {
      ...events,
      key: uuidv4(),
    }
  );
};
