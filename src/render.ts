import * as T from './utils/cells/type'
import Assets from "./assets"
import DefaultShaders from "./sPrograms"

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
  
  public static shaderForFallback: string = 'fallbackShader'
  public static level: WebGLTexture
  
  public static gameRenderables : T.renderables = {all:{}}
  private static uiRenderables : T.renderables
  
  private static positions = new Float32Array([
    // 1, 0, 0, 0, 0, 1, // Triangle 1
    // 1, 0, 0, 1, 1, 1  // Triangle 2
    1, 0, 0, 0, 0, 1, // Triangle 1
    1, 0, 0, 1, 1, 1  // Triangle 2
    // 1, -1, -1, -1, -1, 1, // Triangle 1
    // 1, -1, -1, 1, 1, 1  // Triangle 2
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

    try{
      DefaultShaders?.initShaders()
    } catch {
      console.log("Could not initialize all default shaders...")
    }

    Render.vbuffer = Render.gl.createBuffer();
    Render.gl.bindBuffer(Render.gl.ARRAY_BUFFER, Render.vbuffer);
    Render.gl.bufferData(Render.gl.ARRAY_BUFFER, Render.positions, Render.gl.STATIC_DRAW);
    Render.gl.clearColor(0, 0.5, 0, 1);

  }

  public static mergeToRenderable = (renderable:T.renderables, type:T.renderableTypes)=>{
    console.log(renderable)
    switch(type){
      case T.renderableTypes.gameobject:{
        Render.mergeRenderables(renderable, Render.gameRenderables)
        break
      }
    }
  }

  public static mergeRenderables = (renderableInput: T.renderables, sourceRenderable: T.renderables)=>{
    for(let a in renderableInput.all){
      // console.log(renderableInput)
      let index = 0
      while(sourceRenderable.all.hasOwnProperty(a+index)){
        index += Number.MIN_VALUE
      }
      sourceRenderable.all[a+index] = renderableInput.all[a]
    }
  }


  private static shaders: {[name:string]:T.Shader} = {}

  public static getShader (id: string = '') : T.Shader{
    let shader : T.Shader = Render.shaders[id] || Render.shaders[Render.shaderForFallback] || undefined
    if(shader===undefined){
      console.log("Shader "+id+" doesn't exist and couldn't find fallback shader "+Render.shaderForFallback)
    }
    return shader
  }

  // public static createShader(id:string, vertex: string, fragment: string): boolean {
  //   return Render.GLSLinterpreter.createShader(id, vertex, fragment)
  // }

  public static createTexture(img: HTMLImageElement) : T.Tex { 
    // let img : HTMLImageElement = Assets.getImage(assetID).data as HTMLImageElement
    let tex : WebGLTexture = Render.createTexToBlitOn(img.width,img.height)

    Render.gl.bindTexture(Render.gl.TEXTURE_2D, tex)
    Render.gl.texImage2D(Render.gl.TEXTURE_2D, 0, Render.gl.RGBA, Render.gl.RGBA, Render.gl.UNSIGNED_BYTE, img)
    return {
      image: tex,
      width: img.width,
      height: img.height
    }
  }

  public static createALevel(id : string, cell: T.Cell) : T.gameobject{
    let tileTex : T.Tex = Render.createTexture(Assets.getImage(cell.tileset))

    const framebuffer : WebGLFramebuffer = Render.gl.createFramebuffer()
    Render.gl.bindFramebuffer(Render.gl.FRAMEBUFFER, framebuffer)
    
    let cellTex : WebGLTexture = Render.createTexToBlitOn(cell.tileSize*cell.tileWidth,cell.tileSize*cell.tileHeight)
    Render.gl.framebufferTexture2D(Render.gl.FRAMEBUFFER, Render.gl.COLOR_ATTACHMENT0, Render.gl.TEXTURE_2D, tileTex.image, 0)
    Render.gl.bindTexture(Render.gl.TEXTURE_2D, cellTex)
    
    for(let i = 0; i < cell.tiles.length; i++){
      Render.gl.copyTexSubImage2D(Render.gl.TEXTURE_2D, 0,
        (i%cell.tileWidth) * cell.tileSize,
        Math.floor(i/cell.tileWidth) * cell.tileSize, 
        cell.tiles[i]['frameX'],
        cell.tiles[i]['frameY'],
        cell.tileSize,cell.tileSize)
      }
    Render.gl.deleteFramebuffer(framebuffer)
    return {
      // id: "levelprt::"+id+"\\"+(Render.createUUID()),
      file: "",
      x: 0,
      y: 0,
      scale: new Float32Array([1.,1.]),
      angle: 0,
      texture: {
        image: cellTex,
        width: cell.tileSize * cell.tileWidth,
        height: cell.tileSize * cell.tileWidth
      }
    }
  }

  private static lastShader : string = ''
  private static shader: T.Shader 
  private static vbuffer: WebGLBuffer

  public static renderAll(){
    Render.gl.clear(Render.gl.COLOR_BUFFER_BIT);

    const sorted = Object.keys(Render.gameRenderables.all).sort((a,b)=>Number(a)-Number(b))

    for(let layer in sorted){
      for(let rb in Render.gameRenderables.all[sorted[layer]].members){
        const currentShader = Render.gameRenderables.all[sorted[layer]].members[rb]
        if(Render.lastShader===currentShader) {}
        else Render.shader = Render.shaders[currentShader] || Render.shaders[Render.shaderForFallback] || undefined
        if(Render.shader != undefined){
          Render.gl.useProgram(Render.shader.program)
          Render.renderBatch(Render.gameRenderables.all[sorted[layer]].members[rb], Render.shader)
        }
        Render.lastShader = currentShader
      }
    }
    
    // for(let layer in Object.fromEntries(Object.entries(Render.uiRenderables.all).sort((a,b)=> Number(a)-Number(b)))){
    //   for(let rb in Render.uiRenderables.all[layer]){
    //     Render.renderBatch(Render.uiRenderables.all[layer][rb])
    //   }
    // }

    requestAnimationFrame(Render.renderAll)
  }
  
  private static renderBatch(batch : T.renderableBatch, shader: T.Shader){

    const sorted1 = Object.keys(batch.r).sort((a,b)=>Number(a)-Number(b))
    for(let layer in sorted1){
      for(let re in batch.r[sorted1[layer]]){
        Render.gl.bindTexture(Render.gl.TEXTURE_2D, batch.r[sorted1[layer]][re].texture.image)
        
        const sortedPasses = Object.keys(shader.passes).sort((a,b)=>Number(a)-Number(b))
        for(let a in sortedPasses){
          shader.passes[sortedPasses[a]](batch,batch.r[sorted1[layer]],batch.r[sorted1[layer]][re],gameWidth(),gameHeight(),shader)          
        }
        Render.gl.drawArrays(Render.gl.TRIANGLES, 0, 6);

      }
    }
  }


  private static createTexToBlitOn(width: number, height: number): WebGLTexture {
    const targetTexture = Render.gl.createTexture()
    Render.gl.bindTexture(Render.gl.TEXTURE_2D, targetTexture);

    Render.gl.texImage2D(Render.gl.TEXTURE_2D, 0, Render.gl.RGBA, 
                          width, height,
                          0, Render.gl.RGBA, Render.gl.UNSIGNED_BYTE,
                          null)

    Render.gl.texParameteri(Render.gl.TEXTURE_2D, Render.gl.TEXTURE_MIN_FILTER, Render.gl.LINEAR)
    Render.gl.texParameteri(Render.gl.TEXTURE_2D, Render.gl.TEXTURE_WRAP_S, Render.gl.CLAMP_TO_EDGE)
    Render.gl.texParameteri(Render.gl.TEXTURE_2D, Render.gl.TEXTURE_WRAP_T, Render.gl.CLAMP_TO_EDGE)
    return targetTexture;
  }

  public static createShader(vertexSource: string, fragmentSource: string, 
                      properties: {[propName: string]: T.shaderProp}, passes: {[num:number]: T.shaderPass}): T.Shader{  
    try{
      let vertexShader = Render.GLSLinterpreter.compileShader(Render.gl.VERTEX_SHADER, vertexSource)
      let fragmentShader = Render.GLSLinterpreter.compileShader(Render.gl.FRAGMENT_SHADER, fragmentSource)
      let program = Render.GLSLinterpreter.createProgram(vertexShader, fragmentShader)
      return {
        properties: properties,
        program : program,
        passes: passes
      }
    } catch {
      console.log("Shader creation unsuccessful")
    }
  }

  public static addShader(id: string, shader: T.Shader){
    Render.shaders[id] = shader
  }

  private static GLSLinterpreter = class {

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
