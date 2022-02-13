import * as T from './utils/cells/type'
import Render from './render'



export default class Mouse {
  private static state : number = -1
  private static selectedNPC : T.gameobject = undefined
  private static selectionOrigin : Array<number> = [-1,-1]
  private static clickPos : Array<number> = [-1,-1]
  private static selector : T.gameobject = {x:0,y:0}

  public static init(){
    document.addEventListener("mousemove", Mouse.mouseMove);
    document.addEventListener("mousedown", Mouse.mouseDown);
    document.addEventListener("mouseup", Mouse.mouseUp);
    // document.addEventListener("dblclick", Mouse.doubleClick);
    // document.addEventListener('contextmenu', Mouse.captureRightClick, false);    
  }

  public static addThang(thang:T.gameobject){
    Mouse.selector = thang;
  }

  private static mouseMove(e){
    if(Mouse.state == 1) Mouse.state = 2
    if(Mouse.state == -1) Mouse.state = 0

    if(Mouse.state == 2){
      if(Mouse.selectedNPC != undefined){
        if(Mouse.selectedNPC.properties?.alignedToGrid !== undefined){
          Mouse.selectedNPC.x = Math.round((Mouse.selectionOrigin[0]+e.clientX-Mouse.clickPos[0]) / 
                                Mouse.selectedNPC.properties?.alignedToGrid[0]) * Mouse.selectedNPC.properties?.alignedToGrid[0]
          Mouse.selectedNPC.y = Math.round((Mouse.selectionOrigin[1]+e.clientY-Mouse.clickPos[1]) /
                                Mouse.selectedNPC.properties?.alignedToGrid[1]) * Mouse.selectedNPC.properties?.alignedToGrid[1]
        } else {
          Mouse.selectedNPC.x = (Mouse.selectionOrigin[0]+e.clientX-Mouse.clickPos[0])
          Mouse.selectedNPC.y = (Mouse.selectionOrigin[1]+e.clientY-Mouse.clickPos[1])
        }
        if(Mouse.selector.properties?.selection !== undefined){
          console.log(Mouse.selectedNPC.x)
          Mouse.selector.properties.selection[0] = (Mouse.selectedNPC.x)/* /(1024/2))-1 */
          Mouse.selector.properties.selection[1] = (Mouse.selectedNPC.y)/* /(1024/2))-1 */
        }
      }
    }
  }

  private static mouseDown(e){
    console.log(e.clientX)
    if(Mouse.selector?.properties?.selection !== undefined){
      Mouse.selector.properties['selection'] = [0,0,0,0]
    }
    Mouse.selectedNPC = Mouse.getByPos(e.clientX, e.clientY)

    if(Mouse.selector.properties?.selection !== undefined){
      Mouse.selector.properties.selection = [
        ((Mouse.selectedNPC.x))           /* /(1024/2))-1 */,
        ((Mouse.selectedNPC.y))           /* /(1024/2))-1 */,
        (Mouse.selectedNPC.texture.width) /* /(1024/2))   */,
        (Mouse.selectedNPC.texture.height)/* /(1024/2))   */]
    }
    Mouse.selectionOrigin = [Mouse.selectedNPC.x,Mouse.selectedNPC.y]
    Mouse.clickPos = [e.clientX,e.clientY]
    Mouse.state = 1
  }

  private static mouseUp(e){
    // console.log(e.clientX)
    // Mouse.selectedNPC = undefined
    // Mouse.clickPos = [e.clientX,e.clientY]
    Mouse.state = -1
  }

  private static getByPos = (x: number, y: number) : T.gameobject => {
    let sorted1 = Object.keys(Render.gameRenderables.all).sort((a,b)=>Number(b)-Number(a))
    for(let layer in sorted1){
      for(let batch in Render.gameRenderables.all[sorted1[layer]].members){
        let sorted2 = Object.keys(Render.gameRenderables.all[sorted1[layer]].members[batch].r).sort((a,b)=> Number(b) - Number(a))
        for(let bLayer in sorted2){
          // console.log(sorted2[bLayer])
          for(let npc in Render.gameRenderables.all[sorted1[layer]].members[batch].r[sorted2[bLayer]]){
            const me : T.gameobject = Render.gameRenderables.all[sorted1[layer]].members[batch].r[sorted2[bLayer]][npc]
            if(Mouse.inBounds(me.x,me.y,me.texture.width,me.texture.height,x,y)){
              if(!me.properties?.unclickable) return me
            }
          }
        }
      }
    }
  }

  private static inBounds(x, y, width, height, touchX, touchY) {
    if (touchX > x &&
      touchX < x + width &&
      touchY > y &&
      touchY < y + height) {
      return true;
    }
    return false;
  }

}