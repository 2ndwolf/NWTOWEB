// import * as T from './../utils/cells/type'


export type Prop = u | go  // have fun!

export enum u {
  selection   = "uSelection", // int[]
  color       = "uColor",     // int[]
  border      = "uBorder",    // int[]
}

export enum go  {
  unclickable = "unclickable", // bool
  alignToGrid = "alignToGrid", // bool
}