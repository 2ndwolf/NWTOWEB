import EditorElement from "./editorElement"
// import * as T from '../../utils/cells/type'
import * as P from '../properties'
import Archetype from "../rootArchetype"

export default class selector extends EditorElement {
  // Overrides
  protected static suggestedShader :string = 'selector'

  constructor(){
    super()
    Archetype.merge(this.properties, selector.defaultProperties)
  }

  public static defaultProperties : {[property:string]:any} = {
    [P.u.selection]: [0,0,0,0], 
    [P.go.unclickable]:true,
    // [lineW, alignment
    //  gap, pathing]
    [P.u.border]:[4,1,2,2],
    [P.u.color]:[0,1,1,1]
  }

  // public properties : {[property:string]:any} = {}
}