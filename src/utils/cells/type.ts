export type cellTile = {
  x: number,
  y: number,
  frameX: number,
  frameY: number,
  id: number
}

export enum LevelTypes {
  nw,
  whatever,
}

export enum shaderPropTypes {
  attribute,
  uniform
}

export type shaderProp = {
  // varName: string,
  propType: shaderPropTypes,
  data: Float32Array,
}

export type shaderProperties = {
  properties: {[propName: string]: shaderProp}
  program: WebGLProgram
}

export type renderableWProps = {
  id: string,
  x: number,
  y: number,
  scale: Float32Array,
  angle: number,
  texture: WebGLTexture
}

export type shaderPass = {
  fnct : (self: renderableBatch) => void,
}

export type renderableBatch = {
  r: {[layer:number]: Array<renderableWProps>},
  shader: shaderProperties,
  passes: {[num:number]: shaderPass}
}

export type renderables = {
  all: {[layer:number]: Array<renderableBatch>}
}
// export default cellTile