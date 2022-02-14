import Assets from './assets'
import Render from './render'

import Globals from "./globals"
import * as T from './utils/cells/type'

import * as NeW from "./utils/cells/NwParser"


export default class GameObj {
  public static async fileToTex(file: string): Promise<T.Tex> {
    const spl : Array<string> = file.split('/')
    let assets : {[name:string]:string} = {}
    assets[spl[spl.length-1]] = file
    await Assets.loadAssets(assets)
    return Render.createTexture(Assets.getImage(spl[spl.length-1]))
  }

  public static async loadAsync():Promise<void>{
    let cell : T.Cell = NeW.default.parseCell('anotherFUNid', Assets.getText('cellFile'))
    // cell = expandNPCs
  
    let assetPromises: Array<Promise<void>> = []
  
    for(let n in cell.npcs){
      cell.npcs[n].properties = {}
      cell.npcs[n].properties['alignedToGrid'] = [16,16]
      assetPromises.push(new Promise (async resolve=>{
        cell.npcs[n].texture = await GameObj.fileToTex(Globals.getOrigin()+"/assets/"+cell.npcs[n].file)
        resolve()
      }))
    }
  
    await Promise.all(assetPromises)
  
    let cellR : T.gameobject = Render.createALevel('funID', cell)
  
    // Sort batch members by filename 
    // and ensure that batch particles that use the same texture don't bind twice
    let renderableBatch: T.renderableBatch = {
      r: {
        0: {cell:cellR},
        1: cell.npcs,
      },
      x:0,
      y:0
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
  
  }
}