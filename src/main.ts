import Render from "./render"
import Assets from "./assets"
import Mouse from "./mouse"
import * as NeW from "./utils/cells/NwParser"
import * as T from './utils/cells/type'
import DefaultShaders from './defaultShaders'


import Globals from "./globals"

const getByID = (id:string) : T.gameobject => {
  let spl = id.split(':')
  if(spl[0]=="npc"){
    for(let layer in Render.gameRenderables.all){
      for(let batch in Render.gameRenderables.all[layer]){
        for(let bLayer in Render.gameRenderables.all[layer][batch]){
          for(let npc in Render.gameRenderables.all[layer][batch][bLayer]){
            if(Render.gameRenderables.all[layer][batch][bLayer][npc].id.split("\\")[0] == id){
              return Render.gameRenderables.all[layer][batch][bLayer][npc]
            }
          }
        }
      }
    }
  }
}



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
  DefaultShaders.initShaders()
  Mouse.init()

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

  let cellR : T.gameobject = Render.createALevel('funID', cell)

  let renderableBatch: T.renderableBatch = {
    r: {
      0: {cell:cellR},
      1: cell.npcs,
    }
  }
  
  let lyr : T.Layer = {
    members:{npcs:renderableBatch},
    x: 0,
    y: 0,
    scale: new Float32Array([1.,1.]),
    angle: 0
  }

  const RDRtomerge : T.renderables = {
    all:{0:lyr}
  }

  Render.mergeToRenderable(RDRtomerge, T.renderableTypes.gameobject)

  Render.renderAll()

} 
// Render.init()

init()

