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
  assetsToLoad['mainVert'] = Globals.getOrigin()+'/assets/shaders/main.vert'
  assetsToLoad['mainFrag'] = Globals.getOrigin()+'/assets/shaders/main.frag'
  await Assets.loadAssets(assetsToLoad)

  Render.init();
  const cell : Array<T.cellTile> = NeW.default.parseCell(Assets.getText('cellFile'))
  Render.createALevel(cell, 16, 64)

  Render.renderAll()

  // Render.createShader('mainShader', Assets.getText('mainVert'), Assets.getText('mainFrag'))


  // Render.main()
  // Render.renderALevel(cell, 16, 64)

}
Render.init()

let fun : T.renderableWProps = {
  id: 'cellTex',
  x: 0,
  y: 0,
  scale: new Float32Array([1.,1.]),
  angle : 0,
  texture: Render.level
}

let dummy: {[layer:number]: Array<T.renderableWProps>} = {
  0: [fun]
}

let times: T.renderableBatch = ShaderProgramsHelper.createClassicBatch(dummy, Render.getShader('fallbackShader'))

Render.allRenderables = {
  all:{0 : [times]}}

init()

