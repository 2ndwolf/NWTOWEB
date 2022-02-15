import * as T from '../core/type'
import * as P from './properties'

/**
 * Archetypes are property sets
 */
export default class Archetype {
  protected static suggestedShader :string = ''
  public static defaultProperties : {[property:string]:any} = {}

  public properties :  {[property:string]:any} = {}

  constructor(){
    this.properties = Archetype.merge(this.properties, Archetype.defaultProperties)
  }

  // public static useShader(gameobject: T.gameobject){
  //   gameobject.shaderID = this.suggestedShader
  // }

  /**
   * The left arguments will have their properties crushed by
   * every dupe property found after.  
   * Also, a new generic archetype will be created and returned
   * @returns `new Archetype()` with merged properties
   */
  public static mergeArchetypes(aArch : Array<Archetype>): Archetype{
    let pr :  {[property:string]:any} = aArch[0].properties
    for(let a = 1; a < aArch.length; a++){
      pr = Archetype.merge(pr, aArch[a].properties)
    }
    let arch = new Archetype()
    arch.properties = pr;
    return arch
  }

  protected static merge(currArch: {[property:string]:any}, nextArch: {[property:string]:any}):  {[property:string]:any}{
    for(const pr in nextArch){
      currArch[pr] = nextArch[pr]
    }
    return currArch
  }

}