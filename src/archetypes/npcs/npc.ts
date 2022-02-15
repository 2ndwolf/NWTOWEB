import Archetype from '../rootArchetype'
import * as P from '../properties'

export default class NPC extends Archetype {
  // Overrides
  protected static suggestedShader :string = ''

  constructor(){
    super()
    Archetype.merge(this.properties, NPC.defaultProperties)
  }

  public static defaultProperties = {

  }

  // public properties : {[property:string]:any} = {}
}