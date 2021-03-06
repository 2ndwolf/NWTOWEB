import Archetype from '../rootArchetype'
import * as P from '../properties'

export default class EditorElement extends Archetype {
  // Overrides
  protected static suggestedShader :string = ''

  constructor(){
    super()
    Archetype.merge(this.properties, EditorElement.defaultProperties)
  }

  public static defaultProperties: {[property:string]:any} = {
    [P.go.alignToGrid] : [16,16]
  }

  // public properties : {[property:string]:any} = {}
}