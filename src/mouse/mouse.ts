import * as T from '../utils/cells/type'
import Render from '../render'
import * as P from '../archetypes/properties'


export default class Mouse {
  protected static State = class {
    public static released : number = -1
    public static rMoving : number = 0
    public static down : number = 1
    public static dMoving : number = 2
  }

  protected static state : number = -1
  protected static currentMouseDown : T.gameobject = undefined
  protected static selectionOrigin : Array<number> = [-1,-1]
  protected static clickPos : Array<number> = [-1,-1]
  protected static selector : T.gameobject = {x:0,y:0}
  protected static previousClick : T.gameobject = undefined

  public static use(){
    document.addEventListener("mousemove", Mouse.mouseMove);
    document.addEventListener("mousedown", Mouse.mouseDown);
    document.addEventListener("mouseup", Mouse.mouseUp);
    // document.addEventListener("dblclick", Mouse.doubleClick);
    // document.addEventListener('contextmenu', Mouse.captureRightClick, false);    
  }

  public static addThang(thang:T.gameobject){
    Mouse.selector = thang;
  }

  protected static mouseMove(e){
    if(Mouse.state == Mouse.State.down) Mouse.state = Mouse.State.dMoving
    if(Mouse.state == Mouse.State.released) Mouse.state = Mouse.State.rMoving

    // if(Mouse.state == 2){

    // }
  }

  protected static mouseDown(e){
    Mouse.state = Mouse.State.down

    Mouse.previousClick = Mouse.currentMouseDown
    Mouse.currentMouseDown = Mouse.getByPos(e.clientX, e.clientY)

    Mouse.selectionOrigin = [Mouse.currentMouseDown.x,Mouse.currentMouseDown.y]
    Mouse.clickPos = [e.clientX,e.clientY]
  }

  protected static mouseUp(e){
    // console.log(e.clientX)
    // Mouse.selectedNPC = undefined
    // Mouse.clickPos = [e.clientX,e.clientY]
    Mouse.state = Mouse.State.released
  }

  protected static getByPos = (x: number, y: number) : T.gameobject => {
    let sorted1 = Object.keys(Render.gameRenderables.all).sort((a,b)=>Number(b)-Number(a))
    for(let layer in sorted1){
      for(let batch in Render.gameRenderables.all[sorted1[layer]].members){
        let sorted2 = Object.keys(Render.gameRenderables.all[sorted1[layer]].members[batch].r).sort((a,b)=> Number(b) - Number(a))
        for(let bLayer in sorted2){
          // console.log(sorted2[bLayer])
          for(let npc in Render.gameRenderables.all[sorted1[layer]].members[batch].r[sorted2[bLayer]]){
            const me : T.gameobject = Render.gameRenderables.all[sorted1[layer]].members[batch].r[sorted2[bLayer]][npc]
            if(Mouse.inBounds(me.x,me.y,me.texture.width,me.texture.height,x,y)){
              if(!me.archetype?.properties[P.go.unclickable]) return me
            }
          }
        }
      }
    }
  }

  protected static inBounds(x, y, width, height, touchX, touchY) {
    if (touchX > x &&
      touchX < x + width &&
      touchY > y &&
      touchY < y + height) {
      return true;
    }
    return false;
  }

}