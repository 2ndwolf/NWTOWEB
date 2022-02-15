// Importing a class in a type declaration
// file seems weird but is a huge extension
import Archetype from '../archetypes/rootArchetype'

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

// export type shaderProp = {
//   propType: shaderPropTypes,
//   data: Float32Array,
// }

export type Shader = {
  // properties: {[propName: string]: shaderProp}
  program: WebGLProgram
  passes: Array<shaderPass>
}

/**
 * properties:
 * 
 * border = `int[strokeW, mode(0:off/1:inside/2:center/3:outside), gap, pathing]`
 * (used with gridded shader rn)
 * 
 * selection = int[x,y,w,h]
 * (add to a blank full game window size gameobject)
 * 
 * 
 * 
 * 
 * unclickable = bool
 */
export type gameobject = {
  id?: string,
  file?: string,
  x: number,
  y: number,
  scale?: Float32Array,
  angle?: number,
  texture?: Tex,
  // Importing a class in a type declaration
  // file seems weird but is a huge extension
  archetype?: Archetype
  shaderID?: string,
  unclickable?: boolean,
  hidden?: boolean
}

export type Tex = {
  image?: WebGLTexture,
  file?: string,
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

export type renderableBatch = gameobject & {
  r: {[layer:number]: {[name:string]:gameobject}},
}

export type Layer = gameobject & {
  members : {[name:string]:renderableBatch}
}

export type renderables = {
  all: {[layer:number]: Layer}
}