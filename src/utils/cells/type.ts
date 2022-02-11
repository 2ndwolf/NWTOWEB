export type Cell = {
  id: string,
  tileSize: number,
  tileWidth: number,
  tileHeight: number,
  tiles: Array<cellTile>,
  tileset: string
  npcs: Array<npc>
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

export type shaderProperties = {
  properties: {[propName: string]: shaderProp}
  program: WebGLProgram
}

// export type renderableWProps = {
export type npc = {
  id: string,
  file?: string,
  x: number,
  y: number,
  scale: Float32Array,
  angle: number,
  texture?: Tex
}

export type Tex = {
  image: WebGLTexture,
  width: number,
  height: number
}

export type shaderPass = {
  fnct : (self: renderableBatch, 
          layer: number,
          currentRenderable: npc,
          targetWidth: number,
          targetHeight: number) => void
}

export type renderableBatch = {
  r: {[layer:number]: Array<npc>},
  shader: shaderProperties,
  passes: {[num:number]: shaderPass},
  clampToBorder: boolean
}

export type renderables = {
  all: {[layer:number]: Array<renderableBatch>}
}

// export default cellTile