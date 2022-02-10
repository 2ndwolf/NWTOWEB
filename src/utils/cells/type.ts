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

export enum renderingTarget {
  game, ui
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
  width: number,
  height: number,
  scale: Float32Array,
  angle: number,
  texture: WebGLTexture
}

export type shaderPass = {
  fnct : (self: renderableBatch, 
          layer: number,
          currentRenderable: renderableWProps,
          targetWidth: number,
          targetHeight: number) => void
}

export type renderableBatch = {
  r: {[layer:number]: Array<renderableWProps>},
  shader: shaderProperties,
  passes: {[num:number]: shaderPass}
}

export type renderables = {
  all: {[layer:number]: Array<renderableBatch>}
}

export type Target = renderableWProps
// export default cellTile