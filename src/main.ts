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
  assetsToLoad['emptyNPC'] = Globals.getOrigin()+'/assets/emptyNPC.png'
  assetsToLoad['mainVert'] = Globals.getOrigin()+'/shaders/main.vert'
  assetsToLoad['mainFrag'] = Globals.getOrigin()+'/shaders/main.frag'
  await Assets.loadAssets(assetsToLoad)

  Render.init();
  console.log(Assets.getText('cellFile'))
  const cell : T.Cell = NeW.default.parseCell('anotherFUNid', Assets.getText('cellFile'))

  for(let n in cell.npcs){
    let assets : {[id:string]: string} = {}
    assets[cell.npcs[n].file] = Globals.getOrigin()+"/assets/"+cell.npcs[n].file

    if(cell.npcs[n].file != "-"){
      await Assets.loadAssets(assets)
      cell.npcs[n].texture = Render.createTexture(Assets.getImage(cell.npcs[n].file))
      
    } else {
      cell.npcs[n].texture = Render.createTexture(Assets.getImage('emptyNPC'))
      
    }
  }

  let cellR : T.npc = Render.createALevel('funID', cell)

  let chest : T.npc = {
    id: "chestIMG",
    file: '/assets/gen_specialchest.gif',
    x: 0,
    y: 0,
    angle: 0,
    scale: new Float32Array([1.,1.]),
    texture: Render.createTexture(Assets.getImage('chest') as HTMLImageElement)
  }
  let bigH : T.npc = {
    id: "bigH",
    file: '/assets/admintable.png',
    x: 512,
    y: 512,
    angle: 0,
    scale: new Float32Array([1.,1.]),
    texture: Render.createTexture(Assets.getImage('bigH') as HTMLImageElement)
  }

  let dummy: {[layer:number]: Array<T.npc>} = {
    0: [cellR],
    1: cell.npcs
  }
  
  let times: T.renderableBatch = ShaderProgramsHelper.createClassicBatch(dummy, Render.getShader('fallbackShader'))
  
  Render.gameRenderables = {
    all:{0 : [times]}}
  

  Render.renderAll()

  // Assets.save()

  // Render.createShader('mainShader', Assets.getText('mainVert'), Assets.getText('mainFrag'))


  // Render.main()
  // Render.renderALevel(cell, 16, 64)

}
Render.init()

init()

