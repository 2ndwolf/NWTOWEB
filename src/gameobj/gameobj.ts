import Assets from '../core/assets'
import Render from '../core/render'

import Globals from "../core/globals"
import * as T from '../core/type'
import * as P from '../archetypes/properties'

import * as NeW from "./cells/NwParser"
import Archetype from '../archetypes/rootArchetype'
import EditorElement from '../archetypes/editorElements/editorElement'
import NPC from '../archetypes/npcs/npc'


export default class GameObj {
  public static async fileToTex(file: string): Promise<T.Tex> {
    const spl : Array<string> = file.split('/')
    let assets : {[name:string]:string} = {}
    assets[spl[spl.length-1]] = file
    await Assets.loadAssets(assets)
    return Render.createTexture(await Assets.getImage(spl[spl.length-1]))
  }

  public static async loadAsync():Promise<void>{
    let cell : T.Cell = NeW.default.parseCell('anotherFUNid', await Assets.getText('cellFile'))
    // cell = expandNPCs
  
    let assetPromises: Array<Promise<void>> = []
  
    for(const n in cell.npcs){
      cell.npcs[n].archetype = Archetype.mergeArchetypes([new NPC, new EditorElement])
      cell.npcs[n].archetype.properties[P.go.alignToGrid] = [16,16]
      assetPromises.push(new Promise (async resolve=>{
        cell.npcs[n].texture = await GameObj.fileToTex(Globals.getOrigin()+"/assets/"+cell.npcs[n].file)
        resolve()
      }))
    }
  
    await Promise.all(assetPromises)
  
    let cellR : T.gameobject = await Render.createALevel('funID', cell)
  
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