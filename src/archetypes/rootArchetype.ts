import * as T from '../utils/cells/type'
import * as P from './properties';
/**
 * Archetypes are property sets
 */
export default class Archetype {
  protected static suggestedShader :string = ''

  public properties : Map<P.Prop,any> = new Map<P.Prop,any>()

  // constructor(){
  // }

  public static useShader(gameobject: T.gameobject){
    gameobject.shaderID = this.suggestedShader
  }

  /**
   * The left arguments will have their properties crushed by
   * every dupe property found on the left.  
   * Also, a new generic archetype will be created and returned
   * @returns `new Archetype(mergedPoperties)`
   */
  public static mergeArchetypes(aArch : Array<Archetype>): Archetype{
    let pr : Map<P.Prop,any> = new Map<P.Prop,any>()
    for(const a in aArch){
      pr = 
      // new Map([...pr,...aArch[a].properties])
      Archetype.merge(pr, aArch[a].properties)
    }
    let arch = new Archetype()
    arch.properties = pr;
    return arch
  }
  // LET'S NOT USE MAPs EXPLICITLY BZCUZ IT COMPLAINS!!

  private static merge(currArch:Map<P.Prop,any>, nextArch:Map<P.Prop,any>){
    for(const pr in nextArch){
      currArch[pr] = nextArch[pr]
    }
    return currArch
  }

  // private static ArchTypes: {[name:string]:{[name:string]:any}} = {
  //   selectable: {
      
  //   }
  // }
  
  // public properties: {[name:string]:any}


  // // T.gameobject, string => T.gameobject
  // // Check for shaderID overwrite
  // constructor(combination:string[]){

  //   for(const i in combination){
  //     switch(combination[i]){
  //       case '':{

  //         break
  //       }
  //     }
  //   }
  // }


}