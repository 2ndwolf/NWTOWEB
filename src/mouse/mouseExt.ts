import * as T from '../utils/cells/type'
import * as P from '../archetypes/properties'
import Mouse from './mouse'


export default class MouseExt extends Mouse {

  public static use(){
    document.addEventListener("mousemove", MouseExt.mouseMove);
    document.addEventListener("mousedown", MouseExt.mouseDown);
    document.addEventListener("mouseup", MouseExt.mouseUp);
    // document.addEventListener("dblclick", Mouse.doubleClick);
    // document.addEventListener('contextmenu', Mouse.captureRightClick, false);    
  }
  
  protected static mouseMove(e){
    super.mouseMove(e)
    if(Mouse.state == Mouse.State.dMoving){
    // MOVE STUFF AROUND!
      if(Mouse.currentMouseDown?.archetype?.properties[P.go.alignToGrid] !== undefined){
        Mouse.currentMouseDown.x = Math.round((Mouse.selectionOrigin[0]+e.clientX-Mouse.clickPos[0]) / 
                              Mouse.currentMouseDown.archetype?.properties[P.go.alignToGrid][0]) * Mouse.currentMouseDown.archetype?.properties[P.go.alignToGrid][0]
        Mouse.currentMouseDown.y = Math.round((Mouse.selectionOrigin[1]+e.clientY-Mouse.clickPos[1]) /
                              Mouse.currentMouseDown.archetype?.properties[P.go.alignToGrid][1]) * Mouse.currentMouseDown.archetype?.properties[P.go.alignToGrid][1]
      } else {
        Mouse.currentMouseDown.x = (Mouse.selectionOrigin[0]+e.clientX-Mouse.clickPos[0])
        Mouse.currentMouseDown.y = (Mouse.selectionOrigin[1]+e.clientY-Mouse.clickPos[1])
      }

      // USE THE SELECTION LAYER TO DISPLAY BORDERS! WOAH!
      if(Mouse.currentMouseDown != undefined){
        if(Mouse.selector.archetype?.properties[P.u.selection] !== undefined){
          console.log(Mouse.currentMouseDown.x)
          Mouse.selector.archetype.properties[P.u.selection][0] = (Mouse.currentMouseDown.x)/* /(1024/2))-1 */
          Mouse.selector.archetype.properties[P.u.selection][1] = (Mouse.currentMouseDown.y)/* /(1024/2))-1 */
        }
      }
    }
  }

  protected static mouseDown(e){
    super.mouseDown(e)


    if(Mouse.selector?.archetype?.properties[P.u.selection] !== undefined){
      Mouse.selector.archetype.properties[P.u.selection] = [0,0,0,0]
    }

    if(Mouse.selector.archetype?.properties[P.u.selection] !== undefined){
      Mouse.selector.archetype.properties[P.u.selection] = [
        ((Mouse.currentMouseDown.x))           /* /(1024/2))-1 */,
        ((Mouse.currentMouseDown.y))           /* /(1024/2))-1 */,
        (Mouse.currentMouseDown.texture.width) /* /(1024/2))   */,
        (Mouse.currentMouseDown.texture.height)/* /(1024/2))   */]
    }

  }
}
