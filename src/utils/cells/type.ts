export type Cell = gameobject & {
  id: string,
  tileSize: number,
  tileWidth: number,
  tileHeight: number,
  tiles: Array<cellTile>,
  tileset: string
  npcs: {[name:string]:gameobject}
}

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

export enum renderableTypes {
  level, gameobject, uiobject
}

export enum renderingTarget {
  game, ui
}

export type shaderProp = {
  // varName: string,
  propType: shaderPropTypes,
  data: Float32Array,
}

export type Shader = {
  properties: {[propName: string]: shaderProp}
  program: WebGLProgram
  passes: {[num:number]: shaderPass},
}

export type gameobject = {
  id?: string,
  file?: string,
  x: number,
  y: number,
  scale?: Float32Array,
  angle?: number,
  texture?: Tex,
  properties?: {[nm:string]:any}
}

export type Tex = {
  image: WebGLTexture,
  width: number,
  height: number
}

export type shaderPass = (
    self: renderableBatch, 
    layer: Layer,
    currentRenderable: gameobject,
    targetWidth: number,
    targetHeight: number,
    shader: Shader
) => void

export type renderableBatch = {
  r: {[layer:number]: {[name:string]:gameobject}},
  shaderID?: string,
}

export type Layer = gameobject & {
  members : {[name:string]:renderableBatch}
}

export type renderables = {
  all: {[layer:number]: Layer}
}

// export default cellTile