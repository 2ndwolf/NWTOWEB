import Archetype from '../rootArchetype'
import * as P from '../properties'

export default class EditorElement extends Archetype {
  // Overrides
  protected static suggestedShader :string = ''

  public static defaultProperties = {

  }

  public properties : Map<P.Prop, any> = new Map<P.Prop, any>()
}