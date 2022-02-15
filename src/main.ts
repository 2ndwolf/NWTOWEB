import Render from "./core/render"
import Assets from "./core/assets"
import Mouse from "./mouse/mouse"
import MouseExt from "./mouse/mouseExt"
import * as T from './core/type'
import * as Shaders from './core/defaultShaders'
import GameObj from './utils/gameobj'

import Selector from './archetypes/editorElements/selector'
import Globals from "./core/globals"
import * as P from "./archetypes/properties"

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
  assetsToLoad['gridVert'] = Globals.getOrigin()+'/shaders/selection.vert'
  assetsToLoad['gridFrag'] = Globals.getOrigin()+'/shaders/selection.frag'
  await Assets.loadAssets(assetsToLoad)

  Render.init()

  let shd : Shaders.fallbackShader = new Shaders.fallbackShader('selector')
  shd.vertex = Assets.getText('gridVert')
  shd.fragment = Assets.getText('gridFrag')
  shd.passes.push((self: T.renderableBatch, layer: T.Layer, currentRenderable: T.gameobject, targetWidth: number, targetHeight: number, shader: T.Shader)=>{

    const shaderProps : Array<string> = Object.values(P.u).toString().split(',')
    
    for(const prop in currentRenderable.archetype?.properties){
      if(shaderProps.includes(prop)){
        console.log(prop)

        Render.getContext().uniform4fv(Render.getContext().getUniformLocation(shader.program, prop), 
        new Float32Array(currentRenderable.archetype.properties[prop]));
        
      }
    }
    
    Render.getContext().uniform2fv(Render.getContext().getUniformLocation(shader.program, "gameWH"), 
    new Float32Array([targetWidth, targetHeight]));
  });

  console.log(shd.passes)

  let thang : T.renderableBatch = {
    r: {
      0: {
        fx: {
          x: 0,
          y: 0,
          texture: {
            width: 1024,
            height: 1024
          },
          archetype: new Selector()
        },
      }
    },
    unclickable: true,
    shaderID: 'selector',
    x: 0,
    y: 0
  }
  
  MouseExt.addSelector(thang.r[0].fx)
  
  let lyr : T.Layer = {
    members:{fx:thang},
    x: 0,
    y: 0,
    scale: new Float32Array([1.,1.]),
    angle: 0
  }


  const RDRtomerge : T.renderables = {
    all:{3:lyr}
  }



  Render.mergeToRenderable(RDRtomerge, T.renderableTypes.gameobject)

  Shaders.DefaultShaders.initShaders()
  shd.compile()
  MouseExt.use()

  GameObj.loadAsync()

  Render.startRendering()

} 
// Render.init()

init()

