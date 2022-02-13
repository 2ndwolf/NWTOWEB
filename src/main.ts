import Render from "./render"
import Assets from "./assets"
import Mouse from "./mouse"
import * as T from './utils/cells/type'
import * as Shaders from './defaultShaders'
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
  assetsToLoad['gridVert'] = Globals.getOrigin()+'/shaders/selection.vert'
  assetsToLoad['gridFrag'] = Globals.getOrigin()+'/shaders/selection.frag'
  await Assets.loadAssets(assetsToLoad)

  Render.init()

  let shd : Shaders.fallbackShader = new Shaders.fallbackShader('funShader')
  shd.vertex = Assets.getText('gridVert')
  shd.fragment = Assets.getText('gridFrag')
  shd.passes[4] = (self: T.renderableBatch, layer: T.Layer, currentRenderable: T.gameobject, targetWidth: number, targetHeight: number, shader: T.Shader) => {
    // console.log(targetWidth)
    Render.getContext().uniform2fv(Render.getContext().getUniformLocation(shader.program, "gameWH"), 
    new Float32Array([targetWidth, targetHeight]));
    Render.getContext().uniform4fv(Render.getContext().getUniformLocation(shader.program, "selection"), 
    new Float32Array(currentRenderable.properties['selection']));
    Render.getContext().uniform4fv(Render.getContext().getUniformLocation(shader.program, "border"), 
    new Float32Array(currentRenderable.properties['border']));
    Render.getContext().uniform4fv(Render.getContext().getUniformLocation(shader.program, "uColor"), 
    new Float32Array(currentRenderable.properties['color']));
  }

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
          properties: {selection: [0,0,0,0], 
                       unclickable:true,
                       // [lineW, alignment
                       //  gap, pathing]
                      //  border:[4,1,8,4],
                      //  color: [1,1,1,1],
                       border:[8,1,10,2],
                       color:[0,1,1,1]
                    }
        },
      }
    },
    shaderID: 'funShader',
  }
  
  Mouse.addThang(thang.r[0].fx)
  
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
  Mouse.init()

  GameObj.loadAsync()

  Render.startRendering()

} 
// Render.init()

init()

