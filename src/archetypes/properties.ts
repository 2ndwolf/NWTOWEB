// import * as T from './../utils/cells/type'
import * as C from './customProperties'

export type Prop = u | go /*have fun!*/ | C.cgo | C.cu

export enum u {
  selection   = "uSelection", // int[]
  color       = "uColor",     // int[]
  border      = "uBorder",    // int[]
}

export enum go  {
  unclickable = "unclickable", // bool
  alignToGrid = "alignToGrid", // bool
}