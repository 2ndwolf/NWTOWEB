import Render from "./render"
import Assets from "./assets"
import Mouse from "./mouse"
import * as T from './utils/cells/type'
import DefaultShaders from './defaultShaders'
import GameObj from './gameobj'


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

  GameObj.loadAsync()

  Render.startRendering()

} 
// Render.init()

init()

