import * as T from './utils/cells/type'
import Assets from "./assets"

import Globals from "./globals"

let gameWidth = () => {
  return Globals.getGameWidth()
}
let gameHeight = () => {
  return Globals.getGameHeight()
}

export class Render {
  private static gl: WebGLRenderingContext

  public static getContext: () => WebGLRenderingContext = () => {return Render.gl}

  private static fallbackShader: boolean
  public static level: WebGLTexture

  public static gameRenderables : T.renderables
  private static uiRenderables : T.renderables

  private static positions = new Float32Array([
    0, 1, 1, 1, 1, 0, // Triangle 1
    0, 1, 1, 0, 0, 0  // Triangle 2
  ]);;

  public static init(): void{
    Render.gl = ((): WebGLRenderingContext => {
      document.querySelector("body").appendChild(
        ((): Node => {
          let cnvs = document.createElement("canvas")
          cnvs.setAttribute("width", gameWidth().toString())
          cnvs.setAttribute("height", gameHeight().toString())
          return cnvs
        })())
    
      let ctx : WebGLRenderingContext =  document.querySelector("canvas").
      getContext("webgl",
        {premultipliedAlpha: false}
        )
      ctx.enable(ctx.BLEND);
      ctx.blendFunc(ctx.SRC_ALPHA, ctx.ONE_MINUS_SRC_ALPHA);
      return ctx
    })()

    Render.fallbackShader = ((): boolean =>{
      try {
        let vertexShaderSource = document.getElementById("tex-vertex-shader").textContent
        let fragmentShaderSource = document.getElementById("tex-fragment-shader").textContent
        return Render.GLSLinterpreter.createShader("fallbackShader", vertexShaderSource, fragmentShaderSource)
      } catch {
        console.debug("Could not create fallback shader. Info missing in html page.")
        return false
      }
    })()
  }

  private static shaders: { [id: string] : WebGLProgram} = {}

  public static getShader (id: string) : WebGLProgram{
    if(Object.keys(Render.shaders).indexOf(id) < 0){
      if(Render.fallbackShader) return Render.shaders['fallbackShader']
      else console.debug("Couldn't use fallback shader")
    } else return Render.shaders[id]
  }

  public static createShader(id:string, vertex: string, fragment: string): boolean {
    return Render.GLSLinterpreter.createShader(id, vertex, fragment)
  }

  public static createTexture(assetID: string) : WebGLTexture { 
    let img : HTMLImageElement = Assets.getImage(assetID)
    let tex : WebGLTexture = Render.createTexToBlitOn(img.width,img.height)

    Render.gl.bindTexture(Render.gl.TEXTURE_2D, tex)
    Render.gl.texImage2D(Render.gl.TEXTURE_2D, 0, Render.gl.RGBA, Render.gl.RGBA, Render.gl.UNSIGNED_BYTE, img)
    return tex
  }

  public static createALevel(cell: T.Cell) : T.renderableWProps{
    let tileTex : WebGLTexture = Render.createTexture(cell.tileset)

    const framebuffer : WebGLFramebuffer = Render.gl.createFramebuffer()
    Render.gl.bindFramebuffer(Render.gl.FRAMEBUFFER, framebuffer)
    
    let cellTex : WebGLTexture = Render.createTexToBlitOn(cell.tileSize*cell.tileWidth,cell.tileSize*cell.tileHeight)
    Render.gl.framebufferTexture2D(Render.gl.FRAMEBUFFER, Render.gl.COLOR_ATTACHMENT0, Render.gl.TEXTURE_2D, tileTex, 0)
    Render.gl.bindTexture(Render.gl.TEXTURE_2D, cellTex)
    
    for(let i = 0; i < cell.tiles.length; i++){
      Render.gl.copyTexSubImage2D(Render.gl.TEXTURE_2D, 0,
        (i%cell.tileWidth) * cell.tileSize,
        Math.floor(i/cell.tileWidth) * cell.tileSize, 
        cell.tiles[i]['frameX'],
        cell.tiles[i]['frameY'],
        cell.tileSize,cell.tileSize)
        // Math.round((i%cellTileWH) / tileSize), Math.round((i / cellTileWH) / tileSize), aCellTile[i]['frameX'], aCellTile[i]['frameY'],tileSize,tileSize)
      }
    Render.gl.deleteFramebuffer(framebuffer)
    return {
      id: "level:"+cell.fileName+"\\"+(Render.createUUID()),
      x: 29,
      y: 0,
      width: cell.tileSize*cell.tileWidth,
      height: cell.tileSize*cell.tileHeight,
      scale: new Float32Array([1.,1.]),
      angle: 0,
      texture: cellTex
    }
  }

  private static currentIndex = 0
  public static createUUID(): string {
    this.currentIndex+=1
    return (this.currentIndex).toString()
  }



  public static renderAll(){
    Render.gl.clearColor(0, 0.5, 0, 1);
    Render.gl.clear(Render.gl.COLOR_BUFFER_BIT);

    let vbuffer = Render.gl.createBuffer();
    Render.gl.bindBuffer(Render.gl.ARRAY_BUFFER, vbuffer);
    Render.gl.bufferData(Render.gl.ARRAY_BUFFER, Render.positions, Render.gl.STATIC_DRAW);

    
    for(let layer in Object.fromEntries(Object.entries(Render.gameRenderables.all).sort((a,b)=> Number(a)-Number(b)))){
      for(let rb in Render.gameRenderables.all[layer]){
        Render.renderBatch(Render.gameRenderables.all[layer][rb])
      }
    }
    
    // for(let layer in Object.fromEntries(Object.entries(Render.uiRenderables.all).sort((a,b)=> Number(a)-Number(b)))){
    //   for(let rb in Render.uiRenderables.all[layer]){
    //     Render.renderBatch(Render.uiRenderables.all[layer][rb])
    //   }
    // }


  }
  
  /**
   *  This function contains a race condition timebomb
   *  see Render.createTexture
   */
  private static renderBatch(batch : T.renderableBatch){
    Render.gl.useProgram(batch.shader.program)
    
    for(let layer in Object.fromEntries(Object.entries(batch.r).sort((a,b)=> Number(a)-Number(b)))){
      for(let re in batch.r[layer]){
        Render.gl.bindTexture(Render.gl.TEXTURE_2D, batch.r[layer][re].texture)
        
        for(let a in Object.fromEntries(Object.entries(batch.passes).sort((a,b)=> Number(a)-Number(b)))){
          batch.passes[Number(a)].fnct(batch,Number(layer),batch.r[layer][re],gameWidth(),gameHeight())
        }
        Render.gl.drawArrays(Render.gl.TRIANGLES, 0, 6);

      }
    }
  }


  /**
   * Assumes clamptoborder = true
   */
  private static createTexToBlitOn(width: number, height: number): WebGLTexture {
    const targetTexture = Render.gl.createTexture()
    Render.gl.bindTexture(Render.gl.TEXTURE_2D, targetTexture);

    // let empty = new Uint8Array((width+2)*(height+2)*4)
    // console.log(empty)

    Render.gl.texImage2D(Render.gl.TEXTURE_2D, 0,  Render.gl.RGBA, 
                          // Clamp to border fix (+2)
                          // width + 2, height + 2, 
                          width, height, 
                          0, Render.gl.RGBA, Render.gl.UNSIGNED_BYTE,
                          null)

    Render.gl.texParameteri(Render.gl.TEXTURE_2D, Render.gl.TEXTURE_MIN_FILTER, Render.gl.LINEAR)
    Render.gl.texParameteri(Render.gl.TEXTURE_2D, Render.gl.TEXTURE_WRAP_S, Render.gl.CLAMP_TO_EDGE)
    Render.gl.texParameteri(Render.gl.TEXTURE_2D, Render.gl.TEXTURE_WRAP_T, Render.gl.CLAMP_TO_EDGE)
    return targetTexture;
  }

  private static GLSLinterpreter = class {

    // public
    static createShader(shaderID: string, vertexSource: string, fragmentSource: string): boolean{    
      try{
        let vertexShader = Render.GLSLinterpreter.compileShader(Render.gl.VERTEX_SHADER, vertexSource)
        let fragmentShader = Render.GLSLinterpreter.compileShader(Render.gl.FRAGMENT_SHADER, fragmentSource)
        Render.shaders[shaderID] = Render.GLSLinterpreter.createProgram(vertexShader, fragmentShader)
        return true
      } catch {
        return false;
      }
    }

    // private
    static compileShader(type, source): WebGLShader {
      let shader = Render.gl.createShader(type)
      Render.gl.shaderSource(shader, source)
      Render.gl.compileShader(shader)
      let success: boolean = Render.gl.getShaderParameter(shader, Render.gl.COMPILE_STATUS)
      if (success) return shader
    
      console.debug(Render.gl.getShaderInfoLog(shader))
      Render.gl.deleteShader(shader)
    }

    // private
    static createProgram(vertexShader, fragmentShader): WebGLProgram {
      let program = Render.gl.createProgram()
      Render.gl.attachShader(program, vertexShader)
      Render.gl.attachShader(program, fragmentShader)
      Render.gl.linkProgram(program)
      let success = Render.gl.getProgramParameter(program, Render.gl.LINK_STATUS)
      if (success) return program
    
      console.debug(Render.gl.getProgramInfoLog(program))
      Render.gl.deleteProgram(program)
    }

  }

  public static Matrix = class {
    // Taken from www.webglfundamentals.com or something
    // TODO
    
    static orthographic(left, right, bottom, top, near, far, dst = new Float32Array(16)) {
  
      dst[ 0] = 2 / (right - left);
      dst[ 1] = 0;
      dst[ 2] = 0;
      dst[ 3] = 0;
      dst[ 4] = 0;
      dst[ 5] = 2 / (top - bottom);
      dst[ 6] = 0;
      dst[ 7] = 0;
      dst[ 8] = 0;
      dst[ 9] = 0;
      dst[10] = 2 / (near - far);
      dst[11] = 0;
      dst[12] = (left + right) / (left - right);
      dst[13] = (bottom + top) / (bottom - top);
      dst[14] = (near + far) / (near - far);
      dst[15] = 1;
  
      return dst;
    }

    static scale(m, sx, sy, sz, dst = new Float32Array(16)) {
  
      dst[ 0] = sx * m[0 * 4 + 0];
      dst[ 1] = sx * m[0 * 4 + 1];
      dst[ 2] = sx * m[0 * 4 + 2];
      dst[ 3] = sx * m[0 * 4 + 3];
      dst[ 4] = sy * m[1 * 4 + 0];
      dst[ 5] = sy * m[1 * 4 + 1];
      dst[ 6] = sy * m[1 * 4 + 2];
      dst[ 7] = sy * m[1 * 4 + 3];
      dst[ 8] = sz * m[2 * 4 + 0];
      dst[ 9] = sz * m[2 * 4 + 1];
      dst[10] = sz * m[2 * 4 + 2];
      dst[11] = sz * m[2 * 4 + 3];
  
      if (m !== dst) {
        dst[12] = m[12];
        dst[13] = m[13];
        dst[14] = m[14];
        dst[15] = m[15];
      }
  
      return dst;
    }
  
    static translate(m, tx, ty, tz, dst = new Float32Array(16)) {
  
      var m00 = m[0];
      var m01 = m[1];
      var m02 = m[2];
      var m03 = m[3];
      var m10 = m[1 * 4 + 0];
      var m11 = m[1 * 4 + 1];
      var m12 = m[1 * 4 + 2];
      var m13 = m[1 * 4 + 3];
      var m20 = m[2 * 4 + 0];
      var m21 = m[2 * 4 + 1];
      var m22 = m[2 * 4 + 2];
      var m23 = m[2 * 4 + 3];
      var m30 = m[3 * 4 + 0];
      var m31 = m[3 * 4 + 1];
      var m32 = m[3 * 4 + 2];
      var m33 = m[3 * 4 + 3];
  
      if (m !== dst) {
        dst[ 0] = m00;
        dst[ 1] = m01;
        dst[ 2] = m02;
        dst[ 3] = m03;
        dst[ 4] = m10;
        dst[ 5] = m11;
        dst[ 6] = m12;
        dst[ 7] = m13;
        dst[ 8] = m20;
        dst[ 9] = m21;
        dst[10] = m22;
        dst[11] = m23;
      }
  
      dst[12] = m00 * tx + m10 * ty + m20 * tz + m30;
      dst[13] = m01 * tx + m11 * ty + m21 * tz + m31;
      dst[14] = m02 * tx + m12 * ty + m22 * tz + m32;
      dst[15] = m03 * tx + m13 * ty + m23 * tz + m33;
  
      return dst;
    }
  }
}

export default Render
