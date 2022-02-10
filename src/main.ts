import Render from "./render"
import Assets from "./assets"
import * as NeW from "./utils/cells/NwParser"
import * as T from './utils/cells/type'
import ShaderProgramsHelper from './sPrograms'


import Globals from "./globals"

const init = async () => {
  
  let assetsToLoad: {[id:string]: string} = {};
  assetsToLoad['tileset'] = Globals.getOrigin()+'/assets/pics2.png'
  assetsToLoad['cellFile'] = Globals.getOrigin()+'/assets/nwfiles/contestfoyer.nw'
  assetsToLoad['chest'] = Globals.getOrigin()+'/assets/gen_specialchest.gif'
  assetsToLoad['bigH'] = Globals.getOrigin()+'/assets/admintable.png'
  assetsToLoad['mainVert'] = Globals.getOrigin()+'/shaders/main.vert'
  assetsToLoad['mainFrag'] = Globals.getOrigin()+'/shaders/main.frag'
  await Assets.loadAssets(assetsToLoad)

  Render.init();
  const cellTiles : Array<T.cellTile> = NeW.default.parseCell(Assets.getText('cellFile'))
  const cell : T.Cell = {
    fileName: 'contestfoyer.nw',
    tileSize: 16,
    tileWidth: 64,
    tileHeight: 64,
    tiles: cellTiles,
    tileset: 'tileset'
  }
  let cellR : T.renderableWProps = Render.createALevel(cell)

  let chest : T.renderableWProps = {
    id: "chestIMG",
    x: 0,
    y: 0,
    width: 32,
    height: 32,
    angle: 0,
    scale: new Float32Array([1.,1.]),
    texture: Render.createTexture('chest')
  }
  let bigH : T.renderableWProps = {
    id: "bigH",
    x: 512,
    y: 512,
    width: 96,
    height: 176,
    angle: 0,
    scale: new Float32Array([1.,1.]),
    texture: Render.createTexture('bigH')
  }

  let dummy: {[layer:number]: Array<T.renderableWProps>} = {
    0: [cellR],
    1: [chest, bigH]
  }
  
  let times: T.renderableBatch = ShaderProgramsHelper.createClassicBatch(dummy, Render.getShader('fallbackShader'))
  
  Render.gameRenderables = {
    all:{0 : [times]}}
  

  Render.renderAll()

  // Render.createShader('mainShader', Assets.getText('mainVert'), Assets.getText('mainFrag'))


  // Render.main()
  // Render.renderALevel(cell, 16, 64)

}
Render.init()

let fun : T.renderableWProps = {
  id: 'cellTex',
  x: 512,
  y: 0,
  width: 1024,
  height: 1024,
  scale: new Float32Array([1,.5]),
  angle : 0,
  texture: Render.level
}


init()

